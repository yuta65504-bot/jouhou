/** 進捗リング（SVG）。未着手=グレー / 進行中=アクセント / 完了=チェックアイコン併記 */
type Props = {
  ratio: number
  size?: number
  color: string
  track?: string
  label: string
}

export function ProgressRing({ ratio, size = 44, color, track = 'var(--color-border)', label }: Props) {
  const r = (size - 6) / 2
  const c = 2 * Math.PI * r
  const clamped = Math.max(0, Math.min(1, ratio))
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={label}
      className="ringSvg"
      style={{ display: 'block' }}
    >
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={4} />
      {clamped > 0 && (
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={`${c * clamped} ${c}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      )}
    </svg>
  )
}
