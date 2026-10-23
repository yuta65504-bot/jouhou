/**
 * Pages Functions 共通ヘルパ（README「報告APIの仕様」）
 * - D1 バインディング `DB` で reports テーブルにアクセス（KVは使わない）
 * - 管理系APIは Bearer ADMIN_TOKEN で認証
 * - CAPTCHA は hCaptcha 固定。差し替えは verifyCaptcha のみ変更すればよい構造
 * - 報告の種別・型は UI と共通（src/lib/report.ts を読む。Workers 側でも実行可能なモジュール）
 */
import { type Report, type ReportCategory, type ReportStatus } from '../../src/lib/report'

export type { Report, ReportCategory, ReportStatus }
export { isCategory, isStatus } from '../../src/lib/report'

export type Env = {
  /** Pages → Functions の D1 バインディング（名前は DB 固定） */
  DB: D1Database
  /** Secrets で管理。ダッシュボードまたは `wrangler pages secret put` で設定 */
  HCAPTCHA_SECRET?: string
  /** 任意。設定すると siteverify の hostname がこの値と一致する場合のみ許可（カンマ区切り可） */
  HCAPTCHA_HOSTNAME?: string
  ADMIN_TOKEN?: string
}

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      // 管理系の応答（報告一覧など）がブラウザや中間キャッシュに残らないようにする
      'cache-control': 'no-store',
    },
  })
}

/** 長さ・内容に依存して早期リターンしない比較（タイミング差の低減） */
function safeEqual(a: string, b: string): boolean {
  const len = Math.max(a.length, b.length)
  let diff = a.length ^ b.length
  for (let i = 0; i < len; i++) {
    // 範囲外は 0 として扱い、ループ回数を入力長に依存させない
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0)
  }
  return diff === 0
}

/** Bearer ADMIN_TOKEN の照合 */
export function isAuthorizedAdmin(headers: Headers, env: Env): boolean {
  const expected = env.ADMIN_TOKEN
  if (!expected) return false
  const auth = headers.get('Authorization') ?? ''
  if (!auth.startsWith('Bearer ')) return false
  const given = auth.slice('Bearer '.length).trim()
  return safeEqual(given, expected)
}

/**
 * CAPTCHA検証（hCaptcha用）。Turnstile などへの差し替えはこの関数の差し替えだけで済む。
 * 検証に失敗した送信は保存しない（呼び出し側で 403 を返す）。
 * expectedHostname を渡すと、siteverify が返す hostname も検証する
 * （サイトキーは公開情報のため、他ドメインで発行されたトークンの流用を防ぐ）。
 */
export async function verifyCaptcha(
  token: string,
  secret: string,
  remoteip?: string | null,
  expectedHostname?: string,
): Promise<boolean> {
  const body = new URLSearchParams({ secret, response: token })
  if (remoteip) body.set('remoteip', remoteip)
  try {
    const res = await fetch('https://api.hcaptcha.com/siteverify', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    })
    if (!res.ok) return false
    const result = (await res.json()) as { success?: boolean; hostname?: string }
    if (result.success !== true) return false
    if (expectedHostname) {
      const allowed = expectedHostname
        .split(',')
        .map((h) => h.trim().toLowerCase())
        .filter(Boolean)
      if (allowed.length > 0 && !allowed.includes((result.hostname ?? '').toLowerCase())) {
        return false
      }
    }
    return true
  } catch {
    return false
  }
}

/* ---------- レート制限（簡易・isolate内のメモリ保持） ----------
 * Workers の isolate 単位のベストエフォート実装。isolate が入れ替わると数値はリセットされ、
 * 複数 isolate 間でも共有されない。大量の攻撃を確実に止めるには Cloudflare WAF の
 * レート制限ルールを併用する（README「セキュリティ」参照）。
 */
type Bucket = { count: number; resetAt: number }
const buckets = new Map<string, Bucket>()
const MAX_BUCKETS = 5000

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { ok: true } | { ok: false; retryAfter: number } {
  const now = Date.now()
  const bucket = buckets.get(key)
  if (!bucket || bucket.resetAt <= now) {
    if (buckets.size >= MAX_BUCKETS) {
      for (const [k, v] of buckets) {
        if (v.resetAt <= now) buckets.delete(k)
      }
    }
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true }
  }
  bucket.count += 1
  if (bucket.count > limit) {
    return { ok: false, retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)) }
  }
  return { ok: true }
}

/** レート制限のキー（スコープ + 接続元IP） */
export function clientKey(request: Request, scope: string): string {
  const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown'
  return `${scope}:${ip}`
}

export function tooMany(retryAfter: number): Response {
  const res = json({ error: 'アクセスが集中しています。しばらくしてからもう一度お試しください。' }, 429)
  res.headers.set('retry-after', String(retryAfter))
  return res
}
