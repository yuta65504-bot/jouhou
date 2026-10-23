/**
 * 報告API（個別対応状況の更新）
 * ▶ PATCH /api/reports/:id … status の更新（Bearer ADMIN_TOKEN で要求）
 */
import {
  clientKey,
  isAuthorizedAdmin,
  isStatus,
  json,
  rateLimit,
  tooMany,
  type Env,
} from '../_lib'

type Ctx = { request: Request; env: Env; params: { id: string } }

export const onRequestPatch = async (ctx: Ctx): Promise<Response> => {
  // 管理トークンの総当たり対策（1分あたり30回まで）
  const limit = rateLimit(clientKey(ctx.request, 'reports:update'), 30, 60_000)
  if (!limit.ok) return tooMany(limit.retryAfter)

  if (!ctx.env.DB) return json({ error: 'サーバー側の設定が完了していません（D1バインディング）。' }, 500)
  if (!isAuthorizedAdmin(ctx.request.headers, ctx.env)) {
    return json({ error: 'トークンが正しくありません。' }, 401)
  }

  const id = ctx.params.id
  if (typeof id !== 'string' || id.length === 0 || id.length > 64) {
    return json({ error: 'IDが正しくありません。' }, 400)
  }

  let body: unknown
  try {
    body = await ctx.request.json()
  } catch {
    return json({ error: 'リクエストの形式が正しくありません。' }, 400)
  }
  const { status } = (body ?? {}) as { status?: unknown }
  if (!isStatus(status)) {
    return json({ error: 'status は "open" または "resolved" を指定してください。' }, 400)
  }

  const result = await ctx.env.DB.prepare('UPDATE reports SET status = ? WHERE id = ?')
    .bind(status, id)
    .run()
  if ((result.meta?.changes ?? 0) === 0) {
    return json({ error: '該当する報告が見つかりません。' }, 404)
  }
  return json({ id, status })
}
