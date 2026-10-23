/**
 * インタラクティブ図解の共通パーツ。
 * - 図は SVG + DOM（Canvas不使用: 仕様の「文字選択・拡大・読み上げに有利」を踏襲）
 * - 操作部品は44px以上、状態は色＋テキスト（アクセシビリティ §は README 参照）
 * - 解説の動きは「控えめ」: 100〜240ms。reduced motion では即時表示
 */
import { useId, type CSSProperties, type FC, type ReactNode } from 'react'
import { useReducedMotion } from '@/lib/motion'
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

const cleanTitle = (title: string) => title.replace(/^図解\s*[:：]\s*/, '')

/** 状態テキスト。高さを予約してステップ切替時のガタつきを抑える */
export const StatusLine: FC<{
  children: ReactNode
  kind?: 'ok' | 'ng' | 'plain'
  live?: boolean
}> = ({ children, kind = 'plain', live = true }) => (
  <p
    className={`${styles.status} ${kind === 'ok' ? styles.statusOk : kind === 'ng' ? styles.statusNg : ''}`}
    role="status"
    aria-live={live ? 'polite' : 'off'}
  >
    <span key={typeof children === 'string' ? children : undefined} className={styles.fadeIn}>
      {children}
    </span>
  </p>
)

export type StepControlsProps = {
  step: number
  total: number
  playing?: boolean
  onPrev: () => void
  onNext: () => void
  onReset: () => void
  onPlayToggle?: () => void
}

/** 図解のステップ操作。44px以上・キーボード操作可能 */
export const StepControls: FC<StepControlsProps> = ({
  step,
  total,
  playing = false,
  onPrev,
  onNext,
  onReset,
  onPlayToggle,
}) => {
  const last = total - 1
  const reduced = useReducedMotion()
  return (
    <div className={styles.stepArea}>
      <div className={styles.stepDots} aria-hidden="true">
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={`${styles.stepDot} ${i <= step ? styles.stepDotOn : ''}`} />
        ))}
      </div>
      <div className={styles.stepBar}>
        <button type="button" className={styles.btn} onClick={onPrev} disabled={step <= 0}>
          ← 戻る
        </button>
        <button
          type="button"
          className={`${styles.btn} ${styles.btnPrimary}`}
          onClick={onNext}
          disabled={step >= last}
        >
          次へ →
        </button>
        {onPlayToggle && !reduced && (
          <button
            type="button"
            className={styles.btn}
            onClick={onPlayToggle}
            aria-pressed={playing}
            disabled={total <= 1}
          >
            {playing ? '一時停止' : '再生'}
          </button>
        )}
        <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={onReset} disabled={step <= 0}>
          最初から
        </button>
      </div>
    </div>
  )
}

/** 解説内の図解コンテナ（新API） */
export const FigureFrame: FC<{
  title: string
  children: ReactNode
  status?: ReactNode
  statusKind?: 'ok' | 'ng' | 'plain'
  step?: number
  total?: number
  playing?: boolean
  onPrev?: () => void
  onNext?: () => void
  onReset?: () => void
  onPlayToggle?: () => void
  className?: string
}> = ({
  title,
  children,
  status,
  statusKind = 'plain',
  step,
  total,
  playing,
  onPrev,
  onNext,
  onReset,
  onPlayToggle,
  className,
}) => {
  const headingId = useId()
  const hasSteps = total != null && total > 1 && step != null && onPrev && onNext && onReset
  return (
    <section className={`${styles.fig} ${className ?? ''}`} aria-labelledby={headingId}>
      <header className={styles.figHead}>
        <span className={styles.figBadge} aria-hidden="true">
          図解
        </span>
        <h3 className={styles.figTitle} id={headingId}>
          {cleanTitle(title)}
        </h3>
        {hasSteps && (
          <span className={styles.stepTotal} aria-label={`全${total}ステップ中${step + 1}番目`}>
            {step + 1}/{total}
          </span>
        )}
      </header>
      {children}
      {status != null && (
        <StatusLine kind={statusKind} live={!playing}>
          {status}
        </StatusLine>
      )}
      {hasSteps && (
        <StepControls
          step={step}
          total={total}
          playing={playing}
          onPrev={onPrev}
          onNext={onNext}
          onReset={onReset}
          onPlayToggle={onPlayToggle}
        />
      )}
    </section>
  )
}

/** 旧API。残り64本の図解を壊さずに新フレームへ載せる */
export const FigShell: FC<{
  title: string
  children: ReactNode
  status?: ReactNode
  statusKind?: 'ok' | 'ng' | 'plain'
}> = ({ title, children, status, statusKind = 'plain' }) => (
  <FigureFrame title={title} status={status} statusKind={statusKind}>
    {children}
  </FigureFrame>
)

/** 図の本体。interactive のときは role=img にせず、中の操作を読み上げ可能にする */
export const Canvas: FC<{
  label: string
  children: ReactNode
  interactive?: boolean
  className?: string
}> = ({ label, children, interactive = false, className }) => (
  <div
    className={`${styles.visual} ${interactive ? styles.visualInteractive : ''} ${className ?? ''}`}
    role={interactive ? 'group' : 'img'}
    aria-label={label}
  >
    {children}
  </div>
)

/** 旧API（静的図向け）。新規は Canvas を使う */
export const View: FC<{ children: ReactNode; label: string }> = ({ children, label }) => (
  <Canvas label={label}>{children}</Canvas>
)

type BtnProps = {
  children: ReactNode
  onClick: () => void
  on?: boolean
  disabled?: boolean
  small?: boolean
  ariaPressed?: boolean
  ariaLabel?: string
  className?: string
}

/** 図解内の切り替え・実行ボタン（押されたら on で強調） */
export const Btn: FC<BtnProps> = ({
  children,
  onClick,
  on = false,
  disabled = false,
  small = false,
  ariaPressed,
  ariaLabel,
  className,
}) => (
  <button
    type="button"
    className={`${styles.btn} ${on ? styles.btnOn : ''} ${small ? styles.btnSm : ''} ${className ?? ''}`}
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
    <div className={styles.sliderRow}>
      <div className={styles.sliderHead}>
        <label className={styles.sliderLabel} htmlFor={id}>
          {label}
        </label>
        <output className={styles.sliderValue} htmlFor={id}>
          {fmt ? fmt(value) : value}
        </output>
      </div>
      <input
        id={id}
        type="range"
        className={styles.slider}
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={fmt ? fmt(value) : String(value)}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  )
}

export type ReadoutItem = { k: string; v: string; strong?: boolean; ok?: boolean; ng?: boolean }

/** 数値表示（計算の中間値など）。ボタンに見えない読み取り専用のdl */
export const Readout: FC<{ items: ReadoutItem[] }> = ({ items }) => (
  <dl className={styles.readout}>
    {items.map((p, i) => (
      <div key={`${p.k}-${i}`} className={styles.readoutItem}>
        <dt className={styles.readoutKey}>{p.k}</dt>
        <dd
          className={`${styles.readoutValue} ${p.strong ? styles.readoutStrong : ''} ${p.ok ? styles.readoutOk : p.ng ? styles.readoutNg : ''}`}
        >
          {p.v}
        </dd>
      </div>
    ))}
  </dl>
)

/** 旧API（既存図解との互換） */
export const Calc: FC<{ parts: ReadoutItem[] }> = ({ parts }) => <Readout items={parts} />

/* ---------- HTMLのセル列（配列・ビット） ---------- */

export type CellState = 'ok' | 'ng' | 'muted'

export const CellTrack: FC<{
  values: (string | number)[]
  states?: (CellState | undefined)[]
  marks?: (string | undefined)[]
  current?: number
  pressed?: (boolean | undefined)[]
  onSelect?: (index: number) => void
  pulseIndex?: number | null
  showIndex?: boolean
  compact?: boolean
  wrap?: boolean
  ariaLabel?: string
}> = ({
  values,
  states = [],
  marks = [],
  current,
  pressed,
  onSelect,
  pulseIndex = null,
  showIndex = false,
  compact = false,
  wrap = false,
  ariaLabel,
}) => (
  <ul
    className={styles.cells}
    style={
      {
        gridTemplateColumns: wrap
          ? 'repeat(auto-fill, minmax(var(--tap-min), 1fr))'
          : `repeat(${values.length}, minmax(0, 1fr))`,
      } as CSSProperties
    }
    aria-label={ariaLabel}
  >
    {values.map((value, i) => {
      const stateClass =
        states[i] === 'ok'
          ? styles.cellOk
          : states[i] === 'ng'
            ? styles.cellBad
            : states[i] === 'muted'
              ? styles.cellDim
              : ''
      const cls = [
        styles.cell,
        compact ? styles.cellCompact : '',
        stateClass,
        current === i ? styles.cellCurrent : '',
        pulseIndex === i ? styles.cellPulse : '',
      ]
        .filter(Boolean)
        .join(' ')
      const stateMark = marks[i]
      const mark = stateMark ?? (showIndex ? String(i + 1) : undefined)
      const inner = (
        <>
          <span className={styles.cellValue}>{value}</span>
          {mark && <span className={styles.cellMark}>{mark}</span>}
        </>
      )
      return (
        <li key={i} className={styles.cellItem}>
          {onSelect ? (
            <button
              type="button"
              className={cls}
              onClick={() => onSelect(i)}
              aria-pressed={pressed ? pressed[i] : undefined}
              aria-current={current === i ? 'step' : undefined}
              aria-label={`${i + 1}番目 ${value}${stateMark ? `、${stateMark}` : ''}`}
            >
              {inner}
            </button>
          ) : (
            <span className={cls} aria-current={current === i ? 'step' : undefined}>
              {inner}
            </span>
          )}
        </li>
      )
    })}
  </ul>
)

/** ビット列。操作可能な場合は1ビットずつフォーカスできるボタンになる */
export const BitGrid: FC<{
  bits: (0 | 1)[]
  label?: string
  onToggle?: (index: number) => void
  errorIndex?: number | null
  pulseIndex?: number | null
  dim?: boolean
}> = ({ bits, label, onToggle, errorIndex = null, pulseIndex = null, dim = false }) => (
  <div className={styles.bitRow}>
    {label && <span className={styles.cellTag}>{label}</span>}
    <CellTrack
      values={bits}
      compact
      onSelect={onToggle}
      pressed={bits.map((b) => b === 1)}
      states={bits.map((_, i) => (errorIndex === i ? 'ng' : dim ? 'muted' : undefined))}
      marks={bits.map((_, i) => (errorIndex === i ? '誤' : undefined))}
      pulseIndex={pulseIndex}
      wrap
      showIndex
      ariaLabel={label ? `${label}のビット列` : 'ビット列'}
    />
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
    <text
      x={x + w / 2}
      y={y + h / 2 + fs * 0.36}
      fontSize={fs}
      textAnchor="middle"
      fill={ink}
      fontWeight={bold ? 700 : 400}
    >
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
export const GBit: FC<{ x: number; y: number; v: 0 | 1; size?: number; dim?: boolean }> = ({
  x,
  y,
  v,
  size = 18,
  dim = false,
}) => (
  <g>
    <rect
      x={x}
      y={y}
      width={size}
      height={size}
      rx={3}
      fill={v ? ACCENT : TINT}
      stroke={BORDER}
      opacity={dim ? 0.45 : 1}
    />
    <text
      x={x + size / 2}
      y={y + size * 0.72}
      fontSize={10}
      textAnchor="middle"
      fill={v ? '#fff' : LABEL}
      opacity={dim ? 0.45 : 1}
      fontWeight={700}
    >
      {v}
    </text>
  </g>
)

/** ビット列の行ラベル＋セル群。tag は左ラベル */
export const GBitRow: FC<{
  x: number
  y: number
  bits: (0 | 1)[]
  tag?: string
  cell?: number
  dim?: boolean
}> = ({ x, y, bits, tag, cell = 18, dim = false }) => (
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
export const GArrayRow: FC<{
  x: number
  y: number
  values: (string | number)[]
  cw?: number
  ch?: number
  marks?: Record<number, string>
}> = ({ x, y, values, cw = 34, ch = 26, marks = {} }) => (
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
        <text
          x={x + i * cw + (cw - 2) / 2}
          y={y + ch * 0.66}
          fontSize={11}
          textAnchor="middle"
          fill={LABEL}
          fontWeight={marks[i] ? 700 : 400}
        >
          {v}
        </text>
        <text
          x={x + i * cw + (cw - 2) / 2}
          y={y + ch + 12}
          fontSize={9}
          textAnchor="middle"
          fill={MUTED}
        >
          {marks[i] ?? i + 1}
        </text>
      </g>
    ))}
  </g>
)

/** 決定のひし形（条件） */
export const GDiamond: FC<{ cx: number; cy: number; w: number; h: number; text: string }> = ({
  cx,
  cy,
  w,
  h,
  text,
}) => (
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
export const GCircle: FC<{
  cx: number
  cy: number
  r: number
  text: string
  fill?: string
  ink?: string
  fs?: number
}> = ({ cx, cy, r, text, fill = ACCENT, ink = '#fff', fs = 10 }) => (
  <g>
    <circle cx={cx} cy={cy} r={r} fill={fill} />
    <text x={cx} y={cy + fs * 0.36} fontSize={fs} textAnchor="middle" fill={ink} fontWeight={700}>
      {text}
    </text>
  </g>
)
