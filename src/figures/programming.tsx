/**
 * プログラミング（programming, q-pro-1〜18）: 問題ごとのインタラクティブ図解。
 * - q-pro-3 / q-pro-4 は、src/lib/dncl-engine.ts のステップ実行エンジンを使う
 * - それ以外は問題に合わせた個別のステップ・シミュレーション図解
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import styles from './figures.module.css'
import { Segmented } from '@/components/Segmented'
import { useStepPlayer } from '@/lib/motion'
import { dnclPrograms } from '@/content/dncl'
import { computeRun, parseProgram, varNamesOf, STEP_LIMIT, type RunResult } from '@/lib/dncl-engine'
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
  OKINK,
  Readout,
  TINT,
  View,
  Btn,
  Slider,
  LABEL,
  GArrayRow,
  GBox,
  GCircle,
  GDiamond,
  GArrow,
} from './parts'

/* =========================================================
 * DNCL のステップ実行を行う共通パーツ（q-pro-3 / q-pro-4 で使用）
 * ========================================================= */

type ParsedProgram = { ok: true; run: RunResult; names: string[] } | { ok: false; msg: string }

function DnclStepper({
  lines,
  label,
  displayLines,
  lineMap,
}: {
  lines: readonly string[]
  label: string
  /** 画面に表示する公式表記。省略時は lines をそのまま表示する */
  displayLines?: readonly string[]
  /** lines の行番号 → displayLines の行番号。省略時は同じ番号 */
  lineMap?: readonly number[]
}) {
  const parsed = useMemo<ParsedProgram>(() => {
    try {
      const program = parseProgram(lines)
      return { ok: true, run: computeRun(program, STEP_LIMIT), names: varNamesOf(program) }
    } catch {
      return { ok: false, msg: 'プログラムを読み取れませんでした' }
    }
  }, [lines])

  const snaps = parsed.ok ? parsed.run.snapshots : []
  const n = snaps.length
  const player = useStepPlayer(n + 1, 1400)
  const { step } = player
  const codeRef = useRef<HTMLOListElement>(null)
  const lineRef = useRef<HTMLLIElement>(null)

  const curLine = !parsed.ok || step === 0 ? -1 : snaps[Math.min(step, n) - 1].line
  const curDisplayLine = curLine < 0 ? -1 : lineMap ? (lineMap[curLine] ?? curLine) : curLine

  useEffect(() => {
    if (curDisplayLine < 0) {
      if (codeRef.current) codeRef.current.scrollTop = 0
      return
    }
    const list = codeRef.current
    const line = lineRef.current
    if (!list || !line) return
    const top = line.offsetTop - list.offsetTop
    if (top < list.scrollTop || top + line.offsetHeight > list.scrollTop + list.clientHeight) {
      list.scrollTop = Math.max(0, top - 8)
    }
  }, [curDisplayLine])

  if (!parsed.ok) {
    return (
      <FigShell title="図解: プログラムを1手ずつ実行する">
        <Note>{parsed.msg}</Note>
      </FigShell>
    )
  }

  const shownLines = displayLines ?? lines
  const vars = step === 0 ? {} : snaps[Math.min(step, n) - 1].vars
  const done = step >= n && parsed.run.done
  return (
    <FigureFrame
      title="図解: 1手ずつ実行して、変数の変化を見る"
      status={
        step === 0
          ? '「次へ」を押すと、1手ずつ実行される。変数の値がどう変わるか見てみる。'
          : `${step}手実行（${step === n ? '実行は完了' : `今は${curDisplayLine + 1}行目`}）。変数の値は表で確認。`
      }
      statusKind={done ? 'ok' : 'plain'}
      step={step}
      total={n + 1}
      playing={player.playing}
      onPrev={player.prev}
      onNext={player.next}
      onReset={player.reset}
      onPlayToggle={player.toggle}
    >
      <Canvas label={label} interactive>
        <div className={styles.stepperGrid}>
          <ol className={styles.code} ref={codeRef}>
            {shownLines.map((ln, i) => (
              <li
                key={i}
                ref={curDisplayLine === i ? lineRef : undefined}
                className={`${styles.codeLine} ${curDisplayLine === i ? styles.codeCurrent : ''}`}
                aria-current={curDisplayLine === i ? 'step' : undefined}
              >
                <span className={styles.codeNo}>{i + 1}</span>
                <span>{ln}</span>
              </li>
            ))}
          </ol>
          <table className={styles.tbl} aria-label="変数の値">
            <thead>
              <tr>
                <th scope="col">変数</th>
                <th scope="col">値</th>
              </tr>
            </thead>
            <tbody>
              {parsed.names.map((nm) => {
                const value = vars[nm]
                return (
                  <tr key={nm}>
                    <td>{nm}</td>
                    <td className={value != null ? styles.cellHit : styles.cellMuted}>
                      <span key={String(value ?? '—')} className={styles.fadeIn}>
                        {value ?? '—'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Canvas>
      <Readout
        items={[
          { k: '実行した手数', v: `${step} / ${n}` },
          { k: '現在の行', v: curDisplayLine >= 0 ? `${curDisplayLine + 1}行目` : '開始前' },
        ]}
      />
      {parsed.run.error != null && <Note>エラー: {parsed.run.error.message}</Note>}
      {done && <Note>このプログラムは{n}手で実行が終わった。最後の変数の値が「出力（結果）」になる。</Note>}
    </FigureFrame>
  )
}

/* ---------- q-pro-1: 条件に合うデータを先頭から順に取り出す ---------- */

const P1_VALUES = [80, 45, 70, 55, 90, 60, 65]

export function ProFig1() {
  const max = P1_VALUES.length
  const player = useStepPlayer(max + 1, 1200)
  const { step: k } = player
  const taken = P1_VALUES.slice(0, k).filter((v) => v >= 65)

  const states = P1_VALUES.map((v, i) => {
    if (i >= k) return undefined
    return v >= 65 ? ('ok' as const) : ('muted' as const)
  })
  const marks = P1_VALUES.map((_, i) => (i < k ? '✓' : undefined))

  return (
    <FigureFrame
      title="図解: 先頭から1つずつ調べて条件に合うものを取り出す"
      status={
        k === 0
          ? '「次へ」で1つずつ調べる。条件は「65以上」。'
          : k >= max
            ? `7個すべてを調べた。条件に合ったのは ${taken.length}個（${taken.join('・')}）。`
            : `${k}番目の ${P1_VALUES[k - 1]} を調べた → ${P1_VALUES[k - 1] >= 65 ? '65以上なので取り出す' : '条件外なので取り出さない'}。`
      }
      statusKind={k >= max ? 'ok' : 'plain'}
      step={k}
      total={max + 1}
      playing={player.playing}
      onPrev={player.prev}
      onNext={player.next}
      onReset={player.reset}
      onPlayToggle={player.toggle}
    >
      <Canvas label="配列の値を先頭から順に調べる様子" interactive>
        <CellTrack
          values={P1_VALUES}
          states={states}
          marks={marks}
          current={k < max ? k : undefined}
          ariaLabel="調べる配列。左から順に65以上かを確認する"
        />
        <Readout
          items={[
            { k: '調べた数', v: `${k} / ${max}` },
            { k: '取り出した数', v: `${taken.length}個`, strong: taken.length > 0 },
            { k: '取り出した値', v: taken.length > 0 ? taken.join('・') : 'まだなし' },
          ]}
        />
      </Canvas>
      <Note>先頭から順に、1個ずつ条件（65以上か）を調べ、合うものだけを別の配列へ入れていく。これが「取り出す」手順。</Note>
    </FigureFrame>
  )
}

/* ---------- q-pro-2: 最大値を求める ---------- */

const P2_VALUES = [70, 85, 62, 90, 78]

export function ProFig2() {
  const [k, setK] = useState(0) /* 仮の最大値との比較をした回数 */
  const cur = Math.max(...P2_VALUES.slice(0, k + 1))
  const maxPos = P2_VALUES.indexOf(cur)
  const marks: Record<number, string> = { [maxPos]: '仮の最大値' }
  if (k > 0 && k !== maxPos) marks[k] = '調べている'
  return (
    <FigShell
      title="図解: 仮の最大値を、残りと順に比べて更新する"
      status={
        k === 0
          ? 'まず1つ目の値 70 を「仮の最大値」として置く。'
          : k >= 4
            ? `4回の比較が終わり、最大値は ${cur}。`
            : `次の値 ${P2_VALUES[k]} と仮の最大値 ${Math.max(...P2_VALUES.slice(0, k))} を比べる → ${P2_VALUES[k] > Math.max(...P2_VALUES.slice(0, k)) ? '大きいので仮の最大値を更新' : '仮の最大値のまま'}。`
      }
      statusKind={k >= 4 ? 'ok' : 'plain'}
    >
      <View label="配列の値と、仮の最大値が置かれている位置">
        <svg viewBox="0 0 320 106" className={styles.svg}>
          <GArrayRow x={20} y={14} values={P2_VALUES} cw={42} ch={26} marks={marks} />
          <GBox x={20} y={74} w={110} h={24} rx={6} text={`仮の最大値 = ${cur}`} fs={9.5} bold />
          <text x={150} y={90} fontSize={9.5} fill={MUTED}>
            比較した回数: {k}回
          </text>
        </svg>
      </View>
      <div className={styles.ctrl}>
        <Btn small onClick={() => setK(Math.min(4, k + 1))} disabled={k >= 4}>
          次へ ▶
        </Btn>
        <Btn small onClick={() => setK(Math.max(0, k - 1))} disabled={k <= 0}>
          ◀ 戻る
        </Btn>
        <Btn small onClick={() => setK(0)} disabled={k === 0}>
          リセット
        </Btn>
      </div>
      <Note>n個のデータの最大値を求めるとき、比較は n−1 回。90が出た時点で、その前の仮の最大値はもう要らない。</Note>
    </FigShell>
  )
}

/* ---------- q-pro-3: DNCL 繰り返し（合計と平均） ---------- */

const P3_LINES = dnclPrograms.find((p) => p.id === 'sum')?.lines ?? []
const P3_DISPLAY = [
  'total = 0',
  'i を 1 から 5 まで 1 ずつ増やしながら繰り返す:',
  '    total = total + i',
  'mean = total ÷ 5',
]
const P3_LINE_MAP = [0, 1, 2, 2, 3]

export function ProFig3() {
  return (
    <DnclStepper
      lines={P3_LINES}
      displayLines={P3_DISPLAY}
      lineMap={P3_LINE_MAP}
      label="total = total + i を、i=1から5まで5回くり返す"
    />
  )
}

/* ---------- q-pro-4: 条件分岐の動き（偶数を数える） ---------- */

const P4_LINES = dnclPrograms.find((p) => p.id === 'count-even')?.lines ?? []
const P4_DISPLAY = [
  'count = 0',
  'i を 1 から 6 まで 1 ずつ増やしながら繰り返す:',
  '    もし i % 2 = 0 ならば:',
  '        count = count + 1',
]
const P4_LINE_MAP = [0, 1, 2, 3, 3, 3]

export function ProFig4() {
  return (
    <DnclStepper
      lines={P4_LINES}
      displayLines={P4_DISPLAY}
      lineMap={P4_LINE_MAP}
      label="「もし 〜 ならば:」で偶数のときだけ count を増やす"
    />
  )
}

/* ---------- q-pro-5: 繰り返しと表示の順序 ---------- */

export function ProFig5() {
  const [k, setK] = useState(0) /* 表示が済んだ回数 */
  const shown = [1, 2, 3].slice(0, k)
  const shownMarks: Record<number, string> = {}
  shown.forEach((_, i) => {
    shownMarks[i] = '表示済み'
  })
  return (
    <FigShell
      title="図解: 繰り返しの中で「表示する」が実行される順"
      status={
        k === 0
          ? '「次へ」で1周ずつ。i は 1, 2, 3 と変わり、そのたびに 表示する i が実行される。'
          : `${k}回の表示が終わった。次の i は ${k + 1}（1〜3のときだけ表示）。`
      }
    >
      <View label="表示が済んだ値が並ぶ">
        <svg viewBox="0 0 320 96" className={styles.svg}>
          <GArrayRow
            x={20}
            y={14}
            values={shown.length > 0 ? shown : ['—']}
            marks={shownMarks}
            cw={40}
          />
          <text x={20} y={84} fontSize={10} fill={MUTED}>
            {k >= 3 ? 'i が4になる前に範囲(〜3)で終わる → 4は表示されない' : `表示する i → ${(shown.join(' ') || '（まだ）')}`}
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
      <Note>繰り返しの範囲は「1から3まで」。3周して終わり（4周目は実行されない）。表示結果は 1 2 3。</Note>
    </FigShell>
  )
}

/* ---------- q-pro-6: 配列の添字は問題文の指定を確認 ---------- */

const P6_VALUES = ['りんご', 'みかん', 'ぶどう', 'なし', 'いちご']

export function ProFig6() {
  const [lang, setLang] = useState<'dncl' | 'other'>('other')
  const [sel, setSel] = useState(1) /* 1始まりの位置 */
  const shift = lang === 'other' ? 1 : 0
  return (
    <FigShell
      title="図解: 添字の始まりは、問題文の指定で変わる"
      status={`${lang === 'dncl' ? '1始まり（問題文で指定）' : '0始まり（指定なし）'}: ${sel}番目のデータ（${P6_VALUES[sel - 1]}）は a[${sel - shift}]。`}
    >
      <Segmented
        label="添字の付け方"
        value={lang}
        options={[
          { value: 'dncl' as const, label: '1始まり（指定あり）' },
          { value: 'other' as const, label: '0始まり（既定）' },
        ]}
        onChange={setLang}
      />
      <View label="配列のセルと添字（下の数字は位置、下段の式がその言語での添字）">
        <svg viewBox="0 0 320 92" className={styles.svg}>
          <GArrayRow x={20} y={14} values={P6_VALUES} cw={56} ch={26} marks={{ [sel - 1]: '選択中' }} />
          <text x={20} y={86} fontSize={10} fill={ACCENT} fontWeight={700}>
            {lang === 'dncl' ? `a[${sel}]` : `a[${sel - 1}]`}
            <tspan fill={MUTED} fontWeight={400}>{` ← 同じ ${sel}番目のセル`}</tspan>
          </text>
        </svg>
      </View>
      <div className={styles.ctrl}>
        <Btn small onClick={() => setSel((v) => (v % P6_VALUES.length) + 1)}>
          隣のセルへ ▶
        </Btn>
        <Btn small onClick={() => setSel(1)}>
          先頭のセルへ
        </Btn>
        <span className={styles.note}>
          {lang === 'dncl' ? '問題文で「1から始まる」と指定された場合' : '特に指定がない場合の共通テスト用プログラム表記は0始まり'}
        </span>
      </div>
      <Note>問題文で a[3] と書かれていたら、添字の指定を確認する。0始まりなら4番目、1始まりなら3番目のデータ。</Note>
    </FigShell>
  )
}

/* ---------- q-pro-7: 二次元配列 ---------- */

const P7_GRID = [
  [3, 8, 1, 6],
  [5, 2, 9, 4],
  [7, 0, 11, 12],
]

export function ProFig7() {
  const [sel, setSel] = useState<{ r: number; c: number }>({ r: 1, c: 1 })
  const cell = P7_GRID[sel.r][sel.c]
  return (
    <FigShell
      title="図解: a[行,列] の順に添字を書く"
      status={`選んだセルは a[${sel.r + 1},${sel.c + 1}] = ${cell}。1つ目の添字が「行」、2つ目が「列」。`}
    >
      <View label="3行4列の二次元配列。セルを選ぶと a[行,列] の値を示す">
        <svg viewBox="0 0 320 108" className={styles.svg}>
          {P7_GRID.map((row, r) => (
            <g key={r}>
              {row.map((_, c) => (
                <g key={c} onClick={() => setSel({ r, c })} style={{ cursor: 'pointer' }}>
                  <rect
                    x={28 + c * 62}
                    y={16 + r * 30}
                    width={58}
                    height={26}
                    rx={3}
                    fill={sel.r === r && sel.c === c ? ACCENT : TINT}
                    stroke={sel.r === r && sel.c === c ? ACCENT : BORDER}
                    strokeWidth={sel.r === r && sel.c === c ? 2 : 1}
                  />
                  <text x={57 + c * 62} y={34 + r * 30} fontSize={11} textAnchor="middle" fill={sel.r === r && sel.c === c ? '#fff' : MUTED} fontWeight={sel.r === r && sel.c === c ? 700 : 400}>
                    {P7_GRID[r][c]}
                  </text>
                </g>
              ))}
              <text x={16} y={34 + r * 30} fontSize={9} textAnchor="middle" fill={MUTED}>
                {r + 1}行
              </text>
            </g>
          ))}
          {P7_GRID[0].map((_, c) => (
            <text key={c} x={57 + c * 62} y={14} fontSize={9} textAnchor="middle" fill={MUTED}>
              {c + 1}列
            </text>
          ))}
          <text x={160} y={104} fontSize={9.5} textAnchor="middle" fill={MUTED}>
            a[{sel.r + 1},{sel.c + 1}]（選択中）
          </text>
        </svg>
      </View>
      <Note>二次元配列は表のデータに使いやすい。設問の「2行目2列目」は a[2,2]。</Note>
    </FigShell>
  )
}

/* ---------- q-pro-8: 逐次探索 ---------- */

const P8_VALUES = [34, 12, 88, 25, 47]
const P8_TARGET = 47

export function ProFig8() {
  const [k, setK] = useState(0) /* 調べた個数 */
  const found = k > 0 && P8_VALUES.some((v, i) => i < k && v === P8_TARGET)
  const marks: Record<number, string> = {}
  if (k > 0 && k <= P8_VALUES.length) {
    marks[k - 1] = found ? '一致!' : '比べた'
  }
  return (
    <FigShell
      title="図解: 並び替えられていなくても、先頭から順に調べる"
      status={
        k === 0
          ? `「次へ」で先頭から1つずつ調べる。探す値は ${P8_TARGET}。`
          : found
            ? `${k}個目の値 ${P8_VALUES[k - 1]} が一致 → 見つかるまでに ${k} 回の比較。`
            : `${k}個目 ${P8_VALUES[k - 1]} ≠ ${P8_TARGET} → 次へ進む。`
      }
      statusKind={found ? 'ok' : 'plain'}
    >
      <View label="先頭から順に値を比較する様子">
        <svg viewBox="0 0 320 84" className={styles.svg}>
          <GArrayRow x={18} y={14} values={P8_VALUES} cw={42} ch={26} marks={marks} />
          <text x={18} y={70} fontSize={9.5} fill={MUTED}>
            探す値: {P8_TARGET} ／ 比較した回数: {k}
          </text>
        </svg>
      </View>
      <div className={styles.ctrl}>
        <Btn small onClick={() => setK(Math.min(P8_VALUES.length, k + 1))} disabled={k >= P8_VALUES.length}>
          次へ ▶
        </Btn>
        <Btn small onClick={() => setK(Math.max(0, k - 1))} disabled={k <= 0}>
          ◀ 戻る
        </Btn>
        <Btn small onClick={() => setK(0)} disabled={k === 0}>
          リセット
        </Btn>
      </div>
      <Note>逐次探索（線形探索）は整列不要。平均で n/2 回、見つからなければ n 回の比較がかかる。</Note>
    </FigShell>
  )
}

/* ---------- q-pro-9: 二分探索 ---------- */

const P9_VALUES = [12, 25, 34, 47, 58, 66, 71, 88]

type BinFrame = { lo: number; hi: number; mid: number | null; note: string }

function buildBinaryPath(t: number): BinFrame[] {
  const frames: BinFrame[] = []
  let lo = 1
  let hi = P9_VALUES.length
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2)
    const v = P9_VALUES[mid - 1]
    if (v === t) {
      frames.push({ lo, hi, mid, note: `中央 a[${mid}] = ${v} → 一致！これまでの比較で範囲が半分ずつになった。` })
      break
    }
    if (v < t) {
      frames.push({ lo, hi, mid, note: `中央 a[${mid}] = ${v} < ${t} → この中央より前は対象外。範囲を後ろ半分にする。` })
      lo = mid + 1
    } else {
      frames.push({ lo, hi, mid, note: `中央 a[${mid}] = ${v} > ${t} → この中央より後ろは対象外。範囲を前半分にする。` })
      hi = mid - 1
    }
  }
  return frames
}

export function ProFig9() {
  const [target, setTarget] = useState(66)
  const path = useMemo(() => buildBinaryPath(target), [target])
  const [k, setK] = useState(0)
  const f = path[Math.min(k, path.length - 1)]
  const marks: Record<number, string> = {}
  for (let i = f.lo; i <= f.hi; i++) marks[i - 1] = marks[i - 1] ?? '範囲'
  if (f.mid != null) marks[f.mid - 1] = '中央'
  return (
    <FigShell
      title="図解: 中央を比べて、見る範囲を半分に"
      status={k === 0 ? '「次へ」で1比較ずつ進む。整列されている配列が前提。' : f.note}
      statusKind={f.mid != null && P9_VALUES[f.mid - 1] === target ? 'ok' : 'plain'}
    >
      <View label="見る範囲（上の線）と中央の位置">
        <svg viewBox="0 0 320 106" className={styles.svg}>
          {P9_VALUES.map((v, i) => (
            <g key={i}>
              <rect
                x={16 + i * 38}
                y={34}
                width={34}
                height={26}
                rx={3}
                fill={marks[i] === '中央' ? ACCENT : marks[i] === '範囲' ? TINT : 'var(--color-card)'}
                stroke={marks[i] ? ACCENT : BORDER}
                strokeWidth={marks[i] === '中央' ? 2 : 1}
              />
              <text x={33 + i * 38} y={52} fontSize={10.5} textAnchor="middle" fill={marks[i] === '中央' ? '#fff' : MUTED} fontWeight={marks[i] === '中央' ? 700 : 400}>
                {v}
              </text>
              <text x={33 + i * 38} y={72} fontSize={8.5} textAnchor="middle" fill={MUTED}>
                a[{i + 1}]
              </text>
            </g>
          ))}
          <path d={`M ${16 + (f.lo - 1) * 38} 26 L ${16 + (f.hi - 1) * 38 + 34} 26`} stroke={ACCENT} strokeWidth={2} />
          <text x={160} y={94} fontSize={9.5} textAnchor="middle" fill={MUTED}>
            今見る範囲: a[{f.lo}]〜a[{f.hi}]（残り{f.hi - f.lo + 1}個）
          </text>
        </svg>
      </View>
      <div className={styles.ctrl}>
        <Btn small onClick={() => setK(Math.min(path.length - 1, k + 1))} disabled={k >= path.length - 1}>
          次へ ▶
        </Btn>
        <Btn small onClick={() => setK(Math.max(0, k - 1))} disabled={k <= 0}>
          ◀ 戻る
        </Btn>
        <Btn small onClick={() => setK(0)} disabled={k === 0}>
          リセット
        </Btn>
        <span className={styles.note}>比較した回数: {k}</span>
      </div>
      <Segmented
        label="探す値"
        value={String(target)}
        options={[25, 47, 66, 71, 88].map((v) => ({ value: String(v), label: `${v}` }))}
        onChange={(v) => {
          setTarget(Number(v))
          setK(0)
        }}
      />
      <Note>二分探索は「整列済み」が条件。8個なら高々3回の比較で見つかる。</Note>
    </FigShell>
  )
}

/* ---------- q-pro-10: 選択法（1回目） ---------- */

const P10_A0 = [3, 1, 4, 1, 5]

type SortFrame = { arr: number[]; note: string; marks: Record<number, string> }

function buildSelectionPass(): SortFrame[] {
  const frames: SortFrame[] = []
  const arr = [...P10_A0]
  let m = 0
  frames.push({ arr: [...arr], note: 'この中から一番小さい値を探し、1番目へ入れ替える。', marks: { 0: '探し始め' } })
  for (let j = 1; j < arr.length; j++) {
    frames.push({
      arr: [...arr],
      note: `a[${j + 1}] = ${arr[j]} と、今の最小値 a[${m + 1}] = ${arr[m]} を比べる。`,
      marks: { [j]: '比べる', [m]: '最小か?' },
    })
    if (arr[j] < arr[m]) {
      m = j
      frames.push({
        arr: [...arr],
        note: `${arr[j]} のほうが小さい → 最小値の位置が a[${j + 1}] に更新。`,
        marks: { [j]: '最小か?' },
      })
    }
  }
  const tmp = arr[0]
  arr[0] = arr[m]
  arr[m] = tmp
  frames.push({
    arr: [...arr],
    note: m === 0 ? '最小値がすでに先頭 → 入れ替えなしで1回目終了。' : `最小値 ${arr[0]} を1番目と入れ替える → 1回目の結果: ${arr.join(' ')}`,
    marks: { 0: '確定', [m]: '確定' },
  })
  return frames
}

const P10_FRAMES = buildSelectionPass()

export function ProFig10() {
  const [k, setK] = useState(0)
  const f = P10_FRAMES[Math.min(k, P10_FRAMES.length - 1)]
  return (
    <FigShell
      title="図解: 一番小さいものを探して、先頭と入れ替える"
      status={k === 0 ? '「次へ」で1手ずつ。' : f.note}
    >
      <View label="選択法1回目の工程">
        <svg viewBox="0 0 320 84" className={styles.svg}>
          <GArrayRow x={22} y={14} values={f.arr} cw={44} ch={26} marks={f.marks} />
          <text x={22} y={72} fontSize={9.5} fill={MUTED}>
            {k === P10_FRAMES.length - 1 ? `1回目の結果: ${f.arr.join(' ')}` : `手順 ${k}/${P10_FRAMES.length - 1}`}
          </text>
        </svg>
      </View>
      <div className={styles.ctrl}>
        <Btn small onClick={() => setK(Math.min(P10_FRAMES.length - 1, k + 1))} disabled={k >= P10_FRAMES.length - 1}>
          次へ ▶
        </Btn>
        <Btn small onClick={() => setK(Math.max(0, k - 1))} disabled={k <= 0}>
          ◀ 戻る
        </Btn>
        <Btn small onClick={() => setK(0)} disabled={k === 0}>
          リセット
        </Btn>
      </div>
      <Note>1回目がやることは「最小値を選んで、それを先頭と入れ替える」だけ。それ以外の値は動かないので、結果は 1 3 4 1 5。</Note>
    </FigShell>
  )
}

/* ---------- q-pro-11: 挿入法 ---------- */

type InsFrame = { arr: number[]; note: string; marks: Record<number, string> }

const P11_FRAMES: InsFrame[] = [
  { arr: [3, 1, 4, 1, 5], note: '最初の並び。前から1つずつ「整列済み部分」へ正しい位置に入れ込む。', marks: { 0: '整列済み' } },
  { arr: [3, 1, 4, 1, 5], note: '2番目の 1 を、整列済みの 3 と比べる。1 < 3 なので後にずらす。', marks: { 0: '整列済み', 1: '比べる' } },
  { arr: [1, 3, 4, 1, 5], note: '1 を1番目に → ここまでの並び: 1 3 4 1 5。（1回目が終わった状態）', marks: { 0: '整列済み', 1: '整列済み' } },
  { arr: [1, 3, 4, 1, 5], note: '2回目: 3番目の 4 を、整列済みの 1 3 と比べる。4 > 3 なのでそのまま。', marks: { 0: '整列済み', 1: '整列済み', 2: '比べる' } },
  { arr: [1, 3, 4, 1, 5], note: '2回目が終わったときの並び: 1 3 4 1 5（設問の答え）', marks: { 0: '整列済み', 1: '整列済み', 2: '整列済み' } },
]

export function ProFig11() {
  const [k, setK] = useState(0)
  const f = P11_FRAMES[Math.min(k, P11_FRAMES.length - 1)]
  return (
    <FigShell title="図解: 整列済み部分に1つずつ割り込ませる" status={f.note}>
      <View label="挿入法の動き（緑のセルが整列済み部分）">
        <svg viewBox="0 0 320 84" className={styles.svg}>
          {f.arr.map((v, i) => (
            <g key={i}>
              <rect
                x={22 + i * 44}
                y={14}
                width={40}
                height={26}
                rx={3}
                fill={f.marks[i] === '整列済み' ? 'var(--color-success-tint)' : f.marks[i] ? TINT : 'var(--color-card)'}
                stroke={f.marks[i] === '整列済み' ? 'var(--color-success)' : f.marks[i] === '比べる' ? ACCENT : BORDER}
                strokeWidth={f.marks[i] ? 2 : 1}
              />
              <text x={42 + i * 44} y={32} fontSize={11} textAnchor="middle" fill={MUTED}>
                {v}
              </text>
            </g>
          ))}
          <text x={22} y={72} fontSize={9.5} fill={MUTED}>
            整列済み部分: {f.arr.slice(0, Object.values(f.marks).filter((m) => m === '整列済み').length).join(' ')}
          </text>
        </svg>
      </View>
      <div className={styles.ctrl}>
        <Btn small onClick={() => setK(Math.min(P11_FRAMES.length - 1, k + 1))} disabled={k >= P11_FRAMES.length - 1}>
          次へ ▶
        </Btn>
        <Btn small onClick={() => setK(Math.max(0, k - 1))} disabled={k <= 0}>
          ◀ 戻る
        </Btn>
        <Btn small onClick={() => setK(0)} disabled={k === 0}>
          リセット
        </Btn>
      </div>
      <Note>挿入法は「取り出した値より後ろの値をずらして、正しい位置へ入れ込む」方式。3番目の4は整列済みの1・3より大きいので、2回目では何も動かない。</Note>
    </FigShell>
  )
}

/* ---------- q-pro-12: 計算量 ---------- */

const P12_OPS = [
  { id: 'seq', label: '逐次探索 O(n)', count: (n: number) => n },
  { id: 'bin', label: '二分探索 O(log n)', count: (n: number) => Math.ceil(Math.log2(Math.max(2, n))) },
  { id: 'sel', label: '選択法 O(n²)', count: (n: number) => (n * (n - 1)) / 2 },
] as const

export function ProFig12() {
  const [op, setOp] = useState<'seq' | 'bin' | 'sel'>('seq')
  const [n, setN] = useState(100)
  const def = P12_OPS.find((v) => v.id === op)!
  const cnt = def.count(n)
  const fmt = (c: number) => (c >= 100 ? Math.round(c).toLocaleString() : String(Math.round(c * 10) / 10))
  return (
    <FigShell title="図解: nが増えたとき、手間がどう増えるか" status={`${def.label}: n=${n} のとき、おおよそ ${fmt(cnt)}回の規模。`}>
      <Segmented label="アルゴリズム" value={op} options={P12_OPS.map((v) => ({ value: v.id, label: v.label }))} onChange={setOp} />
      <Slider label="データの個数 n" value={n} min={10} max={1000} step={10} onChange={setN} />
      <View label={`n=${n} のときの、おおよその作業回数（対数目盛）`}>
        <svg viewBox="0 0 320 112" className={styles.svg}>
          {P12_OPS.map((d, i) => (
            <g key={d.id}>
              <text x={10} y={28 + i * 28} fontSize={9.5} fill={d.id === op ? LABEL : MUTED} fontWeight={d.id === op ? 700 : 400}>
                {d.label}
              </text>
              <rect
                x={128}
                y={18 + i * 28}
                width={Math.max(4, Math.min(148, (Math.log10(Math.max(1, d.count(n))) / 5) * 148))}
                height={16}
                rx={8}
                fill={d.id === op ? ACCENT : TINT}
                stroke={d.id === op ? ACCENT : BORDER}
              />
              <text x={284} y={30 + i * 28} fontSize={9} textAnchor="end" fill={d.id === op ? ACCENT : MUTED} fontWeight={d.id === op ? 700 : 400}>
                {fmt(d.count(n))}回
              </text>
            </g>
          ))}
          <line x1={128} y1={14} x2={128} y2={100} stroke={BORDER} />
          <text x={160} y={108} fontSize={9} textAnchor="middle" fill={MUTED}>
            棒の長さは対数目盛。nが10倍になっても、二分探索はわずか数回しか増えない
          </text>
        </svg>
      </View>
      <Note>O記法は「nが増えたときに、手間がおおよそどう増えるか」を表す。二分探索は比べるたびに範囲が半分になるので、2³=8 → 8個なら約3回。</Note>
    </FigShell>
  )
}

/* ---------- q-pro-13: 五大装置 ---------- */

const DEV5 = [
  { k: '入力装置', ex: 'キーボード・マウス' },
  { k: '記憶装置', ex: '主記憶（メモリ）と補助記憶（SSDなど）' },
  { k: '演算装置', ex: '計算・比較をするCPUの中心部' },
  { k: '制御装置', ex: 'プログラムの進行を管理するCPUの部分' },
  { k: '出力装置', ex: 'ディスプレイ・プリンタ' },
]

export function ProFig13() {
  const [sel, setSel] = useState(2)
  return (
    <FigShell title="図解: コンピュータは 5つの装置でできている" status={`${DEV5[sel].k} の役割: ${DEV5[sel].ex}`}>
      <View label="入力 → 記憶（演算・制御）→ 出力。四角を選ぶと役割がわかる">
        <svg viewBox="0 0 320 134" className={styles.svg}>
          <GBox x={10} y={56} w={62} h={30} text="入力装置" fs={9} bold={sel === 0} fill={sel === 0 ? ACCENT : TINT} ink={sel === 0 ? '#fff' : MUTED} />
          <GBox x={122} y={56} w={76} h={30} text="記憶装置" fs={9} bold={sel === 1} fill={sel === 1 ? ACCENT : TINT} ink={sel === 1 ? '#fff' : MUTED} />
          <GBox x={122} y={12} w={76} h={26} text="演算装置" fs={9} bold={sel === 2} fill={sel === 2 ? ACCENT : TINT} ink={sel === 2 ? '#fff' : MUTED} />
          <GBox x={122} y={100} w={76} h={26} text="制御装置" fs={9} bold={sel === 3} fill={sel === 3 ? ACCENT : TINT} ink={sel === 3 ? '#fff' : MUTED} />
          <GBox x={248} y={56} w={62} h={30} text="出力装置" fs={9} bold={sel === 4} fill={sel === 4 ? ACCENT : TINT} ink={sel === 4 ? '#fff' : MUTED} />
          <GArrow x1={74} y1={71} x2={120} y2={71} stroke={MUTED} />
          <GArrow x1={194} y1={71} x2={246} y2={71} stroke={MUTED} />
          <GArrow x1={160} y1={54} x2={160} y2={40} stroke={MUTED} />
          <GArrow x1={160} y1={88} x2={160} y2={98} stroke={MUTED} />
          {[
            { i: 0, cx: 41, cy: 71 },
            { i: 1, cx: 160, cy: 71 },
            { i: 2, cx: 160, cy: 25 },
            { i: 3, cx: 160, cy: 113 },
            { i: 4, cx: 279, cy: 71 },
          ].map((h) => (
            <circle key={h.i} cx={h.cx} cy={h.cy} r={19} fill="transparent" style={{ cursor: 'pointer' }} onClick={() => setSel(h.i)} />
          ))}
        </svg>
      </View>
      <Note>演算装置と制御装置を合わせたものがCPU。矢印はデータの流れを表す。情報システムの「5要素」とは別の概念。</Note>
    </FigShell>
  )
}

/* ---------- q-pro-14: AND回路 ---------- */

export function ProFig14() {
  const [a, setA] = useState(1)
  const [b, setB] = useState(0)
  const out = a & b
  const rows = [
    { a: 0, b: 0, y: 0 },
    { a: 0, b: 1, y: 0 },
    { a: 1, b: 0, y: 0 },
    { a: 1, b: 1, y: 1 },
  ]
  return (
    <FigShell
      title="図解: ANDは「両方1のときだけ1」"
      status={`入力 A=${a}・B=${b} → 出力 = ${out}。どちらか一方でも0なら出力は0。`}
    >
      <div className={styles.ctrl}>
        <Btn on={a === 1} ariaPressed={a === 1} onClick={() => setA((v) => (v === 1 ? 0 : 1))}>
          A = {a}
        </Btn>
        <Btn on={b === 1} ariaPressed={b === 1} onClick={() => setB((v) => (v === 1 ? 0 : 1))}>
          B = {b}
        </Btn>
      </div>
      <View label="ANDゲートと真理値表">
        <svg viewBox="0 0 320 96" className={styles.svg}>
          <GCircle cx={40} cy={22} r={13} text={a ? '1' : '0'} fs={11} fill={a ? ACCENT : TINT} ink={a ? '#fff' : MUTED} />
          <GCircle cx={40} cy={70} r={13} text={b ? '1' : '0'} fs={11} fill={b ? ACCENT : TINT} ink={b ? '#fff' : MUTED} />
          <path d="M 54 22 L 118 22 C 130 22 132 46 130 46" stroke={MUTED} fill="none" />
          <path d="M 54 70 L 118 70 C 130 70 132 46 130 46" stroke={MUTED} fill="none" />
          <GBox x={130} y={32} w={70} h={28} text="AND" fs={11} bold fill={ACCENT} ink="#fff" />
          <path d="M 200 46 L 232 46" stroke={out ? 'var(--color-success)' : MUTED} />
          <GCircle cx={252} cy={46} r={16} text={out ? '1' : '0'} fs={12} fill={out ? 'var(--color-success)' : TINT} ink={out ? '#fff' : MUTED} />
        </svg>
      </View>
      <table className={styles.tbl}>
        <thead>
          <tr>
            <th>A</th>
            <th>B</th>
            <th>A AND B</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const hit = r.a === a && r.b === b
            return (
              <tr key={i} className={hit ? styles.cellHit : undefined}>
                <td>{r.a}</td>
                <td>{r.b}</td>
                <td className={r.y === 1 ? styles.statusOk : undefined}>{r.y}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <Note>A=1・B=0 のとき、ANDの出力は 0（真理値表の3行目）。「両方1のときだけ1」で、OR・XORとは結果が違う。</Note>
    </FigShell>
  )
}

/* ---------- q-pro-15: 関数（部品として使う） ---------- */

export function ProFig15() {
  const [x, setX] = useState(3)
  const [calls, setCalls] = useState<{ x: number; r: number }[]>([])
  return (
    <FigShell
      title="図解: 関数は「入力 → 処理 → 戻り値」の部品"
      status={calls.length > 0 ? `f(${calls[calls.length - 1].x}) → ${calls[calls.length - 1].r}。同じ書き方で何度も使える。` : 'x を選んで「f(x)を呼ぶ」。f(v) = v×2+1。'}
    >
      <div className={styles.ctrl}>
        {[3, 5, 10, 21].map((v) => (
          <Btn key={v} small on={x === v} onClick={() => setX(v)}>
            x={v}
          </Btn>
        ))}
        <Btn small onClick={() => setCalls((c) => [...c, { x, r: x * 2 + 1 }])}>
          f(x) を呼ぶ ▶
        </Btn>
      </div>
      <View label="関数 f に値を入れて、戻り値を受け取る流れ">
        <svg viewBox="0 0 320 92" className={styles.svg}>
          <GBox x={12} y={30} w={70} h={30} text={`x = ${x}`} fs={11} bold fill={TINT} />
          <GArrow x1={86} y1={45} x2={118} y2={45} />
          <GBox x={122} y={28} w={92} h={34} text="f:" fs={12} bold fill={ACCENT} ink="#fff" />
          <GArrow x1={218} y1={45} x2={250} y2={45} />
          <GBox x={252} y={30} w={60} h={30} text={calls.length > 0 ? `f(x)=${calls[calls.length - 1].r}` : 'f(x)'} fs={10.5} bold fill={TINT} />
          <text x={168} y={80} fontSize={8.5} textAnchor="middle" fill={MUTED}>
            呼び出しのたびに値（実引数）を渡し、処理の中身を書くのは一度だけでよい
          </text>
        </svg>
      </View>
      <div className={styles.ctrl} style={{ gap: 4 }}>
        {calls.slice(-3).map((c, i) => (
          <span key={i} className={styles.btn} style={{ minHeight: 0, padding: '4px 10px', cursor: 'default' }}>
            f({c.x}) → <b>{c.r}</b>
          </span>
        ))}
      </div>
      <Note>関数は同じ処理をまとめて名前を付けて部品にしたもの。呼び出すたびに独立して計算する。</Note>
    </FigShell>
  )
}

/* =========================================================
 * 待ち行列シミュレーション（q-pro-16 / q-pro-17 共通の乱数エンジン）
 * ========================================================= */

/** 疑似乱数（シードごとに決まった列を出す）。seed が同じなら同じ形，多数回試すと分布が安定する */
function makeRng(seed: number): () => number {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

type SimRes = { waits: number[]; maxWait: number; meanWait: number }

/** 8人の客が来店し、先頭の客の対応時間を serviceMin として待ち時間を記録していく */
function simulateLine(seed: number, serviceMin: number): SimRes {
  const rng = makeRng(seed + 7)
  let arrive = 0
  let finish = -1
  const waits: number[] = []
  for (let i = 0; i < 8; i++) {
    if (i > 0) arrive += 2 + Math.floor(rng() * 5) /* 客の間隔は2〜6分（乱数） */
    const start = Math.max(arrive, finish)
    waits.push(start - arrive)
    finish = start + serviceMin
  }
  const maxWait = Math.max(...waits)
  return { waits, maxWait, meanWait: waits.reduce((a, b) => a + b, 0) / waits.length }
}

/* ---------- q-pro-16: 乱数を多数回使う理由 ---------- */

export function ProFig16() {
  const [seeds, setSeeds] = useState<number[]>([])
  const latest = seeds.length > 0 ? simulateLine(seeds[seeds.length - 1], 4) : null
  const hist = useMemo(() => {
    const m = new Map<number, number>()
    for (const s of seeds) {
      const r = simulateLine(s, 4)
      m.set(r.maxWait, (m.get(r.maxWait) ?? 0) + 1)
    }
    return m
  }, [seeds])
  const maxCount = Math.max(1, ...hist.values())
  return (
    <FigShell
      title="図解: たった1回 vs たくさんの回数"
      status={
        latest
          ? `最新の1回: 最長待ち ${latest.maxWait}分・平均 ${latest.meanWait.toFixed(1)}分。${seeds.length >= 100 ? '100回以上試したので傾向が見えてきた。' : '回数を重ねると結果の分布が安定してくる。'}`
          : '「1回試す」を押すと、乱数による来店パターンを1つ再現する。'
      }
    >
      <div className={styles.ctrl}>
        <Btn small onClick={() => setSeeds((s) => [...s, s.length + 1])}>
          1回試す
        </Btn>
        <Btn small onClick={() => setSeeds((s) => [...s, ...Array.from({ length: 100 }, (_, i) => s.length + i + 1)])}>
          100回追加
        </Btn>
        <Btn small onClick={() => setSeeds([])} disabled={seeds.length === 0}>
          リセット
        </Btn>
        <span className={styles.note}>試した回数: {seeds.length}</span>
      </div>
      <View label="乱数で出た「最長待ち」の分布">
        <svg viewBox="0 0 320 128" className={styles.svg}>
          <line x1={16} y1={96} x2={304} y2={96} stroke={BORDER} />
          {seeds.length > 0
            ? [0, 1, 2, 3, 4, 5, 6, 7].map((v) => {
                const c = hist.get(v) ?? 0
                return (
                  <g key={v}>
                    <rect x={24 + v * 34} y={96 - (c / maxCount) * 62} width={24} height={(c / maxCount) * 62} rx={3} fill={TINT} stroke={ACCENT} />
                    <text x={36 + v * 34} y={92 - (c / maxCount) * 62} fontSize={9} textAnchor="middle" fill={MUTED}>
                      {c === 0 ? '' : `${c}回`}
                    </text>
                    <text x={36 + v * 34} y={112} fontSize={8.5} textAnchor="middle" fill={MUTED}>
                      {v}分
                    </text>
                  </g>
                )
              })
            : [
                <g key="x">
                  <text x={160} y={64} fontSize={10} textAnchor="middle" fill={MUTED}>
                    まだ試していない。「1回試す」を押そう
                  </text>
                </g>,
              ]}
        </svg>
      </View>
      <Note>乱数を多数回使うと、たまたまの偏りに左右されず「よくある結果の広がり（分布）」がわかる。1回だけでは、その回の巡り合わせがそのまま結果になる。</Note>
    </FigShell>
  )
}

/* ---------- q-pro-17: 対応時間が変わったとき ---------- */

export function ProFig17() {
  const res = useMemo(
    () => ({
      s4: Array.from({ length: 100 }, (_, i) => simulateLine(i + 1, 4)),
      s3: Array.from({ length: 100 }, (_, i) => simulateLine(i + 1, 3)),
    }),
    [],
  )
  const avg = (rows: SimRes[]) => rows.reduce((a, r) => a + r.meanWait, 0) / rows.length
  const avgMax = (rows: SimRes[]) => rows.reduce((a, r) => a + r.maxWait, 0) / rows.length
  const histOf = (rows: SimRes[]) => {
    const m = new Map<number, number>()
    for (const r of rows) {
      const key = Math.round(r.meanWait)
      m.set(key, (m.get(key) ?? 0) + 1)
    }
    return m
  }
  const h4 = histOf(res.s4)
  const h3 = histOf(res.s3)
  const maxC = Math.max(1, ...h4.values(), ...h3.values())
  return (
    <FigShell
      title="図解: 対応時間を4分から3分に短くしてみる"
      status={`対応4分: 平均待ち ≈ ${avg(res.s4).toFixed(1)}分・最長待ちの平均 ≈ ${avgMax(res.s4).toFixed(1)}分 → 対応3分: 平均待ち ≈ ${avg(res.s3).toFixed(1)}分・最長待ちの平均 ≈ ${avgMax(res.s3).toFixed(1)}分。分布が左（待ち時間が短い）に寄る。`}
    >
      <View label="100回のシミュレーションで、平均待ち時間の分布を比べる">
        <svg viewBox="0 0 320 110" className={styles.svg}>
          <rect x={226} y={2} width={8} height={8} rx={2} fill={TINT} stroke={ACCENT} />
          <text x={238} y={9.5} fontSize={8} fill={MUTED}>
            4分
          </text>
          <rect x={262} y={2} width={8} height={8} rx={2} fill="var(--color-success-tint)" stroke="var(--color-success)" />
          <text x={274} y={9.5} fontSize={8} fill={MUTED}>
            3分
          </text>
          <line x1={12} y1={88} x2={308} y2={88} stroke={BORDER} />
          {[0, 1, 2, 3, 4, 5, 6].map((x) => (
            <g key={x}>
              <rect x={14 + x * 42} y={88 - ((h4.get(x) ?? 0) / maxC) * 66} width={15} height={((h4.get(x) ?? 0) / maxC) * 66} rx={2} fill={TINT} stroke={ACCENT} />
              <rect x={32 + x * 42} y={88 - ((h3.get(x) ?? 0) / maxC) * 66} width={15} height={((h3.get(x) ?? 0) / maxC) * 66} rx={2} fill="var(--color-success-tint)" stroke="var(--color-success)" />
              <text x={30 + x * 42} y={100} fontSize={8.5} textAnchor="middle" fill={MUTED}>
                {x}分
              </text>
            </g>
          ))}
        </svg>
      </View>
      <Note>対応時間は「1人を処理するのにかかる時間」。これが短くなると、1人目の処理が終わるまでに、後ろで並んで待つ人が減る。</Note>
    </FigShell>
  )
}

/* ---------- q-pro-18: アルゴリズムを表現する手段 ---------- */

const P18_CASES = ['chart', 'pseudo', 'dncl', 'book'] as const
type P18Kind = (typeof P18_CASES)[number]

export function ProFig18() {
  const [kind, setKind] = useState<P18Kind>('chart')
  const info: Record<P18Kind, { ok: boolean; title: string; body: string }> = {
    chart: { ok: true, title: 'フローチャート', body: '処理・判断・矢印で流れと分かれ道を示す。プログラムへ直しやすい。' },
    pseudo: { ok: true, title: '疑似言語', body: '日本語に近い文法で、処理の手順を文章のように表す。' },
    dncl: { ok: true, title: '共通テスト用プログラム表記', body: '共通テストで使われるプログラム表記。代入・繰り返し・条件分岐で手順を書く。' },
    book: { ok: false, title: '会計の帳簿', body: '金銭や工程の記録を整えるための表。手順（処理の流れ）を表すものではない。' },
  }
  const c = info[kind]
  return (
    <FigShell
      title="図解: アルゴリズムを表現する3つの道具と、表しにくいもの"
      status={`${c.title}: ${c.body}`}
      statusKind={c.ok ? 'ok' : 'ng'}
    >
      <Segmented
        label="表現の手段"
        value={kind}
        options={[
          { value: 'chart' as const, label: 'フローチャート' },
          { value: 'pseudo' as const, label: '疑似言語' },
          { value: 'dncl' as const, label: 'プログラム表記' },
          { value: 'book' as const, label: '会計の帳簿' },
        ]}
        onChange={setKind}
      />
      <View label={`${c.title} の様子${c.ok ? '（アルゴリズムを表せる）' : '（アルゴリズムを表しているとは言えない）'}`}>
        <svg viewBox="0 0 320 112" className={styles.svg}>
          {kind === 'chart' && (
            <>
              <GBox x={130} y={6} w={60} h={22} text="開始" fs={9} rx={11} />
              <GArrow x1={160} y1={30} x2={160} y2={40} />
              <GBox x={118} y={40} w={84} h={22} text="データを読む" fs={8.5} />
              <GArrow x1={160} y1={62} x2={160} y2={72} />
              <GDiamond cx={160} cy={84} w={72} h={28} text="条件?" />
              <GArrow x1={196} y1={84} x2={250} y2={84} />
              <text x={256} y={88} fontSize={9} fill={MUTED}>
                はい → 処理A
              </text>
            </>
          )}
          {kind === 'pseudo' && (
            <>
              <text x={26} y={26} fontSize={11} fill={LABEL} fontFamily="var(--font-mono)">
                手順:
              </text>
              <text x={40} y={50} fontSize={11} fill={LABEL} fontFamily="var(--font-mono)">
                1. データを読む
              </text>
              <text x={40} y={72} fontSize={11} fill={LABEL} fontFamily="var(--font-mono)">
                2. 条件を調べる
              </text>
              <text x={40} y={94} fontSize={11} fill={LABEL} fontFamily="var(--font-mono)">
                3. 結果を表示する
              </text>
            </>
          )}
          {kind === 'dncl' && (
            <>
              <text x={20} y={30} fontSize={9.5} fill={LABEL} fontFamily="var(--font-mono)">
                n を 1 から 5 まで 1 ずつ増やしながら繰り返す:
              </text>
              <text x={36} y={56} fontSize={10.5} fill={LABEL} fontFamily="var(--font-mono)">
                表示する(n)
              </text>
            </>
          )}
          {kind === 'book' && (
            <>
              <GBox x={24} y={10} w={272} h={66} text="" fill="var(--color-warning-tint)" stroke="var(--color-warning)" rx={6} />
              {['日付｜内容｜金額', '10月｜売上の記録｜△△円', '（処理の手順は書かれていない）'].map((t, i) => (
                <text key={i} x={38} y={32 + i * 18} fontSize={9.5} fill="var(--color-warning-ink)">
                  {t}
                </text>
              ))}
            </>
          )}
          <text x={160} y={108} fontSize={9.5} textAnchor="middle" fill={c.ok ? OKINK : NGINK} fontWeight={700}>
            {c.ok ? '→ 処理の手順を表せる（アルゴリズムの記述に向く）' : '→ 手順を表していない（記録の報告書）'}
          </text>
        </svg>
      </View>
      <Note>アルゴリズムとは「処理の手順の明確な表現」。フローチャート・疑似言語・共通テスト用プログラム表記・プログラム言語のどれでも書ける。</Note>
    </FigShell>
  )
}

export const PRO_FIGURES = {
  'q-pro-1': ProFig1,
  'q-pro-2': ProFig2,
  'q-pro-3': ProFig3,
  'q-pro-4': ProFig4,
  'q-pro-5': ProFig5,
  'q-pro-6': ProFig6,
  'q-pro-7': ProFig7,
  'q-pro-8': ProFig8,
  'q-pro-9': ProFig9,
  'q-pro-10': ProFig10,
  'q-pro-11': ProFig11,
  'q-pro-12': ProFig12,
  'q-pro-13': ProFig13,
  'q-pro-14': ProFig14,
  'q-pro-15': ProFig15,
  'q-pro-16': ProFig16,
  'q-pro-17': ProFig17,
  'q-pro-18': ProFig18,
} as const
