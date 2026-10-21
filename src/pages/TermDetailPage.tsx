import { Link, Navigate, useParams } from 'react-router-dom'
import { TopAppBar } from '@/components/TopAppBar'
import { CheckIcon } from '@/components/Icons'
import { Figure } from '@/components/Figures'
import { getField } from '@/lib/fields'
import { terms } from '@/content/terms'
import { getDemo } from '@/content/demos'
import { useStore } from '@/lib/store'
import { usePageTitle } from '@/lib/usePageTitle'
import ui from '@/styles/ui.module.css'
import s from './TermDetailPage.module.css'

type Confidence = 'known' | 'unsure'

export default function TermDetailPage() {
  const { termId } = useParams()
  const term = termId ? terms.find((t) => t.id === termId) : undefined
  usePageTitle(term?.name)

  const { store, reviewTerm } = useStore()

  if (!term) return <Navigate to="/terms" replace />
  const field = getField(term.fieldId)!
  const review = store.termReviews[term.id]
  const demo = term.demoId ? getDemo(term.demoId) : undefined
  const related = term.related
    .map((id) => terms.find((t) => t.id === id))
    .filter((t): t is NonNullable<typeof t> => t != null)

  const current: Confidence | null = review?.confidence ?? null
  const statusText =
    current === 'known' ? '覚えた' : current === 'unsure' ? 'あいまい' : '未記録'

  return (
    <>
      <TopAppBar title={term.name} backTo="/terms" />
      <div className={`${ui.page} ${s.page}`}>
        <span
          className={ui.chip}
          style={{ background: field.tintVar, alignSelf: 'flex-start' }}
        >
          {field.name}
        </span>

        <p className={s.short}>{term.short}</p>

        {term.figure && (
          <div className={`${ui.card} ${s.figureCard}`}>
            <Figure id={term.figure} className={s.figure} />
          </div>
        )}

        <section aria-label="説明">
          {term.description.split('\n\n').map((para, i) => (
            <p key={i} className={s.desc}>
              {para}
            </p>
          ))}
        </section>

        {/* 覚えた／あいまい の2択で復習状態を記録（仕様書 §7.4） */}
        <section className={`${ui.card} ${s.review}`} aria-labelledby="term-review">
          <h2 className={ui.sectionTitle} id="term-review">
            復習状態（いまは「{statusText}」）
          </h2>
          <div className={s.reviewBtns}>
            <button
              type="button"
              className={`${s.reviewBtn} ${current === 'known' ? s.reviewKnownOn : ''}`}
              aria-pressed={current === 'known'}
              onClick={() => reviewTerm(term.id, 'known')}
            >
              <CheckIcon />
              覚えた
            </button>
            <button
              type="button"
              className={`${s.reviewBtn} ${current === 'unsure' ? s.reviewUnsureOn : ''}`}
              aria-pressed={current === 'unsure'}
              onClick={() => reviewTerm(term.id, 'unsure')}
            >
              ?
              あいまい
            </button>
          </div>
          <p className={ui.lead}>記録は端末内（localStorage）に保存され、記録ページの「苦手用語」に反映されます。</p>
        </section>

        {demo && (
          <Link to={`/fields/${term.fieldId}/demo/${demo.id}`} className={s.demoLink}>
            ▶ デモで確かめる: {demo.title}
          </Link>
        )}

        {related.length > 0 && (
          <section aria-labelledby="term-related">
            <h2 className={ui.sectionTitle} id="term-related">
              関連用語
            </h2>
            <div className={ui.chipRow}>
              {related.map((t) => (
                <Link key={t.id} to={`/terms/${t.id}`} className={ui.chip}>
                  {t.name}
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  )
}
