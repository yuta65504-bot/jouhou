/**
 * 報告API（Pages Functions）
 * ▶ POST /api/reports … 報告の新規作成（hCaptcha検証 → D1 保存）。検証失敗は保存しない
 * ▶ GET  /api/reports … 報告一覧の取得（Bearer ADMIN_TOKEN で要求）
 *
 * error メッセージは src/lib/report.ts の errorMessage() を経由してUIにそのまま表示されるため日本語で書く。
 */
import {
  clientKey,
  isAuthorizedAdmin,
  isCategory,
  json,
  rateLimit,
  tooMany,
  verifyCaptcha,
  type Env,
} from './_lib'
import type { Report } from '../../src/lib/report'

type Ctx = { request: Request; env: Env }

export const onRequestPost = async (ctx: Ctx): Promise<Response> => {
  // 同一IPからの連投を抑制（CAPTCHA と併用。10分あたり10件まで）
  const limit = rateLimit(clientKey(ctx.request, 'reports:create'), 10, 10 * 60_000)
  if (!limit.ok) return tooMany(limit.retryAfter)

  if (!ctx.env.DB) return json({ error: 'サーバー側の設定が完了していません（D1バインディング）。' }, 500)
  const secret = ctx.env.HCAPTCHA_SECRET
  if (!secret) return json({ error: 'サーバー側の設定が完了していません（hCaptchaシークレット）。' }, 500)

  let body: unknown
  try {
    body = await ctx.request.json()
  } catch {
    return json({ error: 'リクエストの形式が正しくありません。' }, 400)
  }
  const { questionId, category, message, captchaToken } = (body ?? {}) as {
    questionId?: unknown
    category?: unknown
    message?: unknown
    captchaToken?: unknown
  }

  if (typeof questionId !== 'string' || questionId.length === 0 || questionId.length > 64) {
    return json({ error: '問題IDが正しくありません。' }, 400)
  }
  if (!isCategory(category)) {
    return json({ error: '報告の種類が正しくありません。' }, 400)
  }
  if (typeof message !== 'string' || message.trim().length === 0 || message.length > 2000) {
    return json({ error: '内容は1文字以上2000文字以内で入力してください。' }, 400)
  }
  if (typeof captchaToken !== 'string' || captchaToken.length === 0) {
    return json({ error: 'CAPTCHAを確認してください。' }, 400)
  }

  const ok = await verifyCaptcha(
    captchaToken,
    secret,
    ctx.request.headers.get('CF-Connecting-IP'),
    ctx.env.HCAPTCHA_HOSTNAME,
  )
  if (!ok) {
    return json({ error: 'CAPTCHAの確認ができませんでした。もう一度お試しください。' }, 403)
  }

  const id = crypto.randomUUID()
  const createdAt = new Date().toISOString()
  const report: Report = {
    id,
    questionId,
    category,
    message,
    status: 'open',
    createdAt,
  }
  await ctx.env.DB
    .prepare(
      'INSERT INTO reports (id, questionId, category, message, status, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
    )
    .bind(id, questionId, category, message, report.status, createdAt)
    .run()

  return json({ id, createdAt }, 201)
}

export const onRequestGet = async (ctx: Ctx): Promise<Response> => {
  // 管理トークンの総当たり対策（1分あたり30回まで）
  const limit = rateLimit(clientKey(ctx.request, 'reports:list'), 30, 60_000)
  if (!limit.ok) return tooMany(limit.retryAfter)

  if (!ctx.env.DB) return json({ error: 'サーバー側の設定が完了していません（D1バインディング）。' }, 500)
  if (!isAuthorizedAdmin(ctx.request.headers, ctx.env)) {
    return json({ error: 'トークンが正しくありません。' }, 401)
  }
  const result = await ctx.env.DB
    .prepare(
      'SELECT id, questionId, category, message, status, createdAt FROM reports ORDER BY createdAt DESC LIMIT 200',
    )
    .all<Report>()
  return json({ reports: result.results })
}
