/** グラフ操作デモ（仕様書 §8 データ活用 / L1）
 * SegmentedButtonでグラフ種別、Sliderで縦軸範囲。同一データの見え方をSVGで即時比較。
 */
import { useMemo, useState } from 'react'
import { Segmented } from '@/components/Segmented'
import styles from '../demo.module.css'
import s from './GraphDemo.module.css'

type ChartType = 'bar' | 'line'

const DATA = [
  { label: '4月', value: 55 },
  { label: '5月', value: 60 },
  { label: '6月', value: 58 },
  { label: '7月', value: 65 },
  { label: '8月', value: 63 },
]

const TYPE_OPTIONS = [
  { value: 'bar' as const, label: '棒グラフ' },
  { value: 'line' as const, label: '折れ線グラフ' },
]

/* SVG の描画領域 */
const W = 320
const H = 220
const LEFT = 40
const RIGHT = 10
const TOP = 14
const BOTTOM = 26
const PLOT_W = W - LEFT - RIGHT
const PLOT_H = H - TOP - BOTTOM
const Y_MAX = 100

const TICKS = [0, 20, 40, 60, 80, 100]

export default function GraphDemo() {
  const [type, setType] = useState<ChartType>('bar')
  const [axisMin, setAxisMin] = useState(0)

  const scale = useMemo(() => {
    const span = Y_MAX - axisMin
    return (v: number) => TOP + PLOT_H - ((v - axisMin) / span) * PLOT_H
  }, [axisMin])

  const barW = 34
  const stepX = PLOT_W / DATA.length
  const points = DATA.map((d, i) => ({
    x: LEFT + stepX * i + stepX / 2,
    y: scale(d.value),
    ...d,
  }))

  const visibleTicks = TICKS.filter((t) => t >= axisMin)
  const dataText = DATA.map((d) => `${d.label}${d.value}点`).join('、')
  const typeLabel = type === 'bar' ? '棒グラフ' : '折れ線グラフ'
  const exaggerated = axisMin > 0

  return (
    <div className={styles.demo}>
      <div className={styles.visual} aria-label="グラフ">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className={s.chart}
          role="img"
          aria-label={`${typeLabel}。縦軸は${axisMin}点から${Y_MAX}点。データは ${dataText}。`}
        >
          <title>
            {typeLabel}（縦軸 {axisMin}〜{Y_MAX}点）
          </title>
          {/* 横罫線と縦軸ラベル */}
          {visibleTicks.map((t) => (
            <g key={t}>
              <line x1={LEFT} y1={scale(t)} x2={W - RIGHT} y2={scale(t)} stroke="var(--color-border)" strokeWidth={1} />
              <text x={LEFT - 6} y={scale(t) + 4} fontSize={10} textAnchor="end" fill="var(--color-secondary-label)">
                {t}
              </text>
            </g>
          ))}
          <line x1={LEFT} y1={scale(axisMin)} x2={W - RIGHT} y2={scale(axisMin)} stroke="var(--color-label)" strokeWidth={1.5} />
          <line x1={LEFT} y1={TOP} x2={LEFT} y2={scale(axisMin)} stroke="var(--color-label)" strokeWidth={1.5} />

          {type === 'bar'
            ? points.map((p) => (
                <g key={p.label}>
                  <rect
                    x={p.x - barW / 2}
                    y={p.y}
                    width={barW}
                    height={scale(axisMin) - p.y}
                    rx={4}
                    fill="var(--color-accent-tint)"
                    stroke="var(--color-accent)"
                  />
                  <text x={p.x} y={p.y - 6} fontSize={10} textAnchor="middle" fill="var(--color-label)">
                    {p.value}
                  </text>
                  <text x={p.x} y={scale(axisMin) + 16} fontSize={10} textAnchor="middle" fill="var(--color-secondary-label)">
                    {p.label}
                  </text>
                </g>
              ))
            : (
              <>
                <polyline
                  points={points.map((p) => `${p.x},${p.y}`).join(' ')}
                  fill="none"
                  stroke="var(--color-accent)"
                  strokeWidth={2.5}
                />
                {points.map((p) => (
                  <g key={p.label}>
                    <circle cx={p.x} cy={p.y} r={4.5} fill="var(--color-accent)" />
                    <text x={p.x} y={p.y - 10} fontSize={10} textAnchor="middle" fill="var(--color-label)">
                      {p.value}
                    </text>
                    <text x={p.x} y={scale(axisMin) + 16} fontSize={10} textAnchor="middle" fill="var(--color-secondary-label)">
                      {p.label}
                    </text>
                  </g>
                ))}
              </>
            )}
        </svg>
      </div>

      <div className={styles.panel}>
        <div className={styles.panelRow}>
          <span className={styles.panelTitle} id="graph-type">
            グラフの種類
          </span>
          <Segmented label="グラフの種類" value={type} onChange={setType} options={TYPE_OPTIONS} />
        </div>
        <div className={styles.panelRow}>
          <label className={styles.panelTitle} htmlFor="graph-axis">
            縦軸の下限: {axisMin}点
          </label>
          <input
            id="graph-axis"
            type="range"
            min={0}
            max={50}
            step={10}
            value={axisMin}
            onChange={(e) => setAxisMin(Number(e.target.value))}
            className={s.slider}
            aria-describedby="graph-axis-note"
          />
        </div>
        <p className={exaggerated ? s.warn : s.info} id="graph-axis-note" aria-live="polite">
          {exaggerated
            ? '縦軸が0点から始まっていません。同じデータでも、変化が誇張されて見えやすくなります。'
            : '縦軸は0点から始まっています。増減の大きさが正直に見えます。'}
        </p>
        <p className={s.hint}>
          データは同じ（{dataText}）。グラフの種類と縦軸の範囲を変えると、読み手が受ける印象が変わります。
        </p>
      </div>
    </div>
  )
}
