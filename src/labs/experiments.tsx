/**
 * 実験ページの本体。問題の解説に付く図解とは別に、
 * パラメータを変えて結果を確かめる「動かして学ぶ」コンテンツ。
 */
import { useState } from 'react'
import { CheckIcon, CrossIcon } from '@/components/Icons'
import { Btn, Canvas, FigureFrame, Note, Readout, Slider } from '@/figures/parts'
import fig from '@/figures/figures.module.css'
import { caesarShift, comparisonCounts, mean, median, seededRng, simulatePackets } from './sim'
import s from './labs.module.css'

const PACKET_COUNT = 12
const MAX_ATTEMPTS = 3

/* ---------- パケットロス ---------- */

export function PacketLossLab() {
  const [loss, setLoss] = useState(10)
  /* 初回は決定的な乱数で、SSRとテストでも同じ結果にする */
  const [run, setRun] = useState(() => ({
    loss: 10,
    result: simulatePackets(PACKET_COUNT, 10, MAX_ATTEMPTS, seededRng(7)),
  }))
  const { result } = run

  const send = () => setRun({ loss, result: simulatePackets(PACKET_COUNT, loss, MAX_ATTEMPTS) })

  return (
    <FigureFrame
      badge="実験"
      title="パケットロスを起こして、再送のようすを見る"
      status={`損失率${run.loss}%で${PACKET_COUNT}個送信。初回で${result.firstTry}個、再送で${result.retried}個が届き、${result.failed}個は最後まで届きませんでした。送信は合計${result.sent}回。`}
      statusKind={result.failed > 0 ? 'ng' : 'ok'}
    >
      <Slider label="回線の損失率 [%]" value={loss} min={0} max={40} onChange={setLoss} fmt={(v) => `${v}%`} />
      <div className={fig.ctrl}>
        <Btn on onClick={send}>
          送信する
        </Btn>
        <span className={fig.note}>押すたびに結果が変わります</span>
      </div>
      <Canvas label="12個のパケットそれぞれの到達結果" interactive>
        <ol className={s.packets} aria-label="パケットごとの到達結果">
          {result.packets.map((p) => {
            const state = !p.delivered ? s.packetNg : p.attempts > 1 ? s.packetRetry : s.packetOk
            return (
              <li key={p.id} className={`${s.packet} ${state}`}>
                <span className={s.packetId}>#{p.id}</span>
                <span className={s.packetMeta}>{p.delivered ? `到達 ${p.attempts}回` : '未達'}</span>
              </li>
            )
          })}
        </ol>
      </Canvas>
      <Readout
        items={[
          { k: '初回で到達', v: `${result.firstTry}個` },
          { k: '再送で到達', v: `${result.retried}個` },
          { k: '最後まで未達', v: `${result.failed}個`, ng: result.failed > 0 },
          { k: '送信の合計', v: `${result.sent}回`, strong: true },
        ]}
      />
      <Note>再送しても届かないことがある。損失率が高いほど、送信回数と遅れが増える。</Note>
    </FigureFrame>
  )
}

/* ---------- シーザー暗号 ---------- */

export function CaesarLab() {
  const [text, setText] = useState('HELLO WORLD')
  const [shift, setShift] = useState(3)
  const cipher = text ? caesarShift(text, shift) : ''

  return (
    <FigureFrame
      badge="実験"
      title="文字をずらして、暗号文をつくる"
      status={
        text
          ? `${text} を${shift}文字ずらすと ${cipher}。同じだけ戻せば復号できる。`
          : '英字を入力すると、暗号文が出ます。'
      }
    >
      <div className={s.field}>
        <label className={s.fieldLabel} htmlFor="caesar-input">
          暗号化する文字（A–Zと空白）
        </label>
        <input
          id="caesar-input"
          className={s.input}
          value={text}
          maxLength={24}
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
          placeholder="HELLO WORLD"
          onChange={(e) => setText(e.target.value.toUpperCase().replace(/[^A-Z ]/g, '').slice(0, 24))}
        />
      </div>
      <Slider label="ずらす文字数（鍵）" value={shift} min={0} max={25} onChange={setShift} fmt={(v) => `${v}文字`} />
      <Canvas label="元の文と、ずらしたあとの暗号文" interactive>
        <div className={s.cipherGroup}>
          <div>
            <span className={s.cipherLabel}>元の文</span>
            <p className={s.cipherBox}>{text || '（入力してください）'}</p>
          </div>
          <p className={s.cipherArrow} aria-hidden="true">
            ↓ {shift}文字ずらす
          </p>
          <div>
            <span className={s.cipherLabel}>暗号文</span>
            <p className={`${s.cipherBox} ${s.cipherOut}`}>{cipher || '—'}</p>
          </div>
          {cipher && <p className={s.decoded}>復号（{shift}文字戻す）: {caesarShift(cipher, -shift)}</p>}
        </div>
      </Canvas>
      <Note>鍵を知っていれば戻せる。ただし鍵の候補は26通りしかないので、総当たりで試されやすい。</Note>
    </FigureFrame>
  )
}

/* ---------- 引用チェック ---------- */

const CITATION_CONDITIONS = [
  '出典（著作者名・タイトル・発行年など）を明示した',
  '自分の説明が主で、引用は従になっている',
  '引用部分を改変せず、そのまま示した',
  '引用は、自分の説明に必要な範囲に収まっている',
]

export function CitationLab() {
  const [met, setMet] = useState<boolean[]>(CITATION_CONDITIONS.map(() => false))
  const missing = CITATION_CONDITIONS.filter((_, i) => !met[i])
  const ok = missing.length === 0

  const toggle = (index: number) =>
    setMet((prev) => prev.map((value, i) => (i === index ? !value : value)))

  return (
    <FigureFrame
      badge="実験"
      title="条件を切り替えて、引用になるか判定する"
      status={ok ? '4つの条件をすべて満たした。引用として認められる可能性が高い。' : `あと${missing.length}個の条件が足りない。`}
      statusKind={ok ? 'ok' : 'ng'}
    >
      <div className={s.checks} role="group" aria-label="引用の条件">
        {CITATION_CONDITIONS.map((label, i) => (
          <button
            key={label}
            type="button"
            className={`${s.check} ${met[i] ? s.checkOn : ''}`}
            aria-pressed={met[i]}
            onClick={() => toggle(i)}
          >
            <span className={s.checkMark} aria-hidden="true">
              {met[i] ? <CheckIcon /> : <CrossIcon />}
            </span>
            <span>{label}</span>
          </button>
        ))}
      </div>
      <div className={`${s.verdict} ${ok ? s.verdictOk : s.verdictNg}`}>
        <span className={s.verdictMark} aria-hidden="true">
          {ok ? <CheckIcon size={22} /> : <CrossIcon size={22} />}
        </span>
        <span>
          {ok ? '引用として認められる可能性が高い' : 'このままでは引用の条件を満たさない'}
          {!ok && <span className={s.verdictReason}>（足りない条件: {missing.join('、')}）</span>}
        </span>
      </div>
      <Note>引用は「出所明示」「公正な慣行」「必要な範囲」がそろって初めて成立する。1つ欠けると著作権侵害になりうる。</Note>
    </FigureFrame>
  )
}

/* ---------- 逐次探索と二分探索 ---------- */

export function SearchRaceLab() {
  const [n, setN] = useState(64)
  const { linear, binary } = comparisonCounts(n, n)
  const ratio = Math.round(linear / binary)

  return (
    <FigureFrame
      badge="実験"
      title="データを増やすと、探す手間はどう変わる？"
      status={`${n}件のデータ。先頭から探すと最大${linear}回、二分探索なら最大${binary}回。約${ratio}倍の差。`}
    >
      <Slider label="データの件数 n" value={n} min={16} max={1024} step={16} onChange={setN} fmt={(v) => `${v}件`} />
      <Canvas label={`n=${n} のときの、最大の比較回数`} interactive>
        <div className={s.bars} role="img" aria-label={`先頭から最大${linear}回、二分探索で最大${binary}回`}>
          <div className={s.barRow}>
            <div className={s.barHead}>
              <span>先頭から順に探す</span>
              <strong>{linear}回</strong>
            </div>
            <div className={s.barTrack}>
              <div className={`${s.barFill} ${s.barLinear}`} style={{ width: '100%' }} />
            </div>
          </div>
          <div className={s.barRow}>
            <div className={s.barHead}>
              <span>二分探索（半分に絞る）</span>
              <strong>{binary}回</strong>
            </div>
            <div className={s.barTrack}>
              <div className={`${s.barFill} ${s.barBinary}`} style={{ width: `${Math.max(2, (binary / linear) * 100)}%` }} />
            </div>
          </div>
        </div>
      </Canvas>
      <Readout
        items={[
          { k: 'データの件数', v: `${n}件` },
          { k: '先頭から探す', v: `${linear}回` },
          { k: '二分探索', v: `${binary}回`, ok: true },
          { k: '手間の比', v: `約${ratio}倍`, strong: true },
        ]}
      />
      <Note>二分探索は「整列済み」のデータが前提。1回比べるたびに候補が半分になるので、件数が増えても回数はゆっくりしか増えない。</Note>
    </FigureFrame>
  )
}

/* ---------- 平均値と中央値 ---------- */

const INITIAL_VALUES = [2, 3, 3, 4, 6]

export function MeanMedianLab() {
  const [values, setValues] = useState<number[]>(INITIAL_VALUES)
  const [next, setNext] = useState(100)
  const avg = mean(values)
  const med = median(values)
  const pulled = avg - med >= 1

  const totals = new Map<number, number>()
  for (const v of values) totals.set(v, (totals.get(v) ?? 0) + 1)
  const seen = new Map<number, number>()
  const dots = values.map((v) => {
    const total = totals.get(v) ?? 1
    const index = seen.get(v) ?? 0
    seen.set(v, index + 1)
    const gap = Math.min(8, 64 / total)
    const offset = total > 1 ? (index - (total - 1) / 2) * gap : 0
    return { cx: Math.min(306, Math.max(14, 16 + v * 2.88 + offset)) }
  })
  const x = (v: number) => 16 + v * 2.88
  const fmt = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(1))

  return (
    <FigureFrame
      badge="実験"
      title="データを足して、平均値と中央値の動きを比べる"
      status={`${values.length}件。平均値 ${avg.toFixed(1)}、中央値 ${fmt(med)}。${
        pulled ? '平均値だけが大きい値に引っ張られている。' : '平均値と中央値は近い。'
      }`}
      statusKind={pulled ? 'ng' : 'plain'}
    >
      <Slider label="追加する値" value={next} min={1} max={100} onChange={setNext} fmt={(v) => `${v}`} />
      <div className={fig.ctrl}>
        <Btn on onClick={() => values.length < 12 && setValues([...values, next])} disabled={values.length >= 12}>
          データに追加
        </Btn>
        <Btn onClick={() => values.length > 1 && setValues(values.slice(0, -1))} disabled={values.length <= 1}>
          最後の1件を消す
        </Btn>
        <Btn onClick={() => setValues(INITIAL_VALUES)} disabled={values.length === INITIAL_VALUES.length && values.every((v, i) => v === INITIAL_VALUES[i])}>
          リセット
        </Btn>
      </div>
      <Canvas label={`${values.length}件のデータの分布。平均値 ${avg.toFixed(1)}、中央値 ${fmt(med)}`} interactive>
        <svg viewBox="0 0 320 92" className={fig.svg} role="img" aria-label={`データ ${values.join('、')}。実線が平均値 ${avg.toFixed(1)}、点線が中央値 ${fmt(med)}`}>
          <line x1={16} y1={66} x2={304} y2={66} stroke="var(--color-border)" />
          {[0, 50, 100].map((v) => (
            <g key={v}>
              <line x1={x(v)} y1={62} x2={x(v)} y2={70} stroke="var(--color-border)" />
              <text x={x(v)} y={84} fontSize={11} textAnchor="middle" fill="var(--color-secondary-label)">
                {v}
              </text>
            </g>
          ))}
          <line x1={x(avg)} y1={18} x2={x(avg)} y2={72} stroke="var(--color-accent)" strokeWidth={2} />
          <line x1={x(med)} y1={18} x2={x(med)} y2={72} stroke="var(--color-success)" strokeWidth={2} strokeDasharray="4 3" />
          {dots.map((d, i) => (
            <circle key={i} cx={d.cx} cy={58} r={4} fill="var(--color-accent)" />
          ))}
        </svg>
        <p className={s.valueList}>データ: {values.join('、')}</p>
        <p className={s.legend}>
          <span className={s.legendMean}>実線 = 平均値</span>
          <span className={s.legendMedian}>点線 = 中央値</span>
        </p>
      </Canvas>
      <Readout
        items={[
          { k: '件数', v: `${values.length}件` },
          { k: '平均値', v: avg.toFixed(1) },
          { k: '中央値', v: fmt(med), ok: true },
          { k: '最大値', v: `${Math.max(...values)}` },
        ]}
      />
      <Note>100のような外れ値を1件足すと、平均値は大きく動くが、中央値はほとんど動かない。</Note>
    </FigureFrame>
  )
}
