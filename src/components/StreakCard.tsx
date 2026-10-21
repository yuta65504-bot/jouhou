import { Link } from 'react-router-dom'
import { FlameIcon, CheckIcon, CircleIcon } from './Icons'
import styles from './StreakCard.module.css'

type Props = {
  streak: number
  todayActive: boolean
  /** CTA のリンク先（今日の1問など） */
  ctaTo?: string
  ctaLabel?: string
}

/** 連続学習日数カード（仕様書 §7.1/§7.5） */
export function StreakCard({ streak, todayActive, ctaTo, ctaLabel = '今日の1問へ' }: Props) {
  return (
    <section className={styles.card} aria-label="連続学習日数">
      <div className={styles.flameWrap}>
        <span className={styles.flame} aria-hidden="true">
          <FlameIcon />
        </span>
        <span className={styles.num}>{streak}</span>
        <span className={styles.unit}>日</span>
        <span className={styles.label}>連続学習</span>
      </div>
      <div className={styles.side}>
        <p className={styles.today}>
          {todayActive ? (
            <>
              <span className={styles.doneIcon} aria-hidden="true">
                <CheckIcon size={16} />
              </span>
              今日の学習 達成
            </>
          ) : (
            <>
              <span className={styles.todoIcon} aria-hidden="true">
                <CircleIcon size={16} />
              </span>
              今日はまだこれから
            </>
          )}
        </p>
        {ctaTo && (
          <Link to={ctaTo} className={styles.cta}>
            {ctaLabel}
          </Link>
        )}
      </div>
    </section>
  )
}
