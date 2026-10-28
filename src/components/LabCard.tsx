import { Link } from 'react-router-dom'
import { getField } from '@/lib/fields'
import type { Lab } from '@/labs'
import ui from '@/styles/ui.module.css'
import styles from './LabCard.module.css'

type Props = {
  lab: Lab
  today?: boolean
}

/** 実験の一覧カード（ホーム・実験一覧・分野ページで共用） */
export function LabCard({ lab, today = false }: Props) {
  const field = getField(lab.fieldId)!
  return (
    <Link
      to={`/labs/${lab.id}`}
      className={styles.card}
      style={{ borderTopColor: field.colorVar }}
      aria-label={`${lab.title}（${field.name}の実験）`}
    >
      <span className={styles.meta}>
        <span className={ui.chip} style={{ background: field.tintVar }}>
          {field.name}
        </span>
        {today && <span className={`${ui.chip} ${styles.today}`}>今日の実験</span>}
      </span>
      <span className={styles.title}>{lab.title}</span>
      <span className={styles.summary}>{lab.summary}</span>
      <span className={styles.cta} aria-hidden="true">
        動かす →
      </span>
    </Link>
  )
}
