/**
 * インタラクティブ図解の共通パーツ。
 * - 図は SVG + DOM（Canvas不使用: 仕様の「文字選択・拡大・読み上げに有利」を踏襲）
 * - 操作部品は44px以上、状態は色＋テキスト（アクセシビリティ §は README 参照）
 */
import { useId, type FC, type ReactNode } from 'react'
import styles from './figures.module.css'

/* SVG内で使うトークン色（components/Figures.tsx と共通 var(--color-*)） */
export const LABEL = 'var(--color-label)'
export const MUTED = 'var(--color-secondary-label)'
export const ACCENT = 'var(--color-accent)'
export const BORDER = 'var(--color-border)'
export const TINT = 'var(--color-accent-tint)'
export const OK = 'var(--color-success)'
export const OKINK = 'var(--color-success-ink)'
export const NG = 'var(--color-error)'
export const NGINK = 'var(--color-error-ink)'
export const WARNINK = 'var(--color-warning-ink)'

/** 解説内の図解コンテナ */
export const FigShell: FC<{
  title: string
  children: ReactNode
  status?: string
  statusKind?: 'ok' | 'ng' | 'plain'
}> = ({ title, children, status, statusKind = 'plain' }) => (
  <div className={styles.fig}>
    <span className={styles.figTitle} aria-hidden="true">
      <svg width={14} height={14} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M2 2l10 5-10 5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {title}
    </span>
    {children}
    {status != null && (
      <p
        className={`${styles.status} ${statusKind === 'ok' ? styles.statusOk : statusKind === 'ng' ? styles.statusNg : ''}`}
        aria-live="polite"
      >
        {status}
      </p>
    )}
  </div>
)

/** 図の本体（SVGの幅はビューボックスの高さに合わせる） */
export const View: FC<{ children: ReactNode; label: string }> = ({ children, label }) => (
  <div className={styles.visual} role="img" aria-label={label}>
    {children}
  </div>
)

type BtnProps = {
  children: ReactNode
  onClick: () => void
  on?: boolean
  disabled?: boolean
  small?: boolean
  ariaPressed?: boolean
  ariaLabel?: string
}

/** 図解内の切り替え・実行ボタン（押されたら on で強調） */
export const Btn: FC<BtnProps> = ({ children, onClick, on = false, disabled = false, small = false, ariaPressed, ariaLabel }) => (
  <button
    type="button"
    className={`${styles.btn} ${on ? styles.btnOn : ''} ${small ? styles.btnSm : ''}`}
    onClick={onClick}
    disabled={disabled}
    aria-pressed={ariaPressed}
    aria-label={ariaLabel}
  >
    {children}
  </button>
)

/** 注記（グレーの小テキスト） */
export const Note: FC<{ children: ReactNode }> = ({ children }) => <p className={styles.note}>{children}</p>

/** ラベル付きスライダー（fmt で「現在値」の表示を整える） */
export const Slider: FC<{
  label: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (v: number) => void
  fmt?: (v: number) => string
}> = ({ label, value, min, max, step = 1, onChange, fmt }) => {
  const id = useId()
  return (
    <div className={styles.ctrl} style={{ flexDirection: 'column', alignItems: 'stretch', gap: 2 }}>
      <div className={styles.ctrl} style={{ justifyContent: 'space-between' }}>
        <span className={styles.status}>{label}</span>
        <span className={styles.note}>{fmt ? fmt(value) : value}</span>
      </div>
      <input
        id={id}
        type="range"
        className={styles.slider}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  )
}

/** 数値表示の横並びカード（計算の中間値など。strong で強調、ok/ng で色分け） */
export const Calc: FC<{ parts: { k: string; v: string; strong?: boolean; ok?: boolean; ng?: boolean }[] }> = ({ parts }) => (
  <div className={styles.ctrl} style={{ gap: 6, flexWrap: 'wrap' }}>
    {parts.map((p, i) => (
      <span
        key={`${p.k}-${i}`}
        className={`${styles.btn} ${p.strong ? styles.btnOn : ''}`}
        style={{ minHeight: 0, padding: '6px 10px', cursor: 'default', color: p.ok ? OKINK : p.ng ? NGINK : undefined }}
      >
        <span>{p.k} </span>
        <b>{p.v}</b>
      </span>
    ))}
  </div>
)

/* ---------- SVG ジオメトリ ---------- */

/** 角丸ボックス＋中央のラベル */
export const GBox: FC<{
  x: number
  y: number
  w: number
  h: number
  text: string
  fill?: string
  stroke?: string
  ink?: string
  fs?: number
  rx?: number
  bold?: boolean
}> = ({ x, y, w, h, text, fill = TINT, stroke = ACCENT, ink = LABEL, fs = 11, rx = 6, bold = false }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx={rx} fill={fill} stroke={stroke} />
    <text x={x + w / 2} y={y + h / 2 + fs * 0.36} fontSize={fs} textAnchor="middle" fill={ink} fontWeight={bold ? 700 : 400}>
      {text}
    </text>
  </g>
)

/** 矢印（線＋先端の三角） */
export const GArrow: FC<{ x1: number; y1: number; x2: number; y2: number; stroke?: string; w?: number }> = ({
  x1,
  y1,
  x2,
  y2,
  stroke = ACCENT,
  w = 2,
}) => {
  const a = Math.atan2(y2 - y1, x2 - x1)
  const hx = Math.cos(a)
  const hy = Math.sin(a)
  const tx = x2 - 10 * hx
  const ty = y2 - 10 * hy
  const px = -hy
  const py = hx
  return (
    <g stroke={stroke} fill="none">
      <path d={`M ${x1} ${y1} L ${tx} ${ty}`} strokeWidth={w} />
      <path
        d={`M ${x2} ${y2} L ${tx + 5 * px} ${ty + 5 * py} l ${-4 * px} ${-4 * py} z`}
        fill={stroke}
        stroke="none"
      />
    </g>
  )
}

/** 二値グリッドの1セル（ビット演算・パリティなど） */
export const GBit: FC<{ x: number; y: number; v: 0 | 1; size?: number; dim?: boolean }> = ({ x, y, v, size = 18, dim = false }) => (
  <g>
    <rect x={x} y={y} width={size} height={size} rx={3} fill={v ? ACCENT : TINT} stroke={BORDER} opacity={dim ? 0.45 : 1} />
    <text x={x + size / 2} y={y + size * 0.72} fontSize={10} textAnchor="middle" fill={v ? '#fff' : LABEL} opacity={dim ? 0.45 : 1} fontWeight={700}>
      {v}
    </text>
  </g>
)

/** ビット列の行ラベル＋セル群。tag は左ラベル */
export const GBitRow: FC<{ x: number; y: number; bits: (0 | 1)[]; tag?: string; cell?: number; dim?: boolean }> = ({
  x,
  y,
  bits,
  tag,
  cell = 18,
  dim = false,
}) => (
  <g>
    {tag && (
      <text x={x - 6} y={y + cell * 0.72} fontSize={10} textAnchor="end" fill={MUTED}>
        {tag}
      </text>
    )}
    {bits.map((v, i) => (
      <GBit key={i} x={x + i * (cell + 4)} y={y} v={v} size={cell} dim={dim} />
    ))}
  </g>
)

/** 棒グラフの1本分（縦棒） */
export const GBar: FC<{ x: number; y: number; w: number; h: number; fill?: string; stroke?: string }> = ({
  x,
  y,
  w,
  h,
  fill = TINT,
  stroke = ACCENT,
}) => <rect x={x} y={y} width={w} height={Math.max(0, h)} rx={3} fill={fill} stroke={stroke} />

/** 横方向の要素列（配列セル）＋添字行 */
export const GArrayRow: FC<{ x: number; y: number; values: (string | number)[]; cw?: number; ch?: number; marks?: Record<number, string> }> = ({
  x,
  y,
  values,
  cw = 34,
  ch = 26,
  marks = {},
}) => (
  <g>
    {values.map((v, i) => (
      <g key={i}>
        <rect
          x={x + i * cw}
          y={y}
          width={cw - 2}
          height={ch}
          rx={3}
          fill={marks[i] ? ACCENT : TINT}
          stroke={marks[i] ? ACCENT : BORDER}
          strokeWidth={marks[i] ? 2 : 1}
        />
        <text x={x + i * cw + (cw - 2) / 2} y={y + ch * 0.66} fontSize={11} textAnchor="middle" fill={LABEL} fontWeight={marks[i] ? 700 : 400}>
          {v}
        </text>
        <text x={x + i * cw + (cw - 2) / 2} y={y + ch + 12} fontSize={9} textAnchor="middle" fill={MUTED}>
          {marks[i] ?? i + 1}
        </text>
      </g>
    ))}
  </g>
)

/** 決定のひし形（条件） */
export const GDiamond: FC<{ cx: number; cy: number; w: number; h: number; text: string }> = ({ cx, cy, w, h, text }) => (
  <g>
    <path
      d={`M ${cx} ${cy - h / 2} L ${cx + w / 2} ${cy} L ${cx} ${cy + h / 2} L ${cx - w / 2} ${cy} Z`}
      fill="var(--color-warning-tint)"
      stroke="var(--color-warning)"
    />
    <text x={cx} y={cy + 4} fontSize={10} textAnchor="middle" fill={LABEL} fontWeight={700}>
      {text}
    </text>
  </g>
)

/** 円＋中身テキスト（プロトコル・装置など） */
export const GCircle: FC<{ cx: number; cy: number; r: number; text: string; fill?: string; ink?: string; fs?: number }> = ({
  cx,
  cy,
  r,
  text,
  fill = ACCENT,
  ink = '#fff',
  fs = 10,
}) => (
  <g>
    <circle cx={cx} cy={cy} r={r} fill={fill} />
    <text x={cx} y={cy + fs * 0.36} fontSize={fs} textAnchor="middle" fill={ink} fontWeight={700}>
      {text}
    </text>
  </g>
)
