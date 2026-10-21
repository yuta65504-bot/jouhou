import { useId } from 'react'
import styles from '@/styles/ui.module.css'

type Option<T extends string> = { value: T; label: string }

type Props<T extends string> = {
  label: string
  value: T
  options: readonly Option<T>[]
  onChange: (value: T) => void
}

/** SegmentedButton（仕様書 §8: セグメントでパラメータ切替） */
export function Segmented<T extends string>({ label, value, options, onChange }: Props<T>) {
  const id = useId()
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={styles.segmented}
      style={{ flexWrap: 'wrap' }}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          id={`${id}-${opt.value}`}
          type="button"
          role="radio"
          aria-checked={opt.value === value}
          className={`${styles.segmentedItem} ${opt.value === value ? styles.segmentedActive : ''}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
