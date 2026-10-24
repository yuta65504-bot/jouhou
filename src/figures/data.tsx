/**
 * データ（data, q-dat-1〜18）: 問題ごとのインタラクティブ図解。
 * すべて SVG + DOM。セグメント・ボタン・スライダーで操作できる。
 */
import { useMemo, useState } from 'react'
import styles from './figures.module.css'
import { Segmented } from '@/components/Segmented'
import { useAnimatedNumber, useStepPlayer } from '@/lib/motion'
import {
  ACCENT,
  BORDER,
  Canvas,
  CellTrack,
  FigShell,
  FigureFrame,
  MUTED,
  NGINK,
  Note,
  OK,
  OKINK,
  Readout,
  TINT,
  View,
  Btn,
  Slider,
  GBox,
  GCircle,
  GArrow,
} from './parts'

/* ---------- q-dat-1: 平均値と中央値 ---------- */

const D1_VALUES = [2, 3, 3, 10]

export function DatFig1() {
  const player = useStepPlayer(3, 1200)
  const { step } = player
  const mean = useAnimatedNumber(step >= 1 ? 4.5 : 0)
  const median = useAnimatedNumber(step >= 2 ? 3 : 0)

  const x = (v: number) => 30 + v * 22.5
  const counts = new Map<number, number>()
  for (const v of D1_VALUES) counts.set(v, (counts.get(v) ?? 0) + 1)
  const seen = new Map<number, number>()
  const positions = D1_VALUES.map((v) => {
    const total = counts.get(v) ?? 1
    const index = seen.get(v) ?? 0
    seen.set(v, index + 1)
    const offset = total > 1 ? (index - (total - 1) / 2) * 14 : 0
    return { v, cx: x(v) + offset, y: 92 }
  })

  return (
    <FigureFrame
      title="図解: 並べてから、外れ値の影響を見る"
      status={
        step === 0
          ? 'データは 2, 3, 3, 10。小さい順に並んでいる。'
          : step === 1
            ? '平均値 = (2 + 3 + 3 + 10) ÷ 4 = 18 ÷ 4 = 4.5。10に引っ張られる。'
            : '中央値 = 真ん中の2つ（3と3）の平均 = 3。10があっても変わらない。'
      }
      statusKind={step >= 2 ? 'ok' : 'plain'}
      step={step}
      total={3}
      playing={player.playing}
      onPrev={player.prev}
      onNext={player.next}
      onReset={player.reset}
      onPlayToggle={player.toggle}
    >
      <Canvas label="4つの値と、平均値・中央値の位置" interactive>
        <CellTrack values={D1_VALUES} marks={[undefined, undefined, undefined, '外れ値']} ariaLabel="データの値" />
        <svg viewBox="0 0 320 132" className={styles.svg}>
          <line x1={30} y1={108} x2={306} y2={108} stroke={BORDER} />
          {[0, 4, 8, 12].map((v) => (
            <g key={v}>
              <line x1={x(v)} y1={104} x2={x(v)} y2={112} stroke={BORDER} />
              <text x={x(v)} y={126} fontSize={13} textAnchor="middle" fill={MUTED}>
                {v}
              </text>
            </g>
          ))}

          {positions.map((p, i) => (
            <g key={i}>
              <circle
                cx={p.cx}
                cy={p.y}
                r={6.5}
                fill={p.v === 10 && step >= 1 ? 'var(--color-warning)' : TINT}
                stroke={p.v === 10 && step >= 1 ? 'var(--color-warning)' : ACCENT}
                strokeWidth={2}
              />
              <text
                x={p.cx}
                y={p.y - 12}
                fontSize={14}
                textAnchor="middle"
                fill={p.v === 10 && step >= 1 ? 'var(--color-warning-ink)' : MUTED}
                fontWeight={p.v === 10 && step >= 1 ? 700 : 400}
              >
                {p.v}
              </text>
            </g>
          ))}

          {step >= 1 && (
            <g>
              <line
                x1={x(4.5)}
                y1={54}
                x2={x(4.5)}
                y2={112}
                pathLength={1}
                stroke={ACCENT}
                strokeWidth={2}
                strokeDasharray="4 3"
                className={styles.draw}
              />
              <text x={x(4.5) + 6} y={52} fontSize={13} fill={ACCENT} fontWeight={700}>
                平均
              </text>
              <text x={x(4.5) + 6} y={68} fontSize={13} fill={MUTED}>
                4.5
              </text>
            </g>
          )}

          {step >= 2 && (
            <g>
              <path
                d={`M ${x(3) - 10} 66 L ${x(3) - 10} 58 L ${x(3) + 10} 58 L ${x(3) + 10} 66`}
                pathLength={1}
                fill="none"
                stroke="var(--color-success)"
                strokeWidth={2}
                className={styles.draw}
              />
              <text x={x(3) - 14} y={50} fontSize={13} textAnchor="end" fill={OKINK} fontWeight={700}>
                中央値 3
              </text>
            </g>
          )}

          {step >= 1 && (
            <text x={x(10)} y={56} fontSize={13} textAnchor="middle" fill="var(--color-warning-ink)">
              外れ値
            </text>
          )}
        </svg>
        <Readout
          items={[
            { k: '平均値', v: step >= 1 ? mean.toFixed(1) : '—', strong: step >= 1 },
            { k: '中央値', v: step >= 2 ? median.toFixed(0) : '—', strong: step >= 2, ok: step >= 2 },
            { k: '外れ値', v: '10', ng: step >= 1 },
          ]}
        />
      </Canvas>
      <Note>10という大きな値（外れ値）は平均値を引き上げる。中央値は並べたときの真ん中なので影響を受けにくい。</Note>
    </FigureFrame>
  )
}

/* ---------- q-dat-2: 縦軸の始まりで見え方が変わる ---------- */

const D2_SCORES = [64, 58, 70, 66, 74]

export function DatFig2() {
  const [from, setFrom] = useState<0 | 50>(50)
  const y = (v: number) => 10 + (100 - v) * (96 / (100 - from))
  const x = (i: number) => 46 + i * 62
  return (
    <FigShell
      title="図解: 同じデータでも、縦軸の始まりで形が変わる"
      status={
        from === 50
          ? '縦軸が50点から始まると上下の幅が狭くなり、同じ変化でも大きく見えやすい。データそのもの（個数・中央値）は変わらない。'
          : '縦軸を0点から始めると増減の大きさがそのまま見える。派手さはないが、誤読は起きにくい。'
      }
      statusKind={from === 50 ? 'ng' : 'ok'}
    >
      <Segmented
        label="縦軸の始まり"
        value={String(from)}
        options={[
          { value: '0', label: '0点から始める' },
          { value: '50', label: '50点から始める' },
        ]}
        onChange={(v) => setFrom(Number(v) as 0 | 50)}
      />
      <View label={`${from === 0 ? '0点' : '50点'}始まりで描いた折れ線グラフ`}>
        <svg viewBox="0 0 320 126" className={styles.svg}>
          <line x1={42} y1={8} x2={42} y2={106} stroke={BORDER} />
          <line x1={42} y1={106} x2={310} y2={106} stroke={BORDER} />
          {[from, (from + 100) / 2, 100].map((tk) => (
            <g key={tk}>
              <line x1={42} y1={y(tk)} x2={310} y2={y(tk)} stroke={BORDER} strokeDasharray="3 3" />
              <text x={38} y={y(tk) + 3} fontSize={8.5} textAnchor="end" fill={MUTED}>
                {tk}点
              </text>
            </g>
          ))}
          <polyline points={D2_SCORES.map((v, i) => `${x(i)},${y(v)}`).join(' ')} fill="none" stroke={ACCENT} strokeWidth={2.5} />
          {D2_SCORES.map((v, i) => (
            <circle key={i} cx={x(i)} cy={y(v)} r={4.5} fill={ACCENT} />
          ))}
          {D2_SCORES.map((_, i) => (
            <text key={`t${i}`} x={x(i)} y={116} fontSize={8} textAnchor="middle" fill={MUTED}>
              {i + 1}回
            </text>
          ))}
        </svg>
      </View>
      <Note>縦軸を0以外で始めること自体は「悪い」ことではない。ただし増減の見え方が変わるので、軸の範囲を必ず読む。</Note>
    </FigShell>
  )
}

/* ---------- q-dat-3: 最頻値と値域 ---------- */

const D3_VALUES = [3, 5, 5, 8, 5, 10]
const D3_COUNTS: { v: number; n: number }[] = [
  { v: 3, n: 1 },
  { v: 5, n: 3 },
  { v: 8, n: 1 },
  { v: 10, n: 1 },
]

export function DatFig3() {
  const [pick, setPick] = useState(1) /* 選択しているデータの位置 */
  const v = D3_VALUES[pick]
  const count = D3_COUNTS.find((c) => c.v === v)?.n ?? 0
  const maxCount = Math.max(...D3_COUNTS.map((c) => c.n))
  return (
    <FigShell
      title="図解: 度数が最大の値が最頻値。値域は max − min"
      status={`選んだ値 ${v} は ${count}個。最頻値は 5（3個）、値域は 10 − 3 = 7。`}
    >
      <div className={styles.ctrl}>
        {D3_VALUES.map((vv, i) => (
          <Btn key={i} small on={i === pick} onClick={() => setPick(i)}>
            {vv}
          </Btn>
        ))}
      </div>
      <View label="値ごとの度数を棒で並べる">
        <svg viewBox="0 0 320 98" className={styles.svg}>
          <line x1={28} y1={80} x2={292} y2={80} stroke={BORDER} />
          {D3_COUNTS.map((c, i) => {
            const cx = 52 + i * 70
            const bw = 34
            const h = (c.n / maxCount) * 52
            return (
              <g key={c.v}>
                <rect
                  x={cx - bw / 2}
                  y={80 - h}
                  width={bw}
                  height={h}
                  rx={3}
                  fill={c.v === 5 ? ACCENT : TINT}
                  stroke={c.v === pick ? ACCENT : BORDER}
                  strokeWidth={c.v === pick ? 2 : 1}
                />
                <text x={cx} y={76 - h} fontSize={9.5} textAnchor="middle" fill={MUTED}>
                  {c.n}個
                </text>
                <text x={cx} y={92} fontSize={9.5} textAnchor="middle" fill={c.v === 5 ? OKINK : MUTED} fontWeight={c.v === 5 ? 700 : 400}>
                  {c.v}
                </text>
              </g>
            )
          })}
        </svg>
      </View>
      <Note>最頻値は「もっとも多く現れる値」。値域は最大値でも最小値でもなく、その差。</Note>
    </FigShell>
  )
}

/* ---------- q-dat-4: 箱ひげ図の読み方 ---------- */

const D4_SUM = [
  { name: '最小値', v: 8, expl: 'いちばん小さい値で、ひげの左端。' },
  { name: '第1四分位数 Q1', v: 12, expl: '下から1/4の境目。箱の左端。' },
  { name: '中央値', v: 23, expl: '真ん中（下から4番目）の値。箱の中の線。' },
  { name: '第3四分位数 Q3', v: 42, expl: '下から3/4の境目。箱の右端。' },
  { name: '最大値', v: 46, expl: 'いちばん大きい値で、ひげの右端。' },
]

const D4_SHORT = ['最小', 'Q1', '中央', 'Q3', '最大'] as const

export function DatFig4() {
  const [sel, setSel] = useState(2)
  const p = D4_SUM[sel]
  const x = (v: number) => 40 + v * 4.8
  return (
    <FigShell
      title="図解: 箱ひげ図は5つの数を1本で見せる"
      status={`${p.name} = ${p.v}。${p.expl}`}
    >
      <Canvas label="箱ひげ図（最小・Q1・中央値・Q3・最大）。下のボタンで選ぶ" interactive>
        <svg viewBox="0 0 320 100" className={styles.svg}>
          <line x1={36} y1={46} x2={296} y2={46} stroke={BORDER} />
          <line x1={x(8)} y1={46} x2={x(12)} y2={46} stroke={MUTED} strokeWidth={1.5} />
          <line x1={x(8)} y1={38} x2={x(8)} y2={54} stroke={MUTED} strokeWidth={1.5} />
          <line x1={x(42)} y1={46} x2={x(46)} y2={46} stroke={MUTED} strokeWidth={1.5} />
          <line x1={x(46)} y1={38} x2={x(46)} y2={54} stroke={MUTED} strokeWidth={1.5} />
          <rect x={x(12)} y={34} width={x(42) - x(12)} height={24} fill={TINT} stroke={ACCENT} />
          <line x1={x(23)} y1={34} x2={x(23)} y2={58} stroke="var(--color-warning)" strokeWidth={2.5} />
          {D4_SUM.map((d, i) => (
            <circle
              key={d.name}
              cx={x(d.v)}
              cy={46}
              r={5}
              fill={i === sel ? 'var(--color-warning)' : TINT}
              stroke={i === sel ? 'var(--color-warning)' : BORDER}
              strokeWidth={i === sel ? 2 : 1}
              className={styles.clickableDot}
              onClick={() => setSel(i)}
            />
          ))}
          {D4_SUM.map((d, i) => (
            <text key={`l${i}`} x={x(d.v)} y={74} fontSize={9} textAnchor="middle" fill={i === sel ? 'var(--color-warning-ink)' : MUTED} fontWeight={i === sel ? 700 : 400}>
              {d.v}
            </text>
          ))}
          <text x={x(27)} y={26} fontSize={8.5} fill={MUTED}>
            箱 = 四分位範囲（Q1〜Q3）
          </text>
          <text x={x(23)} y={62} fontSize={8} textAnchor="middle" fill="var(--color-warning-ink)">
            中央値
          </text>
        </svg>
        <div className={styles.dotBtns} role="group" aria-label="見たい数を選ぶ">
          {D4_SUM.map((d, i) => (
            <button
              key={d.name}
              type="button"
              className={styles.dotBtn}
              aria-pressed={i === sel}
              aria-label={`${d.name} ${d.v}`}
              onClick={() => setSel(i)}
            >
              <span aria-hidden="true">{D4_SHORT[i]}</span>
              <span className={styles.dotBtnValue}>{d.v}</span>
            </button>
          ))}
        </div>
      </Canvas>
      <div className={styles.ctrl}>
        <Btn small onClick={() => setSel((s) => (s + 4) % 5)}>
          ◀ 左側の部分
        </Btn>
        <Btn small onClick={() => setSel((s) => (s + 1) % 5)}>
          右側の部分 ▶
        </Btn>
      </div>
      <Note>箱の長さ = 四分位範囲（Q3 − Q1）で中心部の散らばりを見る。ひげは Q1〜最小・Q3〜最大。外れ値は点で描く（ここにはない）。</Note>
    </FigShell>
  )
}

/* ---------- q-dat-5: 標準偏差の比較 ---------- */

const D5_SETS: { label: string; values: number[] }[] = [
  { label: '前者: 50, 60, 70, 80, 90', values: [50, 60, 70, 80, 90] },
  { label: '後者: 50, 50, 70, 90, 90', values: [50, 50, 70, 90, 90] },
]

function d5Sigma(values: number[]): number {
  const mean = 70
  return Math.sqrt(values.reduce((s, v) => s + (v - mean) * (v - mean), 0) / values.length)
}

export function DatFig5() {
  const [pick, setPick] = useState(1)
  const rows = D5_SETS.map((set) => ({ ...set, sigma: d5Sigma(set.values) }))
  const s = rows[pick]
  const mean = 70
  const sigma = useAnimatedNumber(s.sigma)
  return (
    <FigureFrame
      title="図解: 平均からのずれが大きいほど標準偏差は大きい"
      status={`${pick === 1 ? '後者' : '前者'}は平均70、σ ≈ ${s.sigma.toFixed(1)}。${pick === 1 ? '後者の方が大きく散らばっている。' : '前者は70の周りにまとまっている。'}`}
    >
      <div className={styles.controlRow}>
        <Segmented
          label="どちらのデータを見るか"
          value={String(pick)}
          options={rows.map((r, i) => ({ value: String(i), label: r.label }))}
          onChange={(v) => setPick(Number(v))}
        />
      </div>
      <Canvas label="平均値70からのずれの大きさを棒で見る" interactive>
        <svg viewBox="0 0 320 150" className={styles.svg}>
          <line x1={20} y1={74} x2={302} y2={74} stroke={BORDER} strokeDasharray="4 3" />
          <text x={160} y={64} fontSize={13} textAnchor="middle" fill={MUTED}>
            平均 70
          </text>
          <g key={pick}>
            {s.values.map((v, i) => {
              const d = v - mean
              const h = Math.abs(d) * 1.7
              const top = d > 0 ? 74 - h : 74
              return (
                <g key={i}>
                  {d === 0 ? (
                    <rect x={52 + i * 48} y={70} width={32} height={8} rx={3} fill="var(--color-card)" stroke={BORDER} />
                  ) : (
                    <rect
                      x={52 + i * 48}
                      y={top}
                      width={32}
                      height={Math.max(2, h)}
                      rx={3}
                      fill={TINT}
                      stroke={ACCENT}
                      className={d > 0 ? styles.barGrow : styles.barGrowDown}
                      style={{ animationDelay: `${i * 20}ms` }}
                    />
                  )}
                  <text
                    x={68 + i * 48}
                    y={d > 0 ? top - 6 : d < 0 ? top + h + 16 : 94}
                    fontSize={14}
                    textAnchor="middle"
                    fill={MUTED}
                  >
                    {v}
                  </text>
                </g>
              )
            })}
          </g>
          <text x={160} y={144} fontSize={13} textAnchor="middle" fill={MUTED}>
            棒の高さ = 平均70からのずれ
          </text>
        </svg>
        <Readout
          items={[
            { k: '今回の σ', v: sigma.toFixed(1), strong: true },
            { k: '前者 σ', v: rows[0].sigma.toFixed(1) },
            { k: '後者 σ', v: rows[1].sigma.toFixed(1) },
            { k: '平均', v: 'どちらも 70' },
          ]}
        />
      </Canvas>
      <Note>標準偏差は「平均からのずれの平均的な大きさ」。平均が同じでも散らばりで決まる。「外れ値が多い＝標準偏差が大きい」ではない。</Note>
    </FigureFrame>
  )
}

/* ---------- q-dat-6: 相関の読み取り ---------- */

const D6_CASES: { id: 'pos' | 'neg' | 'none' | 'line'; label: string; pts: [number, number][]; expl: string }[] = [
  {
    id: 'pos',
    label: '右上がりの直線状',
    pts: [
      [1, 2],
      [2, 3],
      [3, 4.2],
      [4, 4.8],
      [5, 6],
      [6, 6.4],
      [7, 7.6],
      [8, 8.2],
      [9, 9.4],
    ],
    expl: '正の相関（1に近い）。一方が増えると他方も増える傾向。',
  },
  {
    id: 'neg',
    label: '右下がりの直線状',
    pts: [
      [1, 9.2],
      [2, 8.4],
      [3, 7],
      [4, 6.2],
      [5, 5.2],
      [6, 4.4],
      [7, 3.2],
      [8, 2.6],
      [9, 1.4],
    ],
    expl: '負の相関（−1に近い）。一方が増えると他方は減る傾向。',
  },
  {
    id: 'none',
    label: 'ばらついて傾きなし',
    pts: [
      [2, 7],
      [1.5, 2.5],
      [5, 5.4],
      [6.6, 2.2],
      [3.4, 8.5],
      [7.6, 8.2],
      [8.6, 4.6],
      [4.4, 3.6],
      [6, 8.8],
      [3, 5.4],
    ],
    expl: '相関がない（無相関）。設問の答え＝「右上がりも右下がりの傾きも見られない」図。',
  },
  {
    id: 'line',
    label: '完全な一直線',
    pts: [
      [1, 1.4],
      [2, 2.4],
      [3, 3.4],
      [4, 4.4],
      [5, 5.4],
      [6, 6.4],
      [7, 7.4],
      [8, 8.4],
      [9, 9.4],
    ],
    expl: '完全な直線関係 → 相関は強い（符号は向きによる）。無相関ではない。',
  },
]

export function DatFig6() {
  const [pick, setPick] = useState(2)
  const c = D6_CASES[pick]
  const px = (x: number) => 44 + x * 28
  const py = (yv: number) => 102 - yv * 9
  return (
    <FigShell
      title="図解: 点の並び方で相関を読む"
      status={c.expl}
      statusKind={c.id === 'none' ? 'ok' : 'plain'}
    >
      <Segmented
        label="散布図のパターン"
        value={String(pick)}
        options={D6_CASES.map((d, i) => ({ value: String(i), label: d.label }))}
        onChange={(v) => setPick(Number(v))}
      />
      <View label={`散布図（${c.label}）`}>
        <svg viewBox="0 0 320 112" className={styles.svg}>
          <line x1={40} y1={8} x2={40} y2={102} stroke={BORDER} />
          <line x1={40} y1={102} x2={310} y2={102} stroke={BORDER} />
          <text x={38} y={16} fontSize={8} textAnchor="end" fill={MUTED}>
            Y
          </text>
          <text x={304} y={96} fontSize={8} fill={MUTED}>
            X
          </text>
          {c.pts.map((p, i) => (
            <circle key={i} cx={px(p[0])} cy={py(p[1])} r={4.2} fill={c.id === 'none' ? NGINK : ACCENT} opacity={0.75} />
          ))}
          <text x={172} y={109} fontSize={8.5} textAnchor="middle" fill={MUTED}>
            点の集まり方で「正・負・無相関」を読み取る
          </text>
        </svg>
      </View>
      <Note>相関係数は −1〜1 の範囲。0に近いほど無相関。ただし「相関がある＝原因と結果」ではない。</Note>
    </FigShell>
  )
}

/* ---------- q-dat-7: 回帰直線と残差 ---------- */

const D7_PTS: [number, number][] = [
  [1, 2.2],
  [2, 2.8],
  [3, 3.6],
  [4, 4.9],
  [5, 5.6],
  [6, 6.2],
  [7, 7.6],
  [8, 8.4],
]

export function DatFig7() {
  const [a, setA] = useState(0.5) /* 切片 */
  const [b, setB] = useState(0.9) /* 傾き */
  const px = (x: number) => 44 + x * 26
  const py = (v: number) => 102 - v * 9.5
  const absSum = D7_PTS.reduce((s, [x, yv]) => s + Math.abs(yv - (a + b * x)), 0)
  return (
    <FigShell
      title="図解: 点全体の中心に沿う1本の直線"
      status={`残差（点と直線との差）の合計 |r| = ${absSum.toFixed(1)}。傾き・高さを動かして、合計が小さくなる直線に近づけてみる。`}
    >
      <div className={styles.ctrl}>
        <Btn small on onClick={() => { setA(0.5); setB(0.9) }}>
          並びがやや外れた直線にもどす
        </Btn>
        <Btn small on={false} onClick={() => { setA(0.2); setB(1.02) }}>
          点の中心に沿う直線にする
        </Btn>
      </div>
      <View label="散布図（点）と回帰直線。点線は残差">
        <svg viewBox="0 0 320 112" className={styles.svg}>
          <line x1={40} y1={8} x2={40} y2={102} stroke={BORDER} />
          <line x1={40} y1={102} x2={310} y2={102} stroke={BORDER} />
          <line x1={px(0)} y1={py(a)} x2={px(10)} y2={py(a + b * 10)} stroke="var(--color-warning)" strokeWidth={2} />
          {D7_PTS.map((p, i) => (
            <g key={i}>
              <line x1={px(p[0])} y1={py(p[1])} x2={px(p[0])} y2={py(a + b * p[0])} stroke={MUTED} strokeDasharray="2 2" />
              <circle cx={px(p[0])} cy={py(p[1])} r={4} fill={ACCENT} />
            </g>
          ))}
          <text x={176} y={110} fontSize={8.5} textAnchor="middle" fill={MUTED}>
            残差が小さいほど、直線がデータの傾向に合っている
          </text>
        </svg>
      </View>
      <Slider label="直線の傾き" value={b} min={0} max={1.4} step={0.02} onChange={setB} fmt={(v) => `+${v.toFixed(2)}`} />
      <Slider label="直線の高さ（切片）" value={a} min={0} max={2} step={0.1} onChange={setA} fmt={(v) => `${v.toFixed(1)}`} />
      <Note>回帰直線はすべての点を通るのではなく、点全体の中心傾向を表す。各点を順に結ぶ折れ線とは別物。原点を通る必要もない。</Note>
    </FigShell>
  )
}

/* ---------- q-dat-8: 外れ値と欠損値の整理 ---------- */

const D8_ROWS: { tag: string; v: number | null }[] = [
  { tag: 'A', v: 950 },
  { tag: 'B', v: 1240 },
  { tag: 'C', v: 1100 },
  { tag: 'D', v: 980 },
  { tag: 'E', v: 850 },
  { tag: 'F', v: 1200 },
  { tag: 'G', v: 10000 },
  { tag: 'H', v: null },
]

export function DatFig8() {
  const [mode, setMode] = useState<'asis' | 'fixed'>('asis')
  const asisValues = D8_ROWS.map((r) => r.v ?? 0)
  const meanAsis = asisValues.reduce((s, v) => s + v, 0) / asisValues.length
  const fixedValues = D8_ROWS.filter((r) => r.tag !== 'G').map((r) => r.v as number)
  const meanFixed = fixedValues.reduce((s, v) => s + v, 0) / fixedValues.length
  const mean = mode === 'asis' ? meanAsis : meanFixed
  return (
    <FigShell
      title="図解: 記入ミス（10000）と空欄（欠損）の扱い方で、平均が変わる"
      status={
        mode === 'asis'
          ? `10000を含めて、欠損を0で埋めて平均すると ≈ ${Math.round(mean)}。外れ値に引っ張られて歪む（×）。`
          : `10000を除外し、欠損を集計に入れない → 6人分で平均 ≈ ${Math.round(mean)}。扱い方と理由を必ず記す（○）。`
      }
      statusKind={mode === 'asis' ? 'ng' : 'ok'}
    >
      <Segmented
        label="データの扱い方"
        value={mode}
        options={[
          { value: 'asis' as const, label: 'そのまま平均する' },
          { value: 'fixed' as const, label: '外れ値を除外し、欠損は入れない' },
        ]}
        onChange={setMode}
      />
      <View label="8個のデータ（G=10000が記入ミス、H=空欄）">
        <svg viewBox="0 0 320 108" className={styles.svg}>
          {D8_ROWS.map((r, i) => {
            const v = r.v
            const isOut = r.tag === 'G'
            const isNa = v == null
            const h = v == null ? 4 : Math.min(78, v / 130)
            const dim = mode === 'fixed' && (isOut || isNa)
            return (
              <g key={r.tag}>
                {isNa ? (
                  <text x={24 + i * 38} y={88} fontSize={7.5} textAnchor="middle" fill={MUTED}>
                    欠損
                  </text>
                ) : (
                  <rect x={12 + i * 38} y={92 - h} width={24} height={h} rx={2} fill={isOut ? 'var(--color-error-tint)' : TINT} stroke={isOut ? 'var(--color-error)' : BORDER} opacity={dim ? 0.35 : 1} />
                )}
                <text x={24 + i * 38} y={100} fontSize={9} textAnchor="middle" fill={MUTED}>
                  {r.tag}
                </text>
                {v != null && (
                  <text x={24 + i * 38} y={90 - h} fontSize={7.5} textAnchor="middle" fill={isOut ? NGINK : MUTED}>
                    {v}
                  </text>
                )}
              </g>
            )
          })}
          <line x1={10} y1={92} x2={310} y2={92} stroke={BORDER} />
          <text x={172} y={106} fontSize={8.5} textAnchor="middle" fill={MUTED}>
            G（10000）は他の値とけた違いに大きい＝記入ミスの可能性が高い
          </text>
        </svg>
      </View>
      <Note>外れ値は除外・修正・代表値への置き換えなどの方法があり「なぜそうしたか」を記す。欠損を0で埋めると「0だった」ことになり不適切。</Note>
    </FigShell>
  )
}

/* ---------- q-dat-9: 尺度水準 ---------- */

type D9Level = 'nominal' | 'ordinal' | 'interval' | 'ratio'
const D9_LEVELS: { id: D9Level; label: string }[] = [
  { id: 'nominal', label: '名義' },
  { id: 'ordinal', label: '順序' },
  { id: 'interval', label: '間隔' },
  { id: 'ratio', label: '比例' },
]
const D9_ITEMS: { id: 'sex' | 'sat' | 'temp' | 'height'; label: string; correct: D9Level; expl: string }[] = [
  { id: 'sex', label: '性別', correct: 'nominal', expl: '男・女は区別だけでき、順序や差はない。' },
  { id: 'sat', label: '満足度（5段階）', correct: 'ordinal', expl: '1〜5に順序はあるが、「差が等しい」とは言えない。' },
  { id: 'temp', label: '気温（℃）', correct: 'interval', expl: '差は意味があるが、0℃は「氷点」で「何も無い」意味ではない。' },
  { id: 'height', label: '身長（cm）', correct: 'ratio', expl: '0cmは「長さが無い」こと。比（2倍・1.5倍）が意味を持つ。' },
]

export function DatFig9() {
  const [st, setSt] = useState<Record<string, D9Level | ''>>({ sex: '', sat: '', temp: '', height: '' })
  const allOk = D9_ITEMS.every((it) => st[it.id] === it.correct)
  return (
    <FigShell
      title="図解: データの性質から尺度水準を選ぶ"
      status={allOk ? 'すべて正しい組合せ ✓ 性別=名義、満足度=順序、気温=間隔、身長=比例。' : '各行の尺度水準を選んでいく。合っている行には ✓ が付く。'}
      statusKind={allOk ? 'ok' : 'plain'}
    >
      <div className={styles.tbl}>
        {D9_ITEMS.map((it) => (
          <div key={it.id} className={styles.d9Row}>
            <span className={styles.d9Label}>{it.label}</span>
            <span
              className={`${styles.d9Mark} ${
                st[it.id] === it.correct ? styles.d9MarkOk : st[it.id] ? styles.d9MarkNg : ''
              }`}
            >
              {st[it.id] === it.correct ? '✓' : st[it.id] ? '✕' : '—'}
            </span>
            <span className={styles.d9Select}>
              <Segmented
                label={`${it.label}の尺度水準`}
                value={st[it.id] ?? ''}
                options={D9_LEVELS.map((lv) => ({ value: lv.id, label: lv.label }))}
                onChange={(v) => setSt((s) => ({ ...s, [it.id]: v as D9Level | '' }))}
              />
            </span>
          </div>
        ))}
      </div>
      <div className={styles.ctrl}>
        <Btn small onClick={() => setSt({ sex: '', sat: '', temp: '', height: '' })} disabled={D9_ITEMS.every((it) => st[it.id] === '')}>
          リセット
        </Btn>
        <Btn small onClick={() => setSt({ sex: 'nominal', sat: 'ordinal', temp: 'interval', height: 'ratio' })} disabled={allOk}>
          正しい組合せにする
        </Btn>
      </div>
      <Note>尺度ごとに計算やグラフの選び方が変わる。身長・重量・金額など「0が無を意味し、比が有効」なら比例尺度。順序尺度には平均が使えない。</Note>
    </FigShell>
  )
}

/* ---------- q-dat-10: 主キー ---------- */

const D10_COLS = ['社員番号', '氏名', '部署']
const D10_ROWS: string[][] = [
  ['1001', '佐藤', '総務'],
  ['1002', '佐藤', '経理'],
  ['1003', '鈴木', '総務'],
  ['1004', '高橋', '営業'],
]

export function DatFig10() {
  const [col, setCol] = useState(0)
  const values = D10_ROWS.map((r) => r[col])
  const dup = new Set(values).size !== values.length
  return (
    <FigShell
      title="図解: 表の各行を「一意」に識別できる列が主キー"
      status={`「${D10_COLS[col]}」の列: ${dup ? '同じ値が重複している → 主キーにはならない ✕' : '全行で値が異なる（一意）→ 主キーになれる ✓'}`}
      statusKind={dup ? 'ng' : 'ok'}
    >
      <div className={styles.tbl}>
        <table>
          <thead>
            <tr>
              {D10_COLS.map((c, i) => (
                <th key={c} style={{ cursor: 'pointer', textAlign: 'left' }} onClick={() => setCol(i)}>
                  {c}
                  <span aria-hidden="true">{i === col ? ' ▾' : ''}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {D10_ROWS.map((r, ri) => (
              <tr key={ri}>
                {r.map((cell, ci) => (
                  <td key={ci} className={ci === col ? styles.cellHit : undefined}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={styles.ctrl}>
        <Btn small onClick={() => setCol((c) => (c + 1) % D10_COLS.length)}>
          次の列を調べる ▶
        </Btn>
      </div>
      <Note>主キーは同じ値を持たない列（例: 社員番号）。これで行を特定でき、ほかの表とデータを結び付けられる。別の表の行を参照する列は外部キー。</Note>
    </FigShell>
  )
}

/* ---------- q-dat-11: SQL SELECT…WHERE ---------- */

const D11_ROWS: { name: string; stock: number }[] = [
  { name: 'りんご', stock: 12 },
  { name: 'みかん', stock: 8 },
  { name: 'バナナ', stock: 25 },
  { name: 'ぶどう', stock: 7 },
  { name: 'いちご', stock: 18 },
]

export function DatFig11() {
  const [k, setK] = useState(0) /* 0: まだ → 1: WHERE → 2: SELECTの列だけ */
  const hit = (r: { stock: number }) => r.stock < 10
  return (
    <FigShell
      title="図解: SELECT 商品名 FROM 商品 WHERE 在庫数 < 10"
      status={
        k === 0
          ? '左から読む: SELECT（取る列 → 商品名）／ FROM（表 → 商品）／ WHERE（行の条件 → 在庫数 < 10）。'
          : k === 1
            ? 'WHERE で絞る → 在庫数が10未満の行だけが対象になる（みかん・ぶどう）。'
            : '取る列は 商品名 だけ → 取れるのは「みかん」「ぶどう」の商品名。在庫数の値は出ない。'
      }
      statusKind={k >= 2 ? 'ok' : 'plain'}
    >
      <div className={styles.tbl}>
        <table>
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>商品名</th>
              <th style={{ textAlign: 'right' }}>在庫数</th>
            </tr>
          </thead>
          <tbody>
            {D11_ROWS.map((r) => (
              <tr key={r.name}>
                <td className={k === 0 ? styles.cellMuted : k === 2 ? styles.cellHit : undefined}>{r.name}</td>
                <td
                  className={k >= 1 ? (hit(r) ? styles.cellNg : undefined) : styles.cellMuted}
                  style={{ fontFamily: 'var(--font-mono)', textAlign: 'right' }}
                >
                  {r.stock}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={styles.ctrl}>
        <Btn small onClick={() => setK(Math.min(2, k + 1))} disabled={k >= 2}>
          実行する ▶
        </Btn>
        <Btn small onClick={() => setK(Math.max(0, k - 1))} disabled={k <= 0}>
          ◀ 戻る
        </Btn>
        <Btn small onClick={() => setK(0)} disabled={k === 0}>
          リセット
        </Btn>
      </div>
      <Note>WHERE は「行を絞る」、SELECT は「取り出す列を決める」。SELECT 商品名, 在庫数 と書けば列が2つになる。</Note>
    </FigShell>
  )
}

/* ---------- q-dat-12: ヒストグラム（階級幅） ---------- */

const D12_DATA = [55, 57, 58, 60, 62, 63, 64, 65, 65, 66, 68, 70, 71, 72, 73, 74, 74, 75, 76, 78, 80, 82, 85, 88]

export function DatFig12() {
  const [w, setW] = useState(4)
  const bins = useMemo(() => {
    const start = Math.floor(55 / w) * w
    const end = Math.ceil(89 / w) * w
    const arr: { from: number; count: number }[] = []
    for (let x = start; x < end; x += w) arr.push({ from: x, count: 0 })
    for (const v of D12_DATA) {
      const i = Math.floor((v - start) / w)
      if (arr[i]) arr[i].count++
    }
    return arr
  }, [w])
  const maxCount = Math.max(1, ...bins.map((b) => b.count))
  const n = bins.length
  const step = Math.max(1, Math.ceil(n / 10))
  return (
    <FigShell
      title="図解: 階級の幅を変えると、分布の見え方が変わる"
      status={`階級幅 ${w}点 → ${n}個の階級で ${D12_DATA.length}人分を整理（各区間の度数を棒で表す）。`}
    >
      <Slider label="階級幅 [点]" value={w} min={2} max={10} step={1} onChange={setW} fmt={(v) => `${v}点刻み`} />
      <View label="ヒストグラム（階級に分けた各区間の度数を棒の長さで表す）">
        <svg viewBox="0 0 320 108" className={styles.svg}>
          <line x1={14} y1={90} x2={308} y2={90} stroke={BORDER} />
          {bins.map((b, i) => {
            const h = (b.count / maxCount) * 58
            const bw = 288 / n
            const cx = 16 + i * bw
            return (
              <g key={b.from}>
                <rect x={cx} y={90 - h} width={bw - 2} height={Math.max(1, h)} rx={1.5} fill={TINT} stroke={ACCENT} />
                {i % step === 0 && (
                  <text x={cx} y={102} fontSize={7.5} fill={MUTED}>
                    {b.from}
                  </text>
                )}
                <text x={cx + (bw - 2) / 2} y={86 - h} fontSize={7.5} textAnchor="middle" fill={b.count === 0 ? MUTED : OKINK}>
                  {b.count === 0 ? '' : b.count}
                </text>
              </g>
            )
          })}
        </svg>
      </View>
      <Note>ヒストグラムは「値の範囲（階級）ごとの度数」を棒で表し、分布の形（山や偏り）を確かめるのに使う。項目の割合ではない。</Note>
    </FigShell>
  )
}

/* ---------- q-dat-13: 分析プロセスのループ ---------- */

const D13_STEPS = ['仮説', '収集・整理', '分析', '考察']
const D13_FULL = ['仮説を立てる', 'データを収集・整理する', '分析する', '考察（結論）を述べる']

export function DatFig13() {
  const [k, setK] = useState(0)
  const [hit, setHit] = useState<'yes' | 'no'>('no')
  const last = k >= 3
  return (
    <FigShell
      title="図解: 仮説 → 収集整理 → 分析 → 考察。合わなければ仮説を修正"
      status={
        k === 0
          ? 'まず仮説。例: 「雨の日は店内の売上が下がる」。'
          : k === 1
            ? '仮説に関係するデータを、集めて整理する（都合のよいものだけを選ばない）。'
            : k === 2
              ? '整理したデータをグラフや統計で分析する。'
              : hit === 'yes'
                ? '考察: 仮説どおりだった。条件を変えて、さらに検証できる。'
                : '考察: 仮説と合わない → 条件や仮説を修正して、もう一度確認する。'
      }
      statusKind={last && hit === 'no' ? 'ng' : last ? 'ok' : 'plain'}
    >
      <Segmented
        label="分析の結果は、仮説と合った？（考察段階に効く）"
        value={hit}
        options={[
          { value: 'yes' as const, label: '仮説どおりだった' },
          { value: 'no' as const, label: '仮説と合わない' },
        ]}
        onChange={setHit}
      />
      <View label="分析プロセスの流れ">
        <svg viewBox="0 0 320 104" className={styles.svg}>
          {D13_STEPS.map((s, i) => (
            <g key={s}>
              <GBox
                x={6 + i * 80}
                y={40}
                w={70}
                h={30}
                text={D13_FULL[i].length > 9 ? D13_FULL[i].slice(0, 9) : D13_FULL[i]}
                fs={7.5}
                bold={i >= k}
                fill={i < k ? TINT : i === k ? ACCENT : 'var(--color-card)'}
                stroke={i <= k ? ACCENT : BORDER}
                ink={i < k ? MUTED : i === k ? '#fff' : MUTED}
              />
              <text x={41 + i * 80} y={84} fontSize={7.5} textAnchor="middle" fill={MUTED}>
                {s}
              </text>
              {i < 3 && <GArrow x1={78 + i * 80} y1={55} x2={84 + i * 80} y2={55} stroke={k > i ? ACCENT : MUTED} />}
            </g>
          ))}
          {last && hit === 'no' && (
            <g>
              <path d="M 262 38 C 250 12 70 12 60 36" fill="none" stroke="var(--color-error)" strokeWidth={2} strokeDasharray="4 3" />
              <text x={160} y={16} fontSize={9} textAnchor="middle" fill={NGINK} fontWeight={700}>
                仮説（条件）を修正してもどる
              </text>
            </g>
          )}
          <text x={160} y={98} fontSize={9} textAnchor="middle" fill={MUTED}>
            {last ? (hit === 'yes' ? '結論は過程とともに、他者にもわかるよう述べる' : '結果と仮説のずれも、考察の材料になる') : '順番どおりに進める'}
          </text>
        </svg>
      </View>
      <div className={styles.ctrl}>
        <Btn small onClick={() => setK(Math.min(3, k + 1))} disabled={k >= 3}>
          次へ ▶
        </Btn>
        <Btn small onClick={() => setK(Math.max(0, k - 1))} disabled={k <= 0}>
          ◀ 戻る
        </Btn>
        <Btn small onClick={() => setK(0)} disabled={k === 0}>
          リセット
        </Btn>
      </div>
      <Note>「仮説に合うデータだけを集める」のは都合のよい結論を作るだけ。客観的な分析とは言えない。</Note>
    </FigShell>
  )
}

/* ---------- q-dat-14: グラフの選び方 ---------- */

const D14_CASES = [
  { id: 'trend', want: '時間の推移', graph: '折れ線グラフ', short: '折れ線 → 推移', impl: '横に時間、縦に値。増減や傾向が読める。' },
  { id: 'compare', want: '項目ごとの比較', graph: '棒グラフ', short: '棒 → 比較', impl: '縦軸は0から。項目どうしの大きさを比べる。' },
  { id: 'share', want: '構成の割合', graph: '円グラフ', short: '円 → 構成比', impl: '全体に対する割合（合計100%）を見せる。' },
  { id: 'dist', want: 'データの分布', graph: 'ヒストグラム', short: 'ヒスト → 分布', impl: '値の範囲（階級）ごとの度数でばらつきを見る。' },
  { id: 'rel', want: '2つの量の関係', graph: '散布図', short: '散布図 → 関係', impl: '2つの値を点で並べ、相関や傾向を読む。' },
] as const

export function DatFig14() {
  const [pick, setPick] = useState(0)
  const c = D14_CASES[pick]
  return (
    <FigShell title="図解: 目的に合わせてグラフを選ぶ" status={`${c.want} → ${c.graph}: ${c.impl}`}>
      <Segmented
        label="何を見せたい？"
        value={String(pick)}
        options={D14_CASES.map((d, i) => ({ value: String(i), label: d.want }))}
        onChange={(v) => setPick(Number(v))}
      />
      <View label={`${c.graph} の小さな見本図`}>
        <svg viewBox="0 0 320 92" className={styles.svg}>
          {c.id === 'trend' && (
            <>
              <line x1={28} y1={8} x2={28} y2={64} stroke={BORDER} />
              <line x1={28} y1={64} x2={130} y2={64} stroke={BORDER} />
              <polyline points="38,54 58,44 82,52 110,28" fill="none" stroke={ACCENT} strokeWidth={2.5} />
            </>
          )}
          {c.id === 'compare' && (
            <>
              <line x1={24} y1={62} x2={140} y2={62} stroke={BORDER} />
              {[22, 40, 12, 30].map((h, i) => (
                <rect key={i} x={30 + i * 24} y={62 - h} width={14} height={h} rx={2} fill={TINT} stroke={ACCENT} />
              ))}
            </>
          )}
          {c.id === 'share' && (
            <>
              <circle cx={70} cy={36} r={26} fill="none" stroke={BORDER} />
              <path d="M 70 36 L 96 36 A 26 26 0 0 1 41 47 Z" fill={ACCENT} opacity={0.55} />
            </>
          )}
          {c.id === 'dist' && (
            <>
              {[
                [28, 10],
                [36, 18],
                [44, 30],
                [52, 42],
                [60, 28],
                [68, 14],
              ].map((d, i) => (
                <rect key={i} x={d[0]} y={64 - d[1]} width={5} height={d[1]} fill={TINT} stroke={ACCENT} />
              ))}
            </>
          )}
          {c.id === 'rel' && (
            <>
              {[
                [30, 58],
                [44, 50],
                [58, 45],
                [72, 38],
                [86, 30],
                [100, 22],
                [114, 16],
              ].map((p, i) => (
                <circle key={i} cx={p[0]} cy={p[1]} r={3.5} fill={ACCENT} opacity={0.8} />
              ))}
            </>
          )}
          <text x={70} y={84} fontSize={9.5} textAnchor="middle" fill={OKINK} fontWeight={700}>
            {c.short}
          </text>
        </svg>
      </View>
      <Note>探したい情報（推移・比較・構成比・分布・関係）がどれかを先に決めると、グラフの種類は自然に絞れる。</Note>
    </FigShell>
  )
}

/* ---------- q-dat-15: 相関と因果 ---------- */

const D15_CASES = [
  { id: 'x2y', label: '学習時間が得点を上げている？', expl: '因果の可能性の1つ。ただし相関だけでは断定できない。' },
  { id: 'y2x', label: '得点が高い生徒ほど学習時間が増える？', expl: '逆の因果の可能性。得点が高い生徒ほど学習を増やしている、とも読める。' },
  { id: 'other', label: '第3の要因（家庭環境など）？', expl: '隠れた要因が両方を動かしている可能性もある。' },
] as const

export function DatFig15() {
  const [pick, setPick] = useState<'x2y' | 'y2x' | 'other'>('x2y')
  const c = D15_CASES.find((v) => v.id === pick)!
  return (
    <FigShell title="図解: 正の相関があっても、因果の向きは決まっていない" status={`${c.label} → ${c.expl}`}>
      <Segmented
        label="考えられる関係"
        value={pick}
        options={D15_CASES.map((v) => ({ value: v.id, label: v.label }))}
        onChange={setPick}
      />
      <View label="「学習時間」と「テスト得点」の関係のあり方">
        <svg viewBox="0 0 320 110" className={styles.svg}>
          <text x={160} y={16} fontSize={9} textAnchor="middle" fill={MUTED}>
            観測: 正の相関（2つの量が一緒に増える）
          </text>
          <GBox x={18} y={34} w={104} h={30} text="学習時間" fs={10} />
          <GBox x={212} y={34} w={90} h={30} text="テスト得点" fs={10} />
          {pick === 'x2y' && <GArrow x1={126} y1={49} x2={208} y2={49} stroke={OK} w={2.5} />}
          {pick === 'y2x' && <GArrow x1={208} y1={49} x2={126} y2={49} stroke={ACCENT} w={2.5} />}
          {pick === 'other' && (
            <>
              <GCircle cx={160} cy={90} r={19} text="第3の要因" fs={7.5} fill={TINT} ink={MUTED} />
              <GArrow x1={146} y1={76} x2={100} y2={66} stroke={OK} />
              <GArrow x1={174} y1={76} x2={220} y2={66} stroke={OK} />
            </>
          )}
          <text x={160} y={107} fontSize={9.5} textAnchor="middle" fill={OKINK} fontWeight={700}>
            相関は「関係がある」ことを示す。原因と結果は別の話
          </text>
        </svg>
      </View>
      <Note>設問2の考察のように、「因果の向きが逆かもしれない」「第3の要因があるかもしれない」まで考えるのが分析の筋道。</Note>
    </FigShell>
  )
}

/* ---------- q-dat-16: ピボットテーブル ---------- */

const D16_ROWS: { month: string; item: string; amount: number }[] = [
  { month: '1月', item: 'りんご', amount: 120 },
  { month: '1月', item: 'みかん', amount: 80 },
  { month: '2月', item: 'りんご', amount: 150 },
  { month: '2月', item: 'みかん', amount: 70 },
  { month: '3月', item: 'りんご', amount: 110 },
  { month: '3月', item: 'みかん', amount: 90 },
]
const D16_MONTHS = ['1月', '2月', '3月']
const D16_ITEMS = ['りんご', 'みかん']

export function DatFig16() {
  const [mode, setMode] = useState<'raw' | 'row' | 'col'>('raw')
  const sum = (item: string, month: string) => D16_ROWS.filter((r) => r.item === item && r.month === month).reduce((s, r) => s + r.amount, 0)
  const monthTotal = (month: string) => D16_ROWS.filter((r) => r.month === month).reduce((s, r) => s + r.amount, 0)
  const itemTotal = (item: string) => D16_ROWS.filter((r) => r.item === item).reduce((s, r) => s + r.amount, 0)
  const grand = D16_ROWS.reduce((s, r) => s + r.amount, 0)
  return (
    <FigShell
      title="図解: ピボットテーブルは「行と列の見出しでまとめる」機能"
      status={
        mode === 'raw'
          ? '元のデータは1行 = 1記録。まだ集計されていない。'
          : `行=${mode === 'row' ? '商品' : '月'}・列=${mode === 'row' ? '月' : '商品'} → 商品別・月別の売上合計が一望できる（合計 ${grand}円）。`
      }
    >
      <Segmented
        label="表の作り方"
        value={mode}
        options={[
          { value: 'raw' as const, label: '元データ' },
          { value: 'row' as const, label: '行=商品 列=月' },
          { value: 'col' as const, label: '行=月 列=商品' },
        ]}
        onChange={setMode}
      />
      {mode === 'raw' ? (
        <div className={styles.tbl}>
          <table>
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>月</th>
                <th style={{ textAlign: 'left' }}>商品</th>
                <th style={{ textAlign: 'right' }}>売上 [円]</th>
              </tr>
            </thead>
            <tbody>
              {D16_ROWS.map((r, i) => (
                <tr key={i}>
                  <td>{r.month}</td>
                  <td>{r.item}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{r.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={styles.tbl}>
          <table>
            <thead>
              <tr>
                {mode === 'row' ? (
                  <>
                    <th style={{ textAlign: 'left' }}>商品＼月</th>
                    {D16_MONTHS.map((m) => (
                      <th key={m} style={{ textAlign: 'right' }}>
                        {m}
                      </th>
                    ))}
                    <th style={{ textAlign: 'right' }}>合計</th>
                  </>
                ) : (
                  <>
                    <th style={{ textAlign: 'left' }}>月＼商品</th>
                    {D16_ITEMS.map((it) => (
                      <th key={it} style={{ textAlign: 'right' }}>
                        {it}
                      </th>
                    ))}
                    <th style={{ textAlign: 'right' }}>合計</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {mode === 'row'
                ? D16_ITEMS.map((it) => (
                    <tr key={it}>
                      <td>{it}</td>
                      {D16_MONTHS.map((m) => (
                        <td key={m} style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                          {sum(it, m)}
                        </td>
                      ))}
                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{itemTotal(it)}</td>
                    </tr>
                  ))
                : D16_MONTHS.map((m) => (
                    <tr key={m}>
                      <td>{m}</td>
                      {D16_ITEMS.map((it) => (
                        <td key={it} style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                          {sum(it, m)}
                        </td>
                      ))}
                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{monthTotal(m)}</td>
                    </tr>
                  ))}
              <tr>
                <td style={{ fontWeight: 700 }}>合計</td>
                {D16_MONTHS.map((m) => (
                  <td key={m} style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                    {monthTotal(m)}
                  </td>
                ))}
                <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{grand}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
      <Note>ピボットテーブルは行・列の見出しを指定して、合計・平均・度数などに一括集計する表。グラフは見せるため、関数は個々の計算のためで、集計機能そのものではない。</Note>
    </FigShell>
  )
}

/* ---------- q-dat-17: 移動平均 ---------- */

const D17_VALUES = [12, 10, 14, 20, 35, 60, 80, 75, 50, 30, 18, 14]

export function DatFig17() {
  const [w, setW] = useState<3 | 6>(3)
  const ma = useMemo(
    () =>
      D17_VALUES.map((_, i) => {
        if (i < w - 1) return null
        let s = 0
        for (let j = i - w + 1; j <= i; j++) s += D17_VALUES[j]
        return s / w
      }),
    [w],
  )
  const X = (i: number) => 24 + i * 25
  const Y = (v: number) => 96 - v
  const maPts = ma.map((v, i) => (v == null ? null : `${X(i)},${Y(v)}`)).filter((p) => p != null) as string[]
  return (
    <FigShell
      title="図解: 毎月の値＋「直近の平均」を並べたグラフ"
      status={w === 3 ? '3か月の移動平均 → 毎月の細かい変動がならされ、夏に高くなる季節の傾向が読みやすい。' : '6か月の移動平均 → さらに滑らか。1年単位のゆるやかな変化を読みやすい。'}
    >
      <Segmented
        label="どの線を強調するか"
        value={String(w)}
        options={[
          { value: '3', label: '3か月移動平均' },
          { value: '6', label: '6か月移動平均' },
        ]}
        onChange={(v) => setW(Number(v) as 3 | 6)}
      />
      <View label="月別のエアコン売上 [台]（淡い線）と、移動平均（太い線）">
        <svg viewBox="0 0 320 108" className={styles.svg}>
          <line x1={14} y1={96} x2={308} y2={96} stroke={BORDER} />
          <polyline points={D17_VALUES.map((v, i) => `${X(i)},${Y(v)}`).join(' ')} fill="none" stroke={BORDER} strokeWidth={1.5} />
          {D17_VALUES.map((v, i) => (
            <circle key={i} cx={X(i)} cy={Y(v)} r={2.5} fill={BORDER} />
          ))}
          <polyline points={maPts.join(' ')} fill="none" stroke={ACCENT} strokeWidth={2.5} />
          {ma.map((v, i) =>
            v == null ? null : <circle key={`m${i}`} cx={X(i)} cy={Y(v)} r={3.5} fill={ACCENT} />,
          )}
          {['1月', '4月', '7月', '10月'].map((m, i) => (
            <text key={m} x={X(i * 3)} y={106} fontSize={8} textAnchor="middle" fill={MUTED}>
              {m}
            </text>
          ))}
          <text x={160} y={14} fontSize={9} textAnchor="middle" fill={MUTED}>
            淡い線 = 月の値 ／ 太い線 = 直近{w}か月の平均（移動平均）
          </text>
        </svg>
      </View>
      <Note>移動平均は「隣り合う一定期間の平均」を順に並べる処理。データの個数や合計は変わらない。値そのものではなく平均を並べる。</Note>
    </FigShell>
  )
}

/* ---------- q-dat-18: 時系列データ ---------- */

const D18_VALUES = [45, 52, 61, 78, 85, 92, 88, 80, 74, 65, 50, 47]

export function DatFig18() {
  const [m, setM] = useState(6) /* 7月 選択中 */
  const v = D18_VALUES[m]
  const d = m > 0 ? D18_VALUES[m] - D18_VALUES[m - 1] : null
  const X = (i: number) => 24 + i * 25
  const Y = (val: number) => 100 - val
  return (
    <FigShell
      title="図解: 時間軸で並んだデータは「時点どうしを比べる」"
      status={`${m + 1}月: ${v}千人。${d == null ? '前月のデータがない（1月）' : `前月との差は ${d > 0 ? '+' : ''}${d}千人（${d > 0 ? '増加' : d < 0 ? '減少' : '変化なし'}）`}`}
    >
      <div className={styles.ctrl}>
        {D18_VALUES.map((_, i) => (
          <Btn key={i} small on={i === m} onClick={() => setM(i)}>
            {i + 1}月
          </Btn>
        ))}
      </div>
      <View label="月別の観光客数 [千人] の折れ線グラフ。選んだ月が強調される">
        <svg viewBox="0 0 320 112" className={styles.svg}>
          <line x1={14} y1={100} x2={308} y2={100} stroke={BORDER} />
          <polyline points={D18_VALUES.map((val, i) => `${X(i)},${Y(val)}`).join(' ')} fill="none" stroke={ACCENT} strokeWidth={2} />
          {D18_VALUES.map((val, i) => (
            <circle key={i} cx={X(i)} cy={Y(val)} r={i === m ? 5 : 3} fill={i === m ? 'var(--color-success)' : ACCENT} stroke={i === m ? 'var(--color-success)' : 'none'} strokeWidth={2} />
          ))}
          {['1月', '4月', '7月', '10月'].map((mm, i) => (
            <text key={mm} x={X(i * 3)} y={110} fontSize={8} textAnchor="middle" fill={MUTED}>
              {mm}
            </text>
          ))}
          <text x={20} y={14} fontSize={9} fill={MUTED}>
            月を選ぶと値と前月差
          </text>
        </svg>
      </View>
      <Note>時系列データは折れ線グラフで推移を見る。隣接する期間の値を比べると、変化の大きさを具体的に説明できる。</Note>
    </FigShell>
  )
}

export const DAT_FIGURES = {
  'q-dat-1': DatFig1,
  'q-dat-2': DatFig2,
  'q-dat-3': DatFig3,
  'q-dat-4': DatFig4,
  'q-dat-5': DatFig5,
  'q-dat-6': DatFig6,
  'q-dat-7': DatFig7,
  'q-dat-8': DatFig8,
  'q-dat-9': DatFig9,
  'q-dat-10': DatFig10,
  'q-dat-11': DatFig11,
  'q-dat-12': DatFig12,
  'q-dat-13': DatFig13,
  'q-dat-14': DatFig14,
  'q-dat-15': DatFig15,
  'q-dat-16': DatFig16,
  'q-dat-17': DatFig17,
  'q-dat-18': DatFig18,
} as const
