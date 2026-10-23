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
  ADMIN_TOKEN?: string
}

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  })
}

/** Bearer ADMIN_TOKEN の照合（長さ一定比較で簡易にタイミング差を抑える） */
export function isAuthorizedAdmin(headers: Headers, env: Env): boolean {
  const expected = env.ADMIN_TOKEN
  if (!expected) return false
  const auth = headers.get('Authorization') ?? ''
  const given = auth.startsWith('Bearer ') ? auth.slice('Bearer '.length).trim() : ''
  let ok = given.length === expected.length
  for (let i = 0; ok && i < expected.length; i++) {
    ok = given.charCodeAt(i) === expected.charCodeAt(i)
  }
  return ok
}

/**
 * CAPTCHA検証（hCaptcha用）。Turnstile などへの差し替えはこの関数の差し替えだけで済む。
 * 検証に失敗した送信は保存しない（呼び出し側で 403 を返す）。
 */
export async function verifyCaptcha(
  token: string,
  secret: string,
  remoteip?: string | null,
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
    const result = (await res.json()) as { success?: boolean }
    return result.success === true
  } catch {
    return false
  }
}
