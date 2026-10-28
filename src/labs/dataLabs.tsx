/**
 * データ活用の実験（追加分）。階級幅・相関・箱ひげ図・移動平均・欠損値。
 */
import { useState } from 'react'
import { Segmented } from '@/components/Segmented'
import { Btn, Canvas, CellTrack, FigureFrame, Note, Readout, Slider } from '@/figures/parts'
import fig from '@/figures/figures.module.css'
import { fillMissing, histogram, leastSquares, mean, median, mode, movingAverage, pearson, quantile, stddev, type MissingMode } from './sim'
import s from './labs.module.css'

/* ---------- ヒストグラムの階級幅 ---------- */

const SCORES = [42, 48, 52, 55, 58, 60, 62, 63, 65, 67, 68, 70, 72, 75, 78, 80, 82, 85, 90, 95]

export function HistogramLab() {
  const [width, setWidth] = useState(10)
  const bins = histogram(SCORES, width)
  const maxCount = Math.max(...bins.map((b) => b.count), 1)
  const barWidth = 288 / bins.length
  const labelStep = Math.ceil(bins.length / 7)

  return (
    <FigureFrame
      badge="実験"
      title="階級の幅を変えると、分布の形が変わる"
      status={`${width}点ごとに区切ると${bins.length}階級。幅を小さくすると細かく見えるが、形がギザギザになりやすい。`}
    >
      <Slider label="階級の幅 [点]" value={width} min={2} max={20} onChange={setWidth} fmt={(v) => `${v}点`} />
      <Canvas label={`${SCORES.length}人の得点のヒストグラム`} interactive>
        <svg viewBox="0 0 320 112" className={fig.svg} role="img" aria-label={`階級の幅${width}点のヒストグラム。${bins.map((b) => `${b.start}点台が${b.count}人`).join('、')}`}>
          <line x1={16} y1={78} x2={304} y2={78} stroke="var(--color-border)" />
          {bins.map((bin, i) => {
            const h = (bin.count / maxCount) * 62
            return (
              <g key={bin.start}>
                <rect
                  x={16 + i * barWidth + 1}
                  y={78 - h}
                  width={Math.max(1, barWidth - 2)}
                  height={h}
                  rx={2}
                  fill="var(--color-accent-tint)"
                  stroke="var(--color-accent)"
                />
                {bin.count > 0 && (
                  <text x={16 + i * barWidth + barWidth / 2} y={74 - h} fontSize={11} textAnchor="middle" fill="var(--color-secondary-label)">
                    {bin.count}
                  </text>
                )}
                {i % labelStep === 0 && (
                  <text x={16 + i * barWidth + barWidth / 2} y={94} fontSize={11} textAnchor="middle" fill="var(--color-secondary-label)">
                    {bin.start}
                  </text>
                )}
              </g>
            )
          })}
          <text x={160} y={108} fontSize={11} textAnchor="middle" fill="var(--color-secondary-label)">
            得点（点）
          </text>
        </svg>
      </Canvas>
      <Readout
        items={[
          { k: '階級の数', v: `${bins.length}個` },
          { k: '平均値', v: mean(SCORES).toFixed(1) },
          { k: '中央値', v: median(SCORES).toFixed(1) },
        ]}
      />
      <Note>階級の幅を変えると同じデータでも山の見え方が変わる。幅を決めてから、分布の形を読む。</Note>
    </FigureFrame>
  )
}

/* ---------- 相関 ---------- */

const CORR_SETS = [
  {
    value: 'positive' as const,
    label: '正の相関',
    points: [
      { x: 12, y: 15 }, { x: 20, y: 26 }, { x: 28, y: 22 }, { x: 36, y: 40 }, { x: 44, y: 38 },
      { x: 52, y: 55 }, { x: 60, y: 52 }, { x: 68, y: 70 }, { x: 76, y: 66 }, { x: 86, y: 88 },
    ],
  },
  {
    value: 'none' as const,
    label: '相関なし',
    points: [
      { x: 12, y: 52 }, { x: 20, y: 20 }, { x: 28, y: 78 }, { x: 36, y: 44 }, { x: 44, y: 68 },
      { x: 52, y: 24 }, { x: 60, y: 56 }, { x: 68, y: 36 }, { x: 76, y: 82 }, { x: 86, y: 48 },
    ],
  },
  {
    value: 'negative' as const,
    label: '負の相関',
    points: [
      { x: 12, y: 86 }, { x: 20, y: 72 }, { x: 28, y: 78 }, { x: 36, y: 60 }, { x: 44, y: 64 },
      { x: 52, y: 46 }, { x: 60, y: 50 }, { x: 68, y: 32 }, { x: 76, y: 38 }, { x: 86, y: 16 },
    ],
  },
] as const
type CorrId = (typeof CORR_SETS)[number]['value']

export function CorrelationLab() {
  const [id, setId] = useState<CorrId>('positive')
  const points = CORR_SETS.find((set) => set.value === id)!.points
  const r = pearson(points)
  const x = (v: number) => 16 + v * 2.88
  const y = (v: number) => 94 - v * 0.78

  return (
    <FigureFrame
      badge="実験"
      title="散布図を切り替えて、相関係数を見る"
      status={`相関係数 r = ${r.toFixed(2)}。${
        r > 0.7 ? '右上がりの強い正の相関。' : r < -0.7 ? '右下がりの強い負の相関。' : 'はっきりした直線関係は見えにくい。'
      }`}
    >
      <Segmented label="データの形" value={id} options={CORR_SETS} onChange={setId} />
      <Canvas label="2つの変数の散布図" interactive>
        <svg viewBox="0 0 320 116" className={fig.svg} role="img" aria-label={`散布図。相関係数は${r.toFixed(2)}`}>
          <line x1={16} y1={94} x2={304} y2={94} stroke="var(--color-border)" />
          <line x1={16} y1={10} x2={16} y2={94} stroke="var(--color-border)" />
          {points.map((p, i) => (
            <circle key={i} cx={x(p.x)} cy={y(p.y)} r={4} fill="var(--color-accent)" />
          ))}
          <text x={160} y={112} fontSize={11} textAnchor="middle" fill="var(--color-secondary-label)">
            一方の値
          </text>
        </svg>
      </Canvas>
      <Readout
        items={[
          { k: '相関係数 r', v: r.toFixed(2), strong: true },
          { k: '向き', v: r > 0 ? '正（右上がり）' : r < 0 ? '負（右下がり）' : 'なし' },
          { k: '強さ', v: Math.abs(r) >= 0.7 ? '強い' : Math.abs(r) >= 0.4 ? '中くらい' : '弱い' },
        ]}
      />
      <Note>相関があっても、因果関係があるとは限らない。第3の要因が両方に影響している場合がある。</Note>
    </FigureFrame>
  )
}

/* ---------- 箱ひげ図 ---------- */

const BOX_VALUES = [52, 58, 61, 64, 66, 68, 70, 72, 75, 78]

export function BoxPlotLab() {
  const [withOutlier, setWithOutlier] = useState(false)
  const values = withOutlier ? [...BOX_VALUES, 100] : BOX_VALUES
  const q1 = quantile(values, 0.25)
  const med = quantile(values, 0.5)
  const q3 = quantile(values, 0.75)
  const iqr = q3 - q1
  const fence = q3 + iqr * 1.5
  const inside = values.filter((v) => v <= fence)
  const outliers = values.filter((v) => v > fence)
  const min = Math.min(...inside)
  const max = Math.max(...inside)
  const x = (v: number) => 16 + ((v - 40) / 65) * 288

  return (
    <FigureFrame
      badge="実験"
      title="外れ値を足すと、箱ひげ図はどう変わる？"
      status={`Q1=${q1}、中央値=${med}、Q3=${q3}、IQR=${iqr.toFixed(1)}。${
        outliers.length > 0 ? '100は外れ値として、ひげの外に点で示す。' : '外れ値はない。'
      }`}
      statusKind={outliers.length > 0 ? 'ng' : 'plain'}
    >
      <div className={fig.ctrl}>
        <Btn on={withOutlier} ariaPressed={withOutlier} onClick={() => setWithOutlier((v) => !v)}>
          100点を1人追加
        </Btn>
      </div>
      <Canvas label="得点の箱ひげ図" interactive>
        <svg viewBox="0 0 320 100" className={fig.svg} role="img" aria-label={`箱ひげ図。Q1 ${q1}、中央値 ${med}、Q3 ${q3}`}>
          <line x1={x(min)} y1={54} x2={x(max)} y2={54} stroke="var(--color-secondary-label)" />
          <line x1={x(min)} y1={40} x2={x(min)} y2={68} stroke="var(--color-secondary-label)" />
          <line x1={x(max)} y1={40} x2={x(max)} y2={68} stroke="var(--color-secondary-label)" />
          <rect x={x(q1)} y={34} width={Math.max(1, x(q3) - x(q1))} height={40} rx={4} fill="var(--color-accent-tint)" stroke="var(--color-accent)" />
          <line x1={x(med)} y1={34} x2={x(med)} y2={74} stroke="var(--color-accent)" strokeWidth={2} />
          {outliers.map((v) => (
            <circle key={v} cx={x(v)} cy={54} r={4} fill="var(--color-error)" />
          ))}
          {[40, 60, 80, 100].map((v) => (
            <text key={v} x={x(v)} y={92} fontSize={11} textAnchor="middle" fill="var(--color-secondary-label)">
              {v}
            </text>
          ))}
        </svg>
      </Canvas>
      <Readout
        items={[
          { k: 'Q1（25%）', v: `${q1}` },
          { k: '中央値', v: `${med}`, strong: true },
          { k: 'Q3（75%）', v: `${q3}` },
          { k: '外れ値', v: outliers.length > 0 ? outliers.join('、') : 'なし', ng: outliers.length > 0 },
        ]}
      />
      <Note>箱の長さ（IQR）から大きく離れた値は外れ値として扱う。1人の100点で中央値はほとんど動かない。</Note>
    </FigureFrame>
  )
}

/* ---------- 移動平均 ---------- */

const MONTH_VALUES = [20, 24, 22, 30, 28, 35, 33, 40, 38, 45, 42, 48]

export function MovingAverageLab() {
  const [window, setWindow] = useState(3)
  const smoothed = movingAverage(MONTH_VALUES, window)
  const x = (i: number) => 16 + i * 24
  const y = (v: number) => 94 - v * 1.15
  const path = (values: readonly number[]) => values.map((v, i) => `${x(i)},${y(v)}`).join(' ')

  return (
    <FigureFrame
      badge="実験"
      title="移動平均で、細かい変動をならす"
      status={`直近${window}か月の平均をとると、月ごとのギザギザが減り、ゆるやかな傾向が見えやすくなる。`}
    >
      <Slider label="平均をとる期間" value={window} min={2} max={6} onChange={setWindow} fmt={(v) => `${v}か月`} />
      <Canvas label="月ごとの値と移動平均" interactive>
        <svg viewBox="0 0 320 112" className={fig.svg} role="img" aria-label={`12か月の値と、${window}か月移動平均`}>
          <line x1={16} y1={94} x2={298} y2={94} stroke="var(--color-border)" />
          <polyline points={path(MONTH_VALUES)} fill="none" stroke="var(--color-border)" strokeWidth={2} />
          <polyline points={path(smoothed)} fill="none" stroke="var(--color-accent)" strokeWidth={2.5} />
          <text x={160} y={108} fontSize={11} textAnchor="middle" fill="var(--color-secondary-label)">
            灰色 = 元の値 ／ 青 = 移動平均
          </text>
        </svg>
      </Canvas>
      <Readout
        items={[
          { k: '期間', v: `${window}か月` },
          { k: '元の最終月', v: `${MONTH_VALUES[MONTH_VALUES.length - 1]}` },
          { k: '移動平均の最終月', v: smoothed[smoothed.length - 1].toFixed(1), strong: true },
        ]}
      />
      <Note>期間を長くするほど滑らかになるが、変化への反応は遅れる。最初の数か月は平均するデータが少ない。</Note>
    </FigureFrame>
  )
}

/* ---------- 欠損値 ---------- */

const MISSING_VALUES: (number | null)[] = [10, null, 20, 30, null, 40, 50]
const MISSING_OPTIONS = [
  { value: 'drop', label: '除外する' },
  { value: 'zero', label: '0で補う' },
  { value: 'mean', label: '平均で補う' },
] as const

export function MissingDataLab() {
  const [mode, setMode] = useState<MissingMode>('drop')
  const filled = fillMissing(MISSING_VALUES, mode)
  const avg = mean(filled)

  return (
    <FigureFrame
      badge="実験"
      title="欠損値の扱いで、平均は変わる？"
      status={`欠損値の扱いを「${MISSING_OPTIONS.find((o) => o.value === mode)!.label}」にすると、平均は ${avg.toFixed(1)}。`}
    >
      <CellTrack
        values={MISSING_VALUES.map((v) => (v == null ? '—' : v))}
        states={MISSING_VALUES.map((v) => (v == null ? 'muted' : undefined))}
        marks={MISSING_VALUES.map((v) => (v == null ? '欠損' : undefined))}
        wrap
        ariaLabel="欠損を含むデータ"
      />
      <Segmented label="欠損値の扱い" value={mode} options={MISSING_OPTIONS} onChange={setMode} />
      <Readout
        items={[
          { k: '使った件数', v: `${filled.length}件` },
          { k: '平均', v: avg.toFixed(1), strong: true },
          { k: '補った値', v: mode === 'drop' ? 'なし' : mode === 'zero' ? '0' : mean(MISSING_VALUES.filter((v): v is number => v != null)).toFixed(1) },
        ]}
      />
      <Note>0で補うと平均が下がり、平均で補うと平均は変わらない。欠損を勝手に埋めず、理由を記録する。</Note>
    </FigureFrame>
  )
}

/* ---------- 最頻値と値域（追加30本） ---------- */

const MODE_VALUES = [3, 5, 5, 6, 7, 7, 7, 9]

export function ModeRangeLab() {
  const [withOutlier, setWithOutlier] = useState(false)
  const values = withOutlier ? [...MODE_VALUES, 30] : MODE_VALUES
  const best = mode(values)
  const range = Math.max(...values) - Math.min(...values)

  return (
    <FigureFrame
      badge="実験"
      title="外れ値を足すと、最頻値と値域はどう変わる？"
      status={`最頻値は ${best}、値域は ${range}。${withOutlier ? '30を足すと値域は大きく広がるが、最頻値は変わらない。' : '外れ値を1件足すと、値域だけが大きく動く。'}`}
    >
      <div className={fig.ctrl}>
        <Btn on={withOutlier} ariaPressed={withOutlier} onClick={() => setWithOutlier((v) => !v)}>
          30を1件追加
        </Btn>
      </div>
      <CellTrack values={values} wrap ariaLabel="最頻値と値域を調べるデータ" />
      <Readout
        items={[
          { k: '最頻値', v: `${best}`, strong: true },
          { k: '値域（最大−最小）', v: `${range}` },
          { k: '平均値', v: mean(values).toFixed(1) },
          { k: '中央値', v: median(values).toFixed(1) },
        ]}
      />
      <Note>最頻値は最も多く出る値、値域は最大と最小の差。外れ値1つで値域は大きく変わる。</Note>
    </FigureFrame>
  )
}

/* ---------- 標準偏差 ---------- */

export function StandardDeviationLab() {
  const [spread, setSpread] = useState(6)
  const values = [50, 50 + spread, 50 - spread, 50 + spread / 2, 50 - spread / 2, 50]
  const sd = stddev(values)
  const x = (v: number) => 16 + v * 2.88

  return (
    <FigureFrame
      badge="実験"
      title="散らばりが大きいほど、標準偏差は大きい？"
      status={`平均は${mean(values).toFixed(1)}、標準偏差は${sd.toFixed(1)}。値を散らすほど標準偏差が大きくなる。`}
    >
      <Slider label="平均からの散らばり" value={spread} min={0} max={20} onChange={setSpread} fmt={(v) => `±${v}`} />
      <Canvas label="データの分布と平均±標準偏差の帯" interactive>
        <svg viewBox="0 0 320 100" className={fig.svg} role="img" aria-label={`平均${mean(values).toFixed(1)}、標準偏差${sd.toFixed(1)}`}>
          <line x1={16} y1={58} x2={304} y2={58} stroke="var(--color-border)" />
          <rect x={x(50 - sd)} y={44} width={Math.max(1, 2 * sd * 2.88)} height={28} rx={4} fill="var(--color-accent-tint)" />
          <line x1={x(50)} y1={30} x2={x(50)} y2={72} stroke="var(--color-accent)" strokeWidth={2} />
          {values.map((v, i) => (
            <circle key={i} cx={x(v)} cy={58} r={4} fill="var(--color-accent)" />
          ))}
          {[0, 25, 50, 75, 100].map((v) => (
            <text key={v} x={x(v)} y={90} fontSize={11} textAnchor="middle" fill="var(--color-secondary-label)">
              {v}
            </text>
          ))}
        </svg>
      </Canvas>
      <Readout
        items={[
          { k: '平均', v: mean(values).toFixed(1) },
          { k: '標準偏差', v: sd.toFixed(1), strong: true },
          { k: '範囲', v: `${Math.min(...values)}〜${Math.max(...values)}` },
        ]}
      />
      <Note>標準偏差は平均からのずれの大きさを表す。大きいほどデータが散らばっている。</Note>
    </FigureFrame>
  )
}

/* ---------- 回帰直線 ---------- */

const REGRESSION_POINTS = [
  { x: 10, y: 18 },
  { x: 22, y: 26 },
  { x: 30, y: 35 },
  { x: 42, y: 38 },
  { x: 50, y: 52 },
  { x: 62, y: 58 },
  { x: 70, y: 66 },
  { x: 82, y: 74 },
]

export function RegressionLab() {
  const [withOutlier, setWithOutlier] = useState(false)
  const points = withOutlier ? [...REGRESSION_POINTS, { x: 88, y: 14 }] : REGRESSION_POINTS
  const { slope, intercept } = leastSquares(points)
  const r = pearson(points)
  const x = (v: number) => 16 + v * 2.88
  const y = (v: number) => Math.min(94, Math.max(8, 94 - v * 0.78))

  return (
    <FigureFrame
      badge="実験"
      title="回帰直線は、外れ値1点で変わる？"
      status={`直線は y = ${slope.toFixed(2)}x + ${intercept.toFixed(1)}、相関係数は r = ${r.toFixed(2)}。${withOutlier ? '外れ値を足すと、直線の傾きが小さくなった。' : '外れ値を足すと、直線の傾きが変わる。'}`}
    >
      <div className={fig.ctrl}>
        <Btn on={withOutlier} ariaPressed={withOutlier} onClick={() => setWithOutlier((v) => !v)}>
          外れ値を1点追加
        </Btn>
      </div>
      <Canvas label="散布図と最小二乗の回帰直線" interactive>
        <svg viewBox="0 0 320 116" className={fig.svg} role="img" aria-label={`傾き${slope.toFixed(2)}、切片${intercept.toFixed(1)}、相関係数${r.toFixed(2)}`}>
          <line x1={16} y1={94} x2={304} y2={94} stroke="var(--color-border)" />
          <line x1={16} y1={10} x2={16} y2={94} stroke="var(--color-border)" />
          <line x1={x(0)} y1={y(intercept)} x2={x(100)} y2={y(intercept + slope * 100)} stroke="var(--color-accent)" strokeWidth={2} />
          {points.map((p, i) => (
            <circle key={i} cx={x(p.x)} cy={y(p.y)} r={4} fill={i === points.length - 1 && withOutlier ? 'var(--color-error)' : 'var(--color-accent)'} />
          ))}
          <text x={160} y={112} fontSize={11} textAnchor="middle" fill="var(--color-secondary-label)">
            一方の値
          </text>
        </svg>
      </Canvas>
      <Readout
        items={[
          { k: '傾き', v: slope.toFixed(2), strong: true },
          { k: '切片', v: intercept.toFixed(1) },
          { k: '相関係数 r', v: r.toFixed(2) },
        ]}
      />
      <Note>回帰直線は点とのずれが小さくなるように引く。外れ値1点で傾きが大きく変わることがある。</Note>
    </FigureFrame>
  )
}

/* ---------- 尺度水準 ---------- */

const SCALE_OPTIONS = [
  { value: 'blood', label: '血液型' },
  { value: 'satisfaction', label: '満足度' },
  { value: 'temperature', label: '気温' },
  { value: 'height', label: '身長' },
] as const
type ScaleId = (typeof SCALE_OPTIONS)[number]['value']

const SCALES: Record<ScaleId, { level: string; example: string; ops: string }> = {
  blood: { level: '名義尺度', example: 'A・B・O・AB', ops: '等しいかどうか' },
  satisfaction: { level: '順序尺度', example: '1〜5の5段階', ops: '大小の比較' },
  temperature: { level: '間隔尺度', example: '10℃・20℃・30℃', ops: '差の比較（20℃は10℃より10高い）' },
  height: { level: '比例尺度', example: '150cm・160cm・170cm', ops: '比の比較（160cmは80cmの2倍）' },
}

export function ScaleLevelLab() {
  const [id, setId] = useState<ScaleId>('blood')
  const info = SCALES[id]

  return (
    <FigureFrame
      badge="実験"
      title="そのデータ、どの尺度で測っている？"
      status={`${info.example} は${info.level}。できるのは${info.ops}。`}
    >
      <Segmented label="データの例" value={id} options={SCALE_OPTIONS} onChange={setId} />
      <Canvas label="尺度水準の4段階" interactive>
        <div className={s.bars} role="img" aria-label={`${info.level}。できる比較は${info.ops}`}>
          {['名義', '順序', '間隔', '比例'].map((name) => {
            const active = info.level.startsWith(name)
            return (
              <div key={name} className={s.barRow}>
                <div className={s.barHead}>
                  <span>{name}尺度</span>
                  <strong>{active ? '← このデータ' : ''}</strong>
                </div>
                <div className={s.barTrack}>
                  <div className={`${s.barFill} ${active ? s.barBinary : s.barLinear}`} style={{ width: active ? '100%' : '20%' }} />
                </div>
              </div>
            )
          })}
        </div>
      </Canvas>
      <Readout
        items={[
          { k: '尺度', v: info.level, strong: true },
          { k: 'できる比較', v: info.ops },
          { k: '例', v: info.example },
        ]}
      />
      <Note>名義・順序・間隔・比例の4つの尺度。尺度によって、平均や比を使ってよいかが変わる。</Note>
    </FigureFrame>
  )
}

/* ---------- 主キーと外部キー ---------- */

const MEMBERS = [
  { id: 'M01', name: '佐藤' },
  { id: 'M02', name: '鈴木' },
  { id: 'M03', name: '高橋' },
]
const PURCHASES = [
  { id: 'P01', member: 'M01', item: '本' },
  { id: 'P02', member: 'M02', item: 'ノート' },
  { id: 'P03', member: 'M01', item: 'ペン' },
]

export function PrimaryKeyLab() {
  const [duplicate, setDuplicate] = useState(false)
  const members = duplicate ? [...MEMBERS, { id: 'M02', name: '田中' }] : MEMBERS

  return (
    <FigureFrame
      badge="実験"
      title="主キーが重複したら、何が起きる？"
      status={
        duplicate
          ? 'M02 が2行ある。主キーは行を一意に識別するので、重複は許されない。'
          : '会員IDが主キー。購入表の会員IDは、会員表の主キーを参照する外部キー。'
      }
      statusKind={duplicate ? 'ng' : 'ok'}
    >
      <div className={fig.ctrl}>
        <Btn on={duplicate} ariaPressed={duplicate} onClick={() => setDuplicate((v) => !v)}>
          重複した会員IDを追加
        </Btn>
      </div>
      <Canvas label="会員表と購入表" interactive>
        <div className={s.cipherGroup}>
          <div>
            <span className={s.cipherLabel}>会員表（主キー: 会員ID）</span>
            <p className={s.cipherBox}>
              {members.map((m) => `${m.id} ${m.name}`).join(' / ')}
            </p>
          </div>
          <div>
            <span className={s.cipherLabel}>購入表（外部キー: 会員ID）</span>
            <p className={s.cipherBox}>
              {PURCHASES.map((p) => `${p.id} ${p.member} ${p.item}`).join(' / ')}
            </p>
          </div>
        </div>
      </Canvas>
      <Readout
        items={[
          { k: '会員表の行数', v: `${members.length}行` },
          { k: '主キー', v: '会員ID' },
          { k: '外部キー', v: '購入表の会員ID' },
          { k: '一意か', v: duplicate ? '重複あり' : '一意', ok: !duplicate, ng: duplicate, strong: true },
        ]}
      />
      <Note>主キーは行を一意に識別する。外部キーは他の表の主キーを参照し、表どうしをつなぐ。</Note>
    </FigureFrame>
  )
}

/* ---------- SQL ---------- */

const SQL_ROWS = [
  { name: '佐藤', score: 82 },
  { name: '鈴木', score: 65 },
  { name: '高橋', score: 91 },
  { name: '田中', score: 74 },
  { name: '伊藤', score: 58 },
]
const SQL_OPTIONS = [
  { value: 'all', label: '全件' },
  { value: 'where', label: 'WHERE 80以上' },
  { value: 'order', label: 'ORDER BY 降順' },
  { value: 'count', label: 'COUNT' },
] as const
type SqlMode = (typeof SQL_OPTIONS)[number]['value']

const SQL_QUERIES: Record<SqlMode, string> = {
  all: 'SELECT 名前, 点数 FROM 成績',
  where: 'SELECT 名前, 点数 FROM 成績 WHERE 点数 >= 80',
  order: 'SELECT 名前, 点数 FROM 成績 ORDER BY 点数 DESC',
  count: 'SELECT COUNT(*) FROM 成績',
}

export function SqlLab() {
  const [mode, setMode] = useState<SqlMode>('all')
  const filtered =
    mode === 'where' ? SQL_ROWS.filter((r) => r.score >= 80) : mode === 'order' ? [...SQL_ROWS].sort((a, b) => b.score - a.score) : SQL_ROWS
  const shown = mode === 'count' ? [] : filtered

  return (
    <FigureFrame
      badge="実験"
      title="SQLの条件を変えると、何行返る？"
      status={
        mode === 'count'
          ? `COUNT(*) は行数を数えるので、結果は ${SQL_ROWS.length}。`
          : `${shown.length}行が返る。${mode === 'where' ? '条件に合う行だけに絞られた。' : mode === 'order' ? '点数の大きい順に並んだ。' : '条件なしなので全件。'}`
      }
    >
      <Segmented label="SQLの操作" value={mode} options={SQL_OPTIONS} onChange={setMode} />
      <p className={s.cipherBox}>{SQL_QUERIES[mode]}</p>
      <Canvas label="SQLの実行結果" interactive>
        {mode === 'count' ? (
          <p className={s.cipherBox}>{SQL_ROWS.length}件</p>
        ) : (
          <CellTrack values={shown.map((r) => `${r.name} ${r.score}`)} wrap ariaLabel="SQLの実行結果" />
        )}
      </Canvas>
      <Readout
        items={[
          { k: '結果の行数', v: mode === 'count' ? `${SQL_ROWS.length}` : `${shown.length}行`, strong: true },
          { k: '最高点', v: `${Math.max(...SQL_ROWS.map((r) => r.score))}` },
          { k: '平均点', v: mean(SQL_ROWS.map((r) => r.score)).toFixed(1) },
        ]}
      />
      <Note>SQLはSELECTで列、FROMで表、WHEREで条件、ORDER BYで並び順を指定する。</Note>
    </FigureFrame>
  )
}

/* ---------- グラフの選び方 ---------- */

const CHART_OPTIONS = [
  { value: 'share', label: '割合' },
  { value: 'trend', label: '時系列' },
  { value: 'dist', label: '分布' },
  { value: 'relation', label: '2変数の関係' },
  { value: 'compare', label: '項目の比較' },
] as const
type ChartId = (typeof CHART_OPTIONS)[number]['value']

const CHARTS: Record<ChartId, { purpose: string; chart: string; reason: string }> = {
  share: { purpose: '全体に対する内訳', chart: '円グラフ・帯グラフ', reason: '全体を100%とした割合が伝わる' },
  trend: { purpose: '時間による変化', chart: '折れ線グラフ', reason: '増減の向きや速さが伝わる' },
  dist: { purpose: '値の散らばり', chart: 'ヒストグラム', reason: 'どの範囲に値が集まるかが伝わる' },
  relation: { purpose: '2つの変数の関係', chart: '散布図', reason: '相関の有無や強さが見える' },
  compare: { purpose: '項目どうしの大小', chart: '棒グラフ', reason: '長さで大小を比べやすい' },
}

export function ChartChoiceLab() {
  const [id, setId] = useState<ChartId>('share')
  const info = CHARTS[id]

  return (
    <FigureFrame
      badge="実験"
      title="伝えたいことに合うグラフはどれ？"
      status={`「${info.purpose}」を伝えるなら${info.chart}。${info.reason}。`}
    >
      <Segmented label="伝えたいこと" value={id} options={CHART_OPTIONS} onChange={setId} />
      <Canvas label="目的に合うグラフの例" interactive>
        <svg viewBox="0 0 320 100" className={fig.svg} role="img" aria-label={`${info.purpose}には${info.chart}`}>
          {id === 'share' && (
            <>
              <circle cx={90} cy={50} r={30} fill="var(--color-accent-tint)" stroke="var(--color-accent)" />
              <path d="M 90 50 L 90 20 A 30 30 0 0 1 116 65 Z" fill="var(--color-accent)" />
              <text x={180} y={54} fontSize={11} fill="var(--color-label)">
                円・帯で割合を示す
              </text>
            </>
          )}
          {id === 'trend' && (
            <>
              <polyline points="32,72 82,58 132,64 182,38 232,44 282,22" fill="none" stroke="var(--color-accent)" strokeWidth={2.5} />
              <text x={180} y={92} fontSize={11} textAnchor="middle" fill="var(--color-secondary-label)">
                折れ線で変化を示す
              </text>
            </>
          )}
          {id === 'dist' && (
            <>
              {[24, 48, 68, 44, 20].map((h, i) => (
                <rect key={i} x={40 + i * 44} y={76 - h} width={38} height={h} rx={2} fill="var(--color-accent-tint)" stroke="var(--color-accent)" />
              ))}
              <text x={160} y={94} fontSize={11} textAnchor="middle" fill="var(--color-secondary-label)">
                ヒストグラムで分布を示す
              </text>
            </>
          )}
          {id === 'relation' && (
            <>
              <line x1={24} y1={78} x2={296} y2={78} stroke="var(--color-border)" />
              <line x1={24} y1={16} x2={24} y2={78} stroke="var(--color-border)" />
              {[{ x: 44, y: 68 }, { x: 78, y: 58 }, { x: 112, y: 62 }, { x: 146, y: 44 }, { x: 180, y: 40 }, { x: 214, y: 28 }, { x: 248, y: 32 }].map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r={3.5} fill="var(--color-accent)" />
              ))}
              <text x={180} y={94} fontSize={11} textAnchor="middle" fill="var(--color-secondary-label)">
                散布図で関係を示す
              </text>
            </>
          )}
          {id === 'compare' && (
            <>
              {[40, 58, 30, 66].map((h, i) => (
                <rect key={i} x={54 + i * 56} y={76 - h} width={36} height={h} rx={3} fill="var(--color-accent-tint)" stroke="var(--color-accent)" />
              ))}
              <text x={160} y={94} fontSize={11} textAnchor="middle" fill="var(--color-secondary-label)">
                棒グラフで大小を示す
              </text>
            </>
          )}
        </svg>
      </Canvas>
      <Readout
        items={[
          { k: '伝えたいこと', v: info.purpose },
          { k: '向くグラフ', v: info.chart, strong: true },
          { k: '理由', v: info.reason },
        ]}
      />
      <Note>割合は円・帯、時系列は折れ線、分布はヒストグラム、2変数の関係は散布図。目的に合う形を選ぶ。</Note>
    </FigureFrame>
  )
}
