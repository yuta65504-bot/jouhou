import { Link, useSearchParams } from 'react-router-dom'
import { TopAppBar } from '@/components/TopAppBar'
import { FIELDS, getField } from '@/lib/fields'
import { terms } from '@/content/terms'
import { useStore } from '@/lib/store'
import { usePageTitle } from '@/lib/usePageTitle'
import ui from '@/styles/ui.module.css'
import s from './TermsPage.module.css'

export default function TermsPage() {
  usePageTitle('用語')
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''
  const { store } = useStore()

  const setQuery = (q: string) => {
    const next = new URLSearchParams(params)
    if (q) next.set('q', q)
    else next.delete('q')
    setParams(next, { replace: true })
  }

  const normalized = query.trim().toLowerCase()
  const filtered = terms.filter((t) =>
    normalized === ''
      ? true
      : `${t.name}${t.short}${t.description}`.toLowerCase().includes(normalized),
  )

  return (
    <>
      <TopAppBar title="用語" />
      <div className={`${ui.page} ${s.page}`}>
        <div className={s.searchWrap}>
          <input
            type="search"
            className={s.search}
            placeholder="用語を検索"
            aria-label="用語を検索"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <p className={ui.lead} aria-live="polite">
          {normalized === '' ? `${terms.length}語` : filtered.length === 0 ? '見つかりません' : `${filtered.length}語が一致`}
        </p>

        <div className={ui.stack}>
          {filtered.map((t) => {
            const f = getField(t.fieldId)!
            const review = store.termReviews[t.id]
            return (
              <Link key={t.id} to={`/terms/${t.id}`} className={ui.rowLink}>
                <span className={ui.rowMain}>
                  <span className={s.meta}>
                    <span className={ui.chip} style={{ background: f.tintVar }}>
                      {f.name}
                    </span>
                    {review?.confidence === 'unsure' && <span className={`${ui.chip} ${s.unsure}`}>あいまい</span>}
                    {review?.confidence === 'known' && <span className={`${ui.chip} ${s.known}`}>覚えた</span>}
                  </span>
                  <span className={ui.rowTitle}>{t.name}</span>
                  <span className={ui.rowSub}>{t.short}</span>
                </span>
              </Link>
            )
          })}
        </div>

        <p className={s.footerNote}>
          分野: {FIELDS.map((f) => f.name).join('／')}
        </p>
      </div>
    </>
  )
}
