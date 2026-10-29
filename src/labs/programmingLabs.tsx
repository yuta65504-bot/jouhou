/**
 * プログラミングの実験（追加分）。繰り返し・条件分岐・再帰・論理回路・乱数。
 */
import { useState } from 'react'
import { Segmented } from '@/components/Segmented'
import { Btn, Canvas, CellTrack, FigureFrame, GArrow, GBox, GCircle, MUTED, Note, Readout, Slider, TINT } from '@/figures/parts'
import fig from '@/figures/figures.module.css'
import { fibCalls, grade, rollDice, seededRng, sumTo, binarySearchTrace, selectionSortPasses } from './sim'
import s from './labs.module.css'

/* ---------- 繰り返しの合計 ---------- */

export function SumLoopLab() {
  const [n, setN] = useState(10)
  const total = sumTo(n)

  return (
    <FigureFrame
      badge="実験"
      title="繰り返しで、1からnまで足す"
      status={`1から${n}まで足すと ${total}。繰り返しの回数は${n}回で、足すたびに合計が増えていく。`}
    >
      <Slider label="n（最後の数）" value={n} min={1} max={20} onChange={setN} fmt={(v) => `${v}`} />
      <CellTrack values={Array.from({ length: n }, (_, i) => i + 1)} compact wrap ariaLabel="足す数" />
      <Readout
        items={[
          { k: '繰り返す回数', v: `${n}回` },
          { k: '合計', v: `${total}`, strong: true },
          { k: '公式', v: `n(n+1)÷2 = ${n}×${n + 1}÷2` },
        ]}
      />
      <Note>繰り返しの回数が増えると、合計を求める時間も比例して増える。</Note>
    </FigureFrame>
  )
}

/* ---------- 条件分岐 ---------- */

export function BranchLab() {
  const [score, setScore] = useState(72)
  const result = grade(score)
  const rows = [
    { text: `もし score ≧ 80 なら`, active: score >= 80 },
    { text: `　${'A'}（80以上）`, active: score >= 80 },
    { text: `そうでなくもし score ≧ 60 なら`, active: score < 80 && score >= 60 },
    { text: `　${'B'}（60以上80未満）`, active: score < 80 && score >= 60 },
    { text: `そうでなくもし score ≧ 40 なら`, active: score < 60 && score >= 40 },
    { text: `　${'C'}（40以上60未満）`, active: score < 60 && score >= 40 },
    { text: `そうでなければ`, active: score < 40 },
    { text: `　${'D'}（40未満）`, active: score < 40 },
  ]

  return (
    <FigureFrame badge="実験" title="点数を変えて、どの分岐を通るか見る" status={`score = ${score} のとき、条件を上から順に見て ${result} になる。`}>
      <Slider label="score" value={score} min={0} max={100} onChange={setScore} fmt={(v) => `${v}点`} />
      <Canvas label="点数と判定のようす" interactive>
        <div className={s.meter} aria-hidden="true">
          <div className={`${s.meterFill}`} style={{ width: `${score}%` }} />
        </div>
        <p className={s.valueList}>{score}点 → 判定 {result}</p>
      </Canvas>
      <ol className={fig.code} aria-label="条件分岐のプログラム">
        {rows.map((row, i) => (
          <li key={i} className={`${fig.codeLine} ${row.active ? fig.codeCurrent : ''}`}>
            {row.text}
          </li>
        ))}
      </ol>
      <Note>条件は上から順に評価され、最初に当てはまった枝だけが実行される。</Note>
    </FigureFrame>
  )
}

/* ---------- 再帰呼び出し ---------- */

export function RecursionLab() {
  const [n, setN] = useState(10)
  const calls = fibCalls(n)
  const calls30 = fibCalls(30)
  const meter = Math.min(100, (Math.log10(calls) / Math.log10(calls30)) * 100)

  return (
    <FigureFrame
      badge="実験"
      title="再帰は、同じ計算を何回呼ぶ？"
      status={`fib(${n}) を素朴な再帰で計算すると ${calls.toLocaleString()} 回呼び出す。nが大きいと、呼び出しはおよそ1.6倍ずつ増える。`}
    >
      <Slider label="n" value={n} min={1} max={20} onChange={setN} fmt={(v) => `fib(${v})`} />
      <Canvas label="再帰呼び出しの回数" interactive>
        <div className={s.meter} aria-hidden="true">
          <div className={`${s.meterFill} ${s.meterNg}`} style={{ width: `${meter}%` }} />
        </div>
        <p className={s.valueList}>呼び出し回数 {calls.toLocaleString()} 回（n=30 なら {calls30.toLocaleString()} 回）</p>
      </Canvas>
      <Readout
        items={[
          { k: 'n', v: `${n}` },
          { k: '呼び出し回数', v: `${calls.toLocaleString()}回`, strong: true },
          { k: 'n=30のとき', v: `${calls30.toLocaleString()}回`, ng: true },
        ]}
      />
      <Note>同じ fib(k) を何度も計算してしまう。メモ化すると、呼び出し回数を大きく減らせる。</Note>
    </FigureFrame>
  )
}

/* ---------- 論理回路 ---------- */

type Gate = 'and' | 'or' | 'xor'

export function LogicGatesLab() {
  const [a, setA] = useState(true)
  const [b, setB] = useState(false)
  const [gate, setGate] = useState<Gate>('and')
  const out = gate === 'and' ? a && b : gate === 'or' ? a || b : a !== b

  return (
    <FigureFrame
      badge="実験"
      title="入力を変えて、論理回路の出力を見る"
      status={`A=${a ? 1 : 0}、B=${b ? 1 : 0} のとき、${gate.toUpperCase()} の出力は ${out ? 1 : 0}。`}
      statusKind={out ? 'ok' : 'plain'}
    >
      <Segmented
        label="論理演算"
        value={gate}
        options={[
          { value: 'and' as const, label: 'AND' },
          { value: 'or' as const, label: 'OR' },
          { value: 'xor' as const, label: 'XOR' },
        ]}
        onChange={setGate}
      />
      <Canvas label="論理回路の入力と出力" interactive>
        <svg viewBox="0 0 300 100" className={fig.svg} role="img" aria-label={`A=${a ? 1 : 0}、B=${b ? 1 : 0}、${gate}の出力は${out ? 1 : 0}`}>
          <GBox x={16} y={12} w={54} h={28} text={`A = ${a ? 1 : 0}`} fill={a ? 'var(--color-accent-tint)' : 'var(--color-surface)'} />
          <GBox x={16} y={60} w={54} h={28} text={`B = ${b ? 1 : 0}`} fill={b ? 'var(--color-accent-tint)' : 'var(--color-surface)'} />
          <GArrow x1={72} y1={26} x2={128} y2={40} />
          <GArrow x1={72} y1={74} x2={128} y2={60} />
          <GBox x={130} y={34} w={76} h={32} text={gate.toUpperCase()} bold />
          <GArrow x1={208} y1={50} x2={244} y2={50} stroke={out ? 'var(--color-success)' : 'var(--color-border)'} />
          <GCircle cx={266} cy={50} r={20} text={out ? '1' : '0'} fill={out ? 'var(--color-success)' : TINT} ink={out ? '#fff' : MUTED} />
        </svg>
      </Canvas>
      <div className={fig.ctrl}>
        <Btn on={a} ariaPressed={a} onClick={() => setA((v) => !v)}>
          A を {a ? '0' : '1'} に
        </Btn>
        <Btn on={b} ariaPressed={b} onClick={() => setB((v) => !v)}>
          B を {b ? '0' : '1'} に
        </Btn>
      </div>
      <Readout
        items={[
          { k: 'A', v: a ? '1' : '0' },
          { k: 'B', v: b ? '1' : '0' },
          { k: '出力', v: out ? '1' : '0', strong: true },
        ]}
      />
      <Note>ANDは両方1のときだけ1、ORはどちらかが1なら1、XORは2つが違うときだけ1。</Note>
    </FigureFrame>
  )
}

/* ---------- 乱数シミュレーション ---------- */

const DICE_TRIALS = [
  { value: '10', label: '10回' },
  { value: '100', label: '100回' },
  { value: '1000', label: '1000回' },
] as const
type DiceTrials = (typeof DICE_TRIALS)[number]['value']

export function DiceSimLab() {
  const [trials, setTrials] = useState<DiceTrials>('100')
  const [run, setRun] = useState(() => ({ trials: 100, result: rollDice(100, seededRng(3)) }))
  const max = Math.max(...run.result.counts, 1)
  const near = Math.abs(run.result.mean - 3.5) < 0.2

  return (
    <FigureFrame
      badge="実験"
      title="サイコロを振って、平均が3.5に近づくか見る"
      status={`${run.trials}回ふった平均は ${run.result.mean.toFixed(2)}。期待値は3.5。${near ? '近い値になった。' : 'まだ離れている。'}`}
      statusKind={near ? 'ok' : 'plain'}
    >
      <Segmented label="試行回数" value={trials} options={DICE_TRIALS} onChange={setTrials} />
      <div className={fig.ctrl}>
        <Btn on onClick={() => setRun({ trials: Number(trials), result: rollDice(Number(trials)) })}>
          ふってみる
        </Btn>
        <span className={fig.note}>押すたびに結果が変わります</span>
      </div>
      <Canvas label="サイコロの目の出た回数" interactive>
        <div className={s.diceChart} role="img" aria-label={`1から6の目がそれぞれ ${run.result.counts.join('、')} 回`}>
          {run.result.counts.map((count, i) => (
            <div key={i} className={s.diceCol}>
              <span className={s.diceCount}>{count}</span>
              <div className={s.diceBarWrap}>
                <div className={s.diceBar} style={{ height: `${(count / max) * 100}%` }} />
              </div>
              <span className={s.diceFace}>{i + 1}</span>
            </div>
          ))}
        </div>
      </Canvas>
      <Readout
        items={[
          { k: '試行回数', v: `${run.trials}回` },
          { k: '平均', v: run.result.mean.toFixed(2), strong: true },
          { k: '期待値', v: '3.5' },
        ]}
      />
      <Note>試行回数を増やすほど、平均は期待値3.5に近づきやすくなる（大数の法則）。</Note>
    </FigureFrame>
  )
}

/* ---------- 条件で取り出す（追加30本） ---------- */

const FILTER_SCORES = [55, 72, 48, 90, 66, 81, 39, 74]

export function FilterLab() {
  const [threshold, setThreshold] = useState(70)
  const matched = FILTER_SCORES.filter((v) => v >= threshold)

  return (
    <FigureFrame
      badge="実験"
      title="条件に合うデータだけを取り出す"
      status={`${threshold}点以上のデータは${matched.length}件。1件ずつ条件を比べ、合うものだけを残す。`}
    >
      <Slider label="しきい値 [点]" value={threshold} min={30} max={95} onChange={setThreshold} fmt={(v) => `${v}点以上`} />
      <CellTrack
        values={FILTER_SCORES}
        states={FILTER_SCORES.map((v) => (v >= threshold ? 'ok' : 'muted'))}
        marks={FILTER_SCORES.map((v) => (v >= threshold ? '対象' : undefined))}
        wrap
        ariaLabel={`${threshold}点以上のデータを取り出す`}
      />
      <Readout
        items={[
          { k: '全体', v: `${FILTER_SCORES.length}件` },
          { k: '条件に合う', v: `${matched.length}件`, ok: true, strong: true },
          { k: '最大値', v: matched.length ? `${Math.max(...matched)}` : '—' },
        ]}
      />
      <Note>条件に合うデータだけを取り出すには、1件ずつ条件を比べ、合うものだけを残す。</Note>
    </FigureFrame>
  )
}

/* ---------- 最大値を探す ---------- */

const MAX_VALUES = [34, 78, 52, 91, 66, 43, 88]

export function MaxValueLab() {
  const [index, setIndex] = useState(2)
  const seen = MAX_VALUES.slice(0, index + 1)
  const max = Math.max(...seen)

  return (
    <FigureFrame
      badge="実験"
      title="最大値は、どうやって見つける？"
      status={`${index + 1}件目まで見たときの最大値は ${max}。先頭を仮の最大にして、残りと1件ずつ比べる。`}
    >
      <CellTrack
        values={MAX_VALUES}
        current={index}
        states={MAX_VALUES.map((v, i) => (i <= index && v === max ? 'ok' : i > index ? 'muted' : undefined))}
        marks={MAX_VALUES.map((v, i) => (i === index ? '注目' : v === max && i <= index ? '最大' : undefined))}
        onSelect={setIndex}
        ariaLabel="最大値を探す配列。セルを押すと、そこまで比べる"
      />
      <Readout
        items={[
          { k: '見た件数', v: `${index + 1}件` },
          { k: '比較した回数', v: `${index}回` },
          { k: 'いまの最大値', v: `${max}`, strong: true, ok: true },
        ]}
      />
      <Note>最大値は、先頭を仮の最大にして、残りと1件ずつ比べて更新する。n件なら最大n-1回比べる。</Note>
    </FigureFrame>
  )
}

/* ---------- 変数の入れ替え ---------- */

export function SwapLab() {
  const [method, setMethod] = useState<'temp' | 'direct'>('temp')
  let x = 1
  let y = 2
  if (method === 'temp') {
    const temp = x
    x = y
    y = temp
  } else {
    x = y
    y = x
  }
  const lines = method === 'temp' ? ['t = x', 'x = y', 'y = t'] : ['x = y', 'y = x']

  return (
    <FigureFrame
      badge="実験"
      title="2つの値を、正しく入れ替えられる？"
      status={`x=1、y=2 から${method === 'temp' ? '一時変数を使って' : '直接代入すると'}、x=${x}、y=${y}。`}
      statusKind={method === 'temp' ? 'ok' : 'ng'}
    >
      <Segmented
        label="入れ替えの方法"
        value={method}
        options={[
          { value: 'temp' as const, label: '一時変数を使う' },
          { value: 'direct' as const, label: '直接代入する' },
        ]}
        onChange={setMethod}
      />
      <ol className={fig.code} aria-label="入れ替えのプログラム">
        {lines.map((line, i) => (
          <li key={i} className={fig.codeLine}>
            {line}
          </li>
        ))}
      </ol>
      <Readout
        items={[
          { k: 'はじめ', v: 'x=1、y=2' },
          { k: 'x', v: `${x}`, ok: x === 2, ng: x !== 2 },
          { k: 'y', v: `${y}`, ok: y === 1, ng: y !== 1 },
          { k: '入れ替え', v: x === 2 && y === 1 ? '成功' : '失敗', strong: true, ok: x === 2 && y === 1, ng: !(x === 2 && y === 1) },
        ]}
      />
      <Note>2つの値を入れ替えるには、一時変数に1つを退避する。直接代入すると、片方の値が失われる。</Note>
    </FigureFrame>
  )
}

/* ---------- 配列の添字 ---------- */

const INITIAL_ARRAY = [3, 1, 4, 1, 5, 9, 2, 6]

export function ArrayIndexLab() {
  const [values, setValues] = useState(INITIAL_ARRAY)
  const [index, setIndex] = useState(2)
  const [next, setNext] = useState(0)

  return (
    <FigureFrame
      badge="実験"
      title="添字を指定して、配列を読み書きする"
      status={`a[${index}] は ${values[index]}。添字は0から始まるので、最初の要素は a[0]。`}
    >
      <CellTrack
        values={values}
        current={index}
        showIndex
        onSelect={setIndex}
        ariaLabel="配列。セルを押すと添字を選べる"
      />
      <Slider label="代入する値" value={next} min={0} max={9} onChange={setNext} fmt={(v) => `${v}`} />
      <div className={fig.ctrl}>
        <Btn on onClick={() => setValues((prev) => prev.map((v, i) => (i === index ? next : v)))}>
          a[{index}] に代入
        </Btn>
        <Btn onClick={() => setValues(INITIAL_ARRAY)}>リセット</Btn>
      </div>
      <Readout
        items={[
          { k: '添字', v: `${index}` },
          { k: 'a[index]', v: `${values[index]}`, strong: true },
          { k: '合計', v: `${values.reduce((sum, v) => sum + v, 0)}` },
        ]}
      />
      <Note>配列は添字で要素を指定する。多くの言語では添字は0から始まる。</Note>
    </FigureFrame>
  )
}

/* ---------- 二次元配列 ---------- */

const MATRIX = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
]

export function MatrixLab() {
  const [row, setRow] = useState(1)
  const [col, setCol] = useState(1)
  const rowSum = MATRIX[row].reduce((sum, v) => sum + v, 0)
  const colSum = MATRIX.reduce((sum, r) => sum + r[col], 0)

  return (
    <FigureFrame
      badge="実験"
      title="行と列の2つの添字で、表のマスを指す"
      status={`a[${row}][${col}] は ${MATRIX[row][col]}。行の合計は${rowSum}、列の合計は${colSum}。`}
    >
      <Slider label="行の添字" value={row} min={0} max={2} onChange={setRow} fmt={(v) => `行${v}`} />
      <Slider label="列の添字" value={col} min={0} max={2} onChange={setCol} fmt={(v) => `列${v}`} />
      <div className={s.matrix} role="group" aria-label="3行3列の二次元配列">
        {MATRIX.map((r, i) =>
          r.map((v, j) => (
            <Btn
              key={`${i}-${j}`}
              on={i === row && j === col}
              ariaPressed={i === row && j === col}
              ariaLabel={`行${i}、列${j}、値${v}`}
              onClick={() => {
                setRow(i)
                setCol(j)
              }}
            >
              {v}
            </Btn>
          )),
        )}
      </div>
      <Readout
        items={[
          { k: '選んだ要素', v: `a[${row}][${col}] = ${MATRIX[row][col]}`, strong: true },
          { k: '行の合計', v: `${rowSum}` },
          { k: '列の合計', v: `${colSum}` },
        ]}
      />
      <Note>二次元配列は行と列の2つの添字で要素を指定する。表のマス目として扱える。</Note>
    </FigureFrame>
  )
}

/* ---------- 二分探索の手順 ---------- */

export function BinarySearchStepsLab() {
  const [n, setN] = useState(16)
  const [target, setTarget] = useState(13)
  const trace = binarySearchTrace(n, target)

  return (
    <FigureFrame
      badge="実験"
      title="二分探索は、どこを比べて絞り込む？"
      status={`${n}件から${target}を探すと、${trace.join(' → ')} の${trace.length}か所を比べて見つかる。`}
    >
      <Slider
        label="データの件数 n"
        value={n}
        min={8}
        max={64}
        step={8}
        onChange={(v) => {
          setN(v)
          setTarget((t) => Math.min(t, v))
        }}
        fmt={(v) => `${v}件`}
      />
      <Slider label="探す値の位置" value={target} min={1} max={n} onChange={setTarget} fmt={(v) => `${v}番目`} />
      <CellTrack values={trace} marks={trace.map((_, i) => `${i + 1}回目`)} wrap ariaLabel="二分探索で比べた位置" />
      <Readout
        items={[
          { k: 'データの件数', v: `${n}件` },
          { k: '比べた回数', v: `${trace.length}回`, strong: true },
          { k: '比べた位置', v: trace.join(' → ') },
        ]}
      />
      <Note>二分探索は中央と比べるたびに候補を半分にする。整列済みのデータが必要。</Note>
    </FigureFrame>
  )
}

/* ---------- 選択ソート ---------- */

const SORT_VALUES = [5, 3, 8, 1, 4]

export function SelectionSortLab() {
  const [pass, setPass] = useState(0)
  const { passes, swaps } = selectionSortPasses(SORT_VALUES)
  const current = pass === 0 ? SORT_VALUES : passes[pass - 1]
  const sortedCount = pass === 0 ? 0 : pass + 1
  const swapsDone = swaps.slice(0, pass).reduce((sum, v) => sum + v, 0)

  return (
    <FigureFrame
      badge="実験"
      title="選択ソートは、パスごとに何が決まる？"
      status={`${pass}パス終了。先頭から${sortedCount}件が確定し、交換は合計${swapsDone}回。`}
    >
      <Slider label="進んだパス数" value={pass} min={0} max={SORT_VALUES.length - 1} onChange={setPass} fmt={(v) => `${v}パス`} />
      <CellTrack
        values={current}
        states={current.map((_, i) => (i < sortedCount ? 'ok' : undefined))}
        marks={current.map((_, i) => (i < sortedCount ? '確定' : undefined))}
        wrap
        ariaLabel="選択ソートの途中経過"
      />
      <Readout
        items={[
          { k: 'パス', v: `${pass} / ${SORT_VALUES.length - 1}` },
          { k: '交換した回数', v: `${swapsDone}回`, strong: true },
          { k: 'このパスで交換', v: pass === 0 ? '—' : swaps[pass - 1] ? '1回' : '0回' },
        ]}
      />
      <Note>選択ソートは、残りの範囲から最小値を選んで先頭と交換する。パスごとに整列済みの部分が増える。</Note>
    </FigureFrame>
  )
}
