/**
 * 報告の共通データとAPIクライアント（仕様書「報告APIの仕様」）
 * - 報告は localStorage には保存せず、Pages Functions 経由で D1 に保存する
 * - 送信には hCaptcha のトークンが必要で、検証は Function 側で行う
 * - このモジュールは Functions（functions/api/_lib）からも読まれるため、
 *   モジュール直下でブラウザAPIを実行しないこと
 */

/** 報告の種別（D1 の category に保存するキー。UI では日本語ラベルで表示する） */
export const REPORT_CATEGORIES = [
  { value: 'typo', label: '誤字・脱字' },
  { value: 'answer', label: '解答・解説の誤り' },
  { value: 'layout', label: '表示崩れ' },
  { value: 'other', label: 'その他' },
] as const

export type ReportCategory = (typeof REPORT_CATEGORIES)[number]['value']

/** カテゴリのキーから日本語ラベルを得る（管理者ページの表示用） */
export function reportCategoryLabel(key: string): string {
  return REPORT_CATEGORIES.find((c) => c.value === key)?.label ?? key
}

export type ReportStatus = 'open' | 'resolved'

/** D1 reports テーブルの1行 */
export type Report = {
  id: string
  questionId: string
  category: string
  message: string
  status: ReportStatus
  createdAt: string
}

/** API エラー（サーバーからの日本語メッセージをそのまま表示に使う） */
export class ApiError extends Error {
  readonly status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/** エラー応答から日本語メッセージを取り出す（JSONでない応答はフォールバック） */
async function errorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const data = (await res.json()) as { error?: unknown }
    if (typeof data?.error === 'string' && data.error) return data.error
  } catch {
    /* JSONでない応答はフォールバックを使う */
  }
  return fallback
}

/** POST /api/reports（Function 内で hCaptcha を検証してから D1 に保存する） */
export async function submitReport(input: {
  questionId: string
  category: ReportCategory
  message: string
  captchaToken: string
}): Promise<{ id: string }> {
  const res = await fetch('/api/reports', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    throw new ApiError(res.status, await errorMessage(res, '送信に失敗しました。しばらくしてからもう一度お試しください。'))
  }
  const data = (await res.json().catch(() => null)) as { id?: unknown } | null
  return { id: typeof data?.id === 'string' ? data.id : '' }
}

/* ---------- 管理者用（/admin 画面から使用） ---------- */

const ADMIN_TOKEN_KEY = 'jouohu.adminToken.v1'

/**
 * localStorage に相当する保存先。Workers環境（Functionsからこのモジュールを読む場合）には
 * localStorage が無いため、globalThis を介して存在チェックする（無ければ毎回入力で運用される）。
 */
function adminStorage(): { getItem(key: string): string | null; setItem(key: string, value: string): void } | undefined {
  try {
    const g = globalThis as {
      localStorage?: { getItem(key: string): string | null; setItem(key: string, value: string): void }
    }
    return g.localStorage
  } catch {
    return undefined
  }
}

export function loadAdminToken(): string {
  return adminStorage()?.getItem(ADMIN_TOKEN_KEY) ?? ''
}

export function saveAdminToken(token: string): void {
  adminStorage()?.setItem(ADMIN_TOKEN_KEY, token)
}

/** GET /api/reports（Bearer 認証）で報告一覧を取得する */
export async function fetchReports(token: string): Promise<Report[]> {
  const res = await fetch('/api/reports', { headers: { Authorization: `Bearer ${token}` } })
  if (!res.ok) {
    throw new ApiError(res.status, await errorMessage(res, '報告の一覧を取得できませんでした。'))
  }
  const data = (await res.json()) as { reports?: unknown }
  return Array.isArray(data?.reports) ? (data.reports as Report[]) : []
}

/** PATCH /api/reports/:id で対応状況を更新する */
export async function updateReportStatus(token: string, id: string, status: ReportStatus): Promise<void> {
  const res = await fetch(`/api/reports/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status }),
  })
  if (!res.ok) {
    throw new ApiError(res.status, await errorMessage(res, '対応状況を更新できませんでした。'))
  }
}
