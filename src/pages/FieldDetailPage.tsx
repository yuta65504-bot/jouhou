import { Link, Navigate, useParams } from 'react-router-dom'
import { TopAppBar } from '@/components/TopAppBar'
import { getField } from '@/lib/fields'
import { demosByField } from '@/content/demos'
import { terms } from '@/content/terms'
import { usePageTitle } from '@/lib/usePageTitle'
import ui from '@/styles/ui.module.css'
import s from './FieldDetailPage.module.css'

export default function FieldDetailPage() {
  const { fieldId } = useParams()
  usePageTitle(getField(fieldId ?? '')?.name)
  if (!fieldId || !getField(fieldId)) return <Navigate to="/fields" replace />
  const field = getField(fieldId)!
  const demos = demosByField(fieldId)
  const fieldTerms = terms.filter((t) => t.fieldId === fieldId)

  return (
    <>
      <TopAppBar title={field.name} backTo="/fields" />
      <div className={`${ui.page} ${s.page}`}>
        <p className={ui.lead}>{field.short}の分野。デモを操作して理解し、用語とミニ問題で定着を確かめます。</p>

        <section aria-labelledby="field-demos">
          <h2 className={ui.sectionTitle} id="field-demos">
            インタラクティブデモ
          </h2>
          <div className={ui.stack}>
            {demos.map((demo) => (
              <Link key={demo.id} to={`/fields/${fieldId}/demo/${demo.id}`} className={ui.rowLink}>
                <span className={ui.rowMain}>
                  <span className={ui.rowTitle}>
                    {demo.title}
                    <span className={ui.chip} style={{ marginLeft: 8 }}>
                      {demo.level}
                    </span>
                  </span>
                  <span className={ui.rowSub}>{demo.summary}</span>
                </span>
                <span className={s.arrow} aria-hidden="true">
                  →
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section aria-labelledby="field-terms">
          <h2 className={ui.sectionTitle} id="field-terms">
            関連用語
          </h2>
          <div className={ui.chipRow}>
            {fieldTerms.map((t) => (
              <Link key={t.id} to={`/terms/${t.id}`} className={ui.chip}>
                {t.name}
              </Link>
            ))}
          </div>
        </section>

        <div className={ui.bottomBar}>
          <Link to={`/quiz?field=${fieldId}`} className={`${ui.primaryBtn} ${ui.fullWidth}`}>
            ミニ問題へ
          </Link>
        </div>
      </div>
    </>
  )
}
