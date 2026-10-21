/** ビット演算デモ（仕様書 §8 ネットワーク / L1）
 * SwitchでAND/OR/XOR、Sliderでビット列選択。
 * ビットグリッド3列（背景・キャラクター・結果）、即時反映。
 */
import { useState } from 'react'
import { Segmented } from '@/components/Segmented'
import styles from '../demo.module.css'
import s from './BitOpsDemo.module.css'

type Op = 'AND' | 'OR' | 'XOR'

const N = 8
type Bits = (0 | 1)[]

const OPS: readonly { value: Op; label: string; explain: string }[] = [
  { value: 'AND', label: 'AND（かつ）', explain: '両方が1のところだけ1になる。共通部分が残る。' },
  { value: 'OR', label: 'OR（または）', explain: 'どちらかが1なら1になる。重なっていない部分も残る。' },
  { value: 'XOR', label: 'XOR（排他的）', explain: '異なるところだけ1になる。重なった部分が消える。' },
]

function applyOp(op: Op, a: 0 | 1, b: 0 | 1): 0 | 1 {
  if (op === 'AND') return (a & b) as 0 | 1
  if (op === 'OR') return (a | b) as 0 | 1
  return (a ^ b) as 0 | 1
}

const OP_OPTIONS = OPS.map(({ value, label }) => ({ value, label }))

/** ビット行。editable な行は各セルが aria-pressed のボタンになる */
function BitRow({
  name,
  bits,
  activeIndex,
  onToggle,
  editable,
}: {
  name: string
  bits: Bits
  activeIndex: number
  onToggle?: (i: number) => void
  editable?: boolean
}) {
  return (
    <div className={s.row}>
      <span className={s.rowName}>{name}</span>
      <div className={s.cells}>
        {bits.map((v, i) =>
          editable ? (
            <button
              key={i}
              type="button"
              className={`${s.cell} ${v ? s.cellOn : s.cellOff} ${i === activeIndex ? s.cellSel : ''}`}
              aria-pressed={v === 1}
              aria-label={`${name}の${i + 1}桁目（いま${v}）。タップで反転`}
              onClick={() => onToggle?.(i)}
            >
              {v}
            </button>
          ) : (
            <span
              key={i}
              className={`${s.cell} ${v ? s.cellOn : s.cellOff}`}
              aria-label={`${name}の${i + 1}桁目は${v}`}
            >
              {v}
            </span>
          ),
        )}
      </div>
    </div>
  )
}

export default function BitOpsDemo() {
  const [op, setOp] = useState<Op>('OR')
  const [bg, setBg] = useState<Bits>([1, 1, 0, 0, 1, 1, 0, 0])
  const [ch, setCh] = useState<Bits>([1, 0, 1, 0, 1, 0, 1, 0])
  const [sel, setSel] = useState(4)

  const result = bg.map((b, i) => applyOp(op, b, ch[i]))
  const resultText = `演算は${op}。結果のビット列は ${result.join('')} です。`

  const toggle = (row: 'bg' | 'ch') => (i: number) => {
    const setter = row === 'bg' ? setBg : setCh
    setter((prev) => prev.map((v, j) => (j === i ? ((1 - v) as 0 | 1) : v)))
  }

  const activeBits = op === 'AND' ? '両方1' : op === 'OR' ? 'どちらか1' : '異なる'

  return (
    <div className={styles.demo}>
      <div className={styles.visual} aria-label="ビットグリッド">
        <BitRow name="背景" bits={bg} activeIndex={sel} onToggle={toggle('bg')} editable />
        <BitRow name="キャラ" bits={ch} activeIndex={sel} onToggle={toggle('ch')} editable />
        <div className={s.resultRow} aria-hidden="true">
          <span className={s.rowName}>結果</span>
          <div className={s.cells}>
            {result.map((v, i) => (
              <span key={i} className={`${s.cell} ${v ? s.cellOn : s.cellOff}`}>
                {v}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.panel}>
        <div className={styles.panelRow}>
          <span className={styles.panelTitle} id="bit-op">
            演算（Switch）
          </span>
          <Segmented label="演算の種類" value={op} onChange={setOp} options={OP_OPTIONS} />
          <p className={s.opExplain} aria-live="polite">
            {OPS.find((o) => o.value === op)?.explain}
          </p>
        </div>

        <div className={styles.panelRow}>
          <label className={styles.panelTitle} htmlFor="bit-slider">
            ビット位置（Slider）: {sel + 1}桁目
          </label>
          <input
            id="bit-slider"
            type="range"
            min={0}
            max={N - 1}
            step={1}
            value={sel}
            onChange={(e) => setSel(Number(e.target.value))}
            className={s.slider}
          />
          <div className={s.toggleRow}>
            <button type="button" className={s.toggleBtn} onClick={() => toggle('bg')(sel)}>
              背景の{sel + 1}桁目を反転
            </button>
            <button type="button" className={s.toggleBtn} onClick={() => toggle('ch')(sel)}>
              キャラの{sel + 1}桁目を反転
            </button>
          </div>
        </div>

        <p className={styles.resultText} aria-live="polite">
          {resultText}
        </p>
        <p className={s.legend}>
          1 = 白い部分（残る）、0 = 黒い部分（消える）。{op}では「{activeBits}」の場所が1になる。
        </p>
      </div>
    </div>
  )
}
