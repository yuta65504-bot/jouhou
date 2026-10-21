import { Link } from 'react-router-dom'
import { FIELDS } from '@/lib/fields'
import { CheckIcon } from './Icons'
import { ProgressRing } from './ProgressRing'
import styles from './FieldCard.module.css'

export type FieldCardState = 'notStarted' | 'inProgress' | 'done'

type Props = {
  fieldId: string
  ratio: number
}

const stateText: Record<FieldCardState, string> = {
  notStarted: '未着手',
  inProgress: '進行中',
  done: '完了',
}

/** 分野カード（仕様書 §7.1: 最小高さ88px、状態3種） */
export function FieldCard({ fieldId, ratio }: Props) {
  const field = FIELDS.find((f) => f.id === fieldId)!
  const state: FieldCardState = ratio >= 1 ? 'done' : ratio > 0 ? 'inProgress' : 'notStarted'
  return (
    <Link to={`/fields/${fieldId}`} className={styles.card} aria-label={`${field.name}（${stateText[state]}）`}>
      <span className={styles.iconWrap} style={{ background: field.tintVar }} aria-hidden="true">
        <span className={styles.bar} style={{ background: field.colorVar }} />
      </span>
      <span className={styles.name}>{field.name}</span>
      <span className={styles.short}>{field.short}</span>
      <span className={styles.footer}>
        <span
          className={`${styles.state} ${
            state === 'done' ? styles.stateDone : state === 'inProgress' ? styles.stateActive : styles.stateIdle
          }`}
        >
          {state === 'done' && <CheckIcon size={13} />}
          {stateText[state]}
        </span>
        <ProgressRing
          ratio={ratio}
          size={40}
          color={field.colorVar}
          label={`進捗 ${Math.round(ratio * 100)}%`}
        />
      </span>
    </Link>
  )
}
