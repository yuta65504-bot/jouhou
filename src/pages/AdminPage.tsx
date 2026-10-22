/** 管理者ページ /admin（URL直接アクセス専用。メインページからはリンクを張らない）
 * - 問題・解答の一覧（コンテンツデータから静的に生成）
 * - 報告の一覧（GET /api/reports を Bearer ADMIN_TOKEN で取得 / PATCH で status を resolved に更新）
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FIELDS, getField } from '@/lib/fields'
import {
  ApiError,
  fetchReports,
  loadAdminToken,
  reportCategoryLabel,
  saveAdminToken,
  updateReportStatus,
  type Report,
} from '@/lib/report'
import { questions } from '@/content/questions'
import { usePageTitle } from '@/lib/usePageTitle'
import ui from '@/styles/ui.module.css'
import s from './AdminPage.module.css'

function formatAt(iso: string): string {
  try {
    return new Intl.DateTimeFormat('ja-JP', {
      timeZone: 'Asia/Tokyo',
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

export default function AdminPage() {
  usePageTitle('管理者')
  const [token, setToken] = useState(() => loadAdminToken())
  const [reports, setReports] = useState<Report[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [working, setWorking] = useState<string | null>(null)

  const loadReports = async (tok: string) => {
    setLoading(true)
    setError(null)
    try {
      const rs = await fetchReports(tok)
      setReports(rs)
      saveAdminToken(tok)
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        setError('トークンが正しくありません。ADMIN_TOKEN を確認してください。')
      } else {
        setError(e instanceof Error ? e.message : '一覧を取得できませんでした。')
      }
      setReports(null)
    } finally {
      setLoading(false)
    }
  }

  const resolve = async (id: string) => {
    setWorking(id)
    try {
      await updateReportStatus(token, id, 'resolved')
      setReports((prev) => prev?.map((r) => (r.id === id ? { ...r, status: 'resolved' } : r)) ?? null)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : '対応状況を更新できませんでした。')
    } finally {
      setWorking(null)
    }
  }

  return (
    <div className={s.page}>
      <header className={s.header}>
        <h1 className={s.title}>jouohu 管理者</h1>
        <p className={s.note}>
          このページはURLでの直接アクセス用です。メインページからの導線はありません。
        </p>
      </header>

      <section className={`${ui.card} ${ui.cardPad}`} aria-labelledby="admin-reports">
        <h2 className={ui.sectionTitle} id="admin-reports">
          報告の一覧
        </h2>
        <form
          className={s.tokenRow}
          onSubmit={(e) => {
            e.preventDefault()
            void loadReports(token)
          }}
        >
          <label className={ui.rowSub} htmlFor="admin-token">
            管理トークン（ADMIN_TOKEN）
          </label>
          <div className={s.tokenInputs}>
            <input
              id="admin-token"
              type="password"
              className={s.tokenInput}
              value={token}
              onChange={(e) => setToken(e.target.value)}
              autoComplete="off"
              placeholder="ADMIN_TOKEN"
            />
            <button type="submit" className={ui.subtleBtn} disabled={loading || token === ''}>
              {loading ? '取得中…' : '取得'}
            </button>
          </div>
        </form>
        {error && (
          <p className={s.error} role="alert">
            {error}
          </p>
        )}
        {reports != null && (
          <>
            <p className={ui.lead} aria-live="polite">
              {reports.length}件
            </p>
            <div className={ui.stack}>
              {reports.length === 0 && <p className={ui.empty}>報告はまだありません。</p>}
              {reports.map((r) => {
                const q = questions.find((x) => x.id === r.questionId)
                return (
                  <div key={r.id} className={s.report}>
                    <div className={s.reportHead}>
                      <span className={`${ui.chip} ${r.status === 'open' ? s.open : s.resolved}`}>
                        {r.status === 'open' ? '未対応' : '対応済み'}
                      </span>
                      <span className={ui.chip}>{reportCategoryLabel(r.category)}</span>
                      <span className={s.at}>{formatAt(r.createdAt)}</span>
                    </div>
                    <p className={s.reportMsg}>{r.message}</p>
                    <div className={s.reportMeta}>
                      {q ? (
                        <Link to={`/quiz/${q.id}`} className={s.qLink}>
                          対象: {q.id}（問題を開く）
                        </Link>
                      ) : (
                        <span className={s.qLink}>対象: {r.questionId}（存在しない問題ID）</span>
                      )}
                    </div>
                    {r.status === 'open' && (
                      <button
                        type="button"
                        className={`${ui.subtleBtn} ${s.resolveBtn}`}
                        onClick={() => void resolve(r.id)}
                        disabled={working === r.id}
                      >
                        {working === r.id ? '更新中…' : '対応済みにする'}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </section>

      <section className={`${ui.card} ${ui.cardPad}`} aria-labelledby="admin-questions">
        <h2 className={ui.sectionTitle} id="admin-questions">
          問題・解答の一覧（{questions.length}問）
        </h2>
        <div className={ui.stack}>
          {questions.map((q) => {
            const f = getField(q.fieldId)
            return (
              <div key={q.id} className={s.question}>
                <div className={s.reportHead}>
                  <span className={ui.chip} style={{ background: f!.tintVar }}>
                    {f!.name}
                  </span>
                  <span className={`${ui.chip} ${s.stars}`} aria-label={`難易度${q.difficulty}`}>
                    {'★'.repeat(q.difficulty)}
                  </span>
                  <span className={s.at}>{q.id}</span>
                </div>
                <p className={s.qText}>{q.text}</p>
                <ol className={s.choices}>
                  {q.choices.map((c, i) => (
                    <li key={i} className={`${s.choice} ${i === q.answerIndex ? s.choiceAnswer : ''}`}>
                      {i + 1}. {c}
                      {i === q.answerIndex && <span className={s.answerMark}>（正解）</span>}
                    </li>
                  ))}
                </ol>
                <p className={s.qExp}>{q.explanation}</p>
              </div>
            )
          })}
        </div>
      </section>

      <p className={s.footerNote}>
        分野: {FIELDS.map((f) => f.name).join('／')}
        ／報告データはD1にのみ保存され、利用者の端末の学習記録には影響しません。
      </p>
    </div>
  )
}
