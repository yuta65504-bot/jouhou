import { Link, Navigate, useParams } from 'react-router-dom'
import { TopAppBar } from '@/components/TopAppBar'
import { getField } from '@/lib/fields'
import { terms } from '@/content/terms'
import { usePageTitle } from '@/lib/usePageTitle'
import ui from '@/styles/ui.module.css'
import s from './FieldDetailPage.module.css'

export default function FieldDetailPage() {
  const { fieldId } = useParams()
  usePageTitle(getField(fieldId ?? '')?.name)
  if (!fieldId || !getField(fieldId)) return <Navigate to="/fields" replace />
  const field = getField(fieldId)!
  const fieldTerms = terms.filter((t) => t.fieldId === fieldId)

  return (
    <>
      <TopAppBar title={field.name} backTo="/fields" />
      <div className={`${ui.page} ${s.page}`}>
        <p className={ui.lead}>{field.short}の分野。各問題の解説にある図解で仕組みを確かめ、用語とミニ問題で定着を確認します。</p>

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
