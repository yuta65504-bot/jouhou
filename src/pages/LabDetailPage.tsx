import { Link, Navigate, useParams } from 'react-router-dom'
import { TopAppBar } from '@/components/TopAppBar'
import { getField } from '@/lib/fields'
import { questionById } from '@/content/questions'
import { labById } from '@/labs'
import { LAB_COMPONENTS } from '@/labs/components'
import { usePageTitle } from '@/lib/usePageTitle'
import ui from '@/styles/ui.module.css'
import s from './LabDetailPage.module.css'

export default function LabDetailPage() {
  const { labId } = useParams()
  const lab = labId ? labById(labId) : undefined
  usePageTitle(lab?.title ?? '実験')

  if (!lab) return <Navigate to="/labs" replace />
  const LabBody = LAB_COMPONENTS[lab.id]
  if (!LabBody) return <Navigate to="/labs" replace />
  const field = getField(lab.fieldId)
  const question = questionById(lab.questionId)

  return (
    <>
      <TopAppBar title="実験" backTo="/labs" />
      <div className={`${ui.page} ${s.page}`}>
        <div className={ui.chipRow}>
          {field && (
            <span className={ui.chip} style={{ background: field.tintVar }}>
              {field.name}
            </span>
          )}
          <span className={ui.chip}>操作して結果を見る</span>
        </div>
        <h2 className={s.heading}>{lab.title}</h2>
        <p className={ui.lead}>{lab.summary}。値を変えると、結果がその場で変わります。</p>

        <LabBody />

        <section className={`${ui.card} ${ui.cardPad}`} aria-labelledby="lab-takeaway">
          <h2 className={ui.sectionTitle} id="lab-takeaway">
            わかったこと
          </h2>
          <p className={s.takeaway}>{lab.takeaway}</p>
          {question && (
            <Link to={`/quiz/${question.id}`} className={`${ui.primaryBtn} ${s.related}`}>
              関連する問題を解く
            </Link>
          )}
        </section>
      </div>
    </>
  )
}
