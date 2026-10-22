/**
 * 報告API（個別対応状況の更新）
 * ▶ PATCH /api/reports/:id … status の更新（Bearer ADMIN_TOKEN で要求）
 */
import { isAuthorizedAdmin, isStatus, json, type Env } from '../_lib'

type Ctx = { request: Request; env: Env; params: { id: string } }

export const onRequestPatch = async (ctx: Ctx): Promise<Response> => {
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

  await ctx.env.DB.prepare('UPDATE reports SET status = ? WHERE id = ?').bind(status, id).run()
  return json({ id, status })
}
