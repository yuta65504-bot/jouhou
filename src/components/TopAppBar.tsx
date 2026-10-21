import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import styles from './TopAppBar.module.css'

type Props = {
  title: string
  /** 明示的な親ルートへの遷移（history.back() は使わない: 仕様書 §4） */
  backTo?: string
  right?: ReactNode
}

export function TopAppBar({ title, backTo, right }: Props) {
  return (
    <header className={styles.bar}>
      <div className={styles.inner}>
        {backTo ? (
          <Link to={backTo} className={styles.back} aria-label="前の画面に戻る">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M15 4 7 12l8 8" />
            </svg>
          </Link>
        ) : (
          <span className={styles.gap} aria-hidden="true" />
        )}
        <h1 className={styles.title}>{title}</h1>
        {right ? <div className={styles.right}>{right}</div> : <span className={styles.gap} aria-hidden="true" />}
      </div>
    </header>
  )
}
