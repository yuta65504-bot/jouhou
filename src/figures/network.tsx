/**
 * ネットワーク（network, q-net-1〜18）: 問題ごとのインタラクティブ図解。
 */
import { useEffect, useState } from 'react'
import styles from './figures.module.css'
import { Segmented } from '@/components/Segmented'
import { useStepPlayer } from '@/lib/motion'
import {
  ACCENT,
  BORDER,
  LABEL,
  BitGrid,
  Calc,
  Canvas,
  CellTrack,
  FigShell,
  FigureFrame,
  MUTED,
  NGINK,
  Note,
  OKINK,
  TINT,
  View,
  Btn,
  Slider,
  GBox,
  GBitRow,
  GCircle,
  svgButton,
} from './parts'

/* ---------- q-net-1: 8ビットで表せる状態の数 ---------- */

export function NetFig1() {
  const [bits, setBits] = useState<(0 | 1)[]>([1, 0, 1, 1, 0, 0, 1, 0])
  const pattern = bits.reduce<number>((n, b) => n * 2 + b, 0)
  const toggle = (i: number) =>
    setBits((prev) => prev.map((b, j) => (j === i ? ((b ^ 1) as 0 | 1) : b)))
  return (
    <FigShell
      title="図解: 8個のオン・オフはいくつの並びを作れる？"
      status={`1ビット=2通り。8ビットは 2^8 = 256通りのうちの一つの並び（今の並びは 10進で ${pattern}）。`}
    >
      <Canvas label="クリックして切り替えられる8ビットの列" interactive>
        <svg viewBox="0 0 320 96" className={styles.svg}>
          <GBitRow x={86} y={18} bits={bits} tag="ビット" />
          {bits.map((_, i) => (
            <rect
              key={i}
              x={82 + i * 22}
              y={14}
              width={26}
              height={26}
              fill="transparent"
              {...svgButton(`${i + 1}番目のビット ${bits[i]}。押すと反転`, () => toggle(i), bits[i] === 1)}
            />
          ))}
          <text x={160} y={72} fontSize={12} textAnchor="middle" fill={LABEL} fontWeight={700}>
            並べ方の数: 2の8乗 = 256通り
          </text>
          <text x={160} y={90} fontSize={11} textAnchor="middle" fill={MUTED}>
            どの1つを今の並びとして選んでも、全体では256通り
          </text>
        </svg>
      </Canvas>
      <div className={styles.ctrl}>
        <Btn small onClick={() => setBits([0, 0, 0, 0, 0, 0, 0, 0])}>
          全部0
        </Btn>
        <Btn small onClick={() => setBits([1, 1, 1, 1, 1, 1, 1, 1])}>
          全部1
        </Btn>
        <Btn small onClick={() => setBits((prev) => [...prev].reverse())}>
          左右を反転
        </Btn>
        <span className={styles.note}>ビットをクリックして 0/1 を切り替える</span>
      </div>
      <Note>選択肢の16/128/512 は 2^4・2^7・2^9 で、ビット数が異なる誤り。</Note>
    </FigShell>
  )
}

/* ---------- q-net-2: DNS ---------- */

export function NetFig2() {
  const player = useStepPlayer(3, 1200)
  const { step } = player
  const status =
    step === 0
      ? '「次へ」で、ブラウザからDNSサーバへ問い合わせる。'
      : step === 1
        ? 'DNSサーバが、ドメイン名に対応するIPアドレスを探している。'
        : '203.0.113.5 が返った。以降はこの番号で接続する。'
  return (
    <FigureFrame
      title="図解: 名前を番号に繋げる仕組み（DNS）"
      status={status}
      statusKind={step >= 2 ? 'ok' : 'plain'}
      step={step}
      total={3}
      playing={player.playing}
      onPrev={player.prev}
      onNext={player.next}
      onReset={player.reset}
      onPlayToggle={player.toggle}
    >
      <Canvas label="ブラウザがDNSサーバに問い合わせ、IPアドレスを受け取る流れ" interactive>
        <svg viewBox="0 0 320 164" className={styles.svg}>
          <GBox x={10} y={34} w={82} h={34} text="ブラウザ" fs={14} />
          <GBox
            x={120}
            y={4}
            w={86}
            h={28}
            text="example.jp"
            fs={13}
            fill="var(--color-warning-tint)"
            stroke="var(--color-warning)"
            ink="var(--color-warning-ink)"
          />
          <line x1={163} y1={32} x2={163} y2={51} stroke={BORDER} strokeDasharray="2 2" />
          <g className={step === 1 ? styles.popSvg : undefined}>
            <GCircle cx={258} cy={51} r={21} text="DNS" fs={12} />
          </g>

          {step >= 1 && (
            <>
              <path d="M 94 51 L 234 51" pathLength={1} stroke={ACCENT} strokeWidth={2} className={styles.draw} />
              <path d="M 234 46 L 242 51 L 234 56 Z" fill={ACCENT} className={styles.fadeIn} />
            </>
          )}
          <text x={160} y={70} fontSize={13} textAnchor="middle" fill={MUTED}>
            問い合わせ
          </text>

          {step >= 2 && (
            <>
              <path
                d="M 246 66 C 230 102 160 108 84 108"
                pathLength={1}
                fill="none"
                stroke={ACCENT}
                strokeWidth={2}
                className={styles.draw}
              />
              <path d="M 78 104 L 84 112 L 90 104 Z" fill={ACCENT} className={styles.fadeIn} />
              <g className={styles.reveal}>
                <GBox
                  x={16}
                  y={112}
                  w={160}
                  h={28}
                  text="203.0.113.5"
                  fs={14}
                  rx={8}
                  fill="var(--color-success-tint)"
                  stroke="var(--color-success)"
                  ink={OKINK}
                  bold
                />
              </g>
              <text x={196} y={132} fontSize={13} fill={OKINK} fontWeight={700}>
                対応づけを返す
              </text>
            </>
          )}

          <text x={160} y={158} fontSize={13} textAnchor="middle" fill={MUTED}>
            ドメイン名（名前） → IPアドレス（番号）
          </text>
        </svg>
      </Canvas>
      <Note>DNSは名前→番号の対応づけ。IPの自動割当はDHCP、ファイル転送はFTP、メール送信はSMTP。</Note>
    </FigureFrame>
  )
}

/* ---------- q-net-3: 2進数→10進数 ---------- */

export function NetFig3() {
  const [bits, setBits] = useState<(0 | 1)[]>([1, 0, 1, 1, 0, 1, 0])
  const weights = [64, 32, 16, 8, 4, 2, 1]
  const sum = bits.reduce<number>((n, b, i) => n + b * weights[i], 0)
  const terms = bits.map((b, i) => (b ? weights[i] : 0)).filter((v) => v > 0)
  const ok = sum === 90
  return (
    <FigShell
      title="図解: 各桁の重みを足していく"
      status={ok ? `1×64 + 1×16 + 1×8 + 1×2 = 90 ✓（= 1011010）` : `今の並び 1011010 を変えると値は ${sum}。90になる並びを探そう。`}
      statusKind={ok ? 'ok' : 'plain'}
    >
      <Canvas label="2進数の7桁と、その各桁の重み" interactive>
        <svg viewBox="0 0 320 100" className={styles.svg}>
          <GBitRow x={90} y={14} bits={bits} />
          {bits.map((_, i) => (
            <rect
              key={i}
              x={86 + i * 22}
              y={10}
              width={26}
              height={26}
              fill="transparent"
              {...svgButton(`${i + 1}桁目 ${bits[i]}。押すと反転`, () => setBits((prev) => prev.map((b, j) => (j === i ? ((b ^ 1) as 0 | 1) : b))), bits[i] === 1)}
            />
          ))}
          {weights.map((w, i) => (
            <text key={w} x={99 + i * 22} y={62} fontSize={11} textAnchor="middle" fill={MUTED}>
              {w}
            </text>
          ))}
          <text x={160} y={86} fontSize={12} textAnchor="middle" fill={LABEL} fontWeight={700}>
            {terms.join(' + ') || '0'} = {sum}
          </text>
        </svg>
      </Canvas>
      <div className={styles.ctrl}>
        <Btn small onClick={() => setBits([1, 0, 1, 1, 0, 1, 0])}>
          元の並びに戻す
        </Btn>
        <span className={styles.note}>桁の重みは左から 64・32・16・8・4・2・1（2倍ずつ）。</span>
      </div>
    </FigShell>
  )
}

/* ---------- q-net-4: 10進→16進 ---------- */

export function NetFig4() {
  const [n, setN] = useState(90)
  const hi = Math.floor(n / 16)
  const lo = n % 16
  const hex = `${hi.toString(16).toUpperCase()}${lo.toString(16).toUpperCase()}`
  const is90 = n === 90
  return (
    <FigShell
      title="図解: 16で割ったときの「分量」と「余り」が桁になる"
      status={is90 ? '90 = 5×16 + 10 → 16進では 5A ✓' : `${n} = ${hi}×16 + ${lo}（16進 ${hex}）`}
      statusKind={is90 ? 'ok' : 'plain'}
    >
      <View label={`${n}を16進数に直す計算の様子`}>
        <svg viewBox="0 0 320 118" className={styles.svg}>
          <GBox x={20} y={20} w={94} h={30} text={`${n} ÷ 16`} fs={12} />
          <GBox x={122} y={20} w={62} h={30} text={`商 ${hi}`} fs={11} />
          <GBox x={196} y={20} w={86} h={30} text={`余り ${lo}`} fs={11} />
          <text x={160} y={78} fontSize={13} textAnchor="middle" fill={MUTED}>
            商が上の桁、余りが下の桁
          </text>
          <GBox x={110} y={88} w={100} h={26} text={is90 ? '90 → 5A' : `${n} → ${hex}`} fs={12} bold rx={10} fill={ACCENT} ink="#fff" />
        </svg>
      </View>
      <Calc
        parts={[
          { k: '16で割った商', v: `${hi}`, strong: true },
          { k: '余り', v: `${lo}`, strong: true },
          { k: '16進数', v: hex, strong: is90 },
        ]}
      />
      <Slider label="10進数の値" value={n} min={0} max={255} onChange={setN} />
      <Note>10〜15は A・B・C・D・E・F で表す。1桁で4ビット（0〜15）が入る。</Note>
    </FigShell>
  )
}

/* ---------- q-net-5: AND / OR / XOR ---------- */

export function NetFig5() {
  const [a, setA] = useState<(0 | 1)[]>([1, 0, 1, 0, 1, 1, 0, 0])
  const [b, setB] = useState<(0 | 1)[]>([1, 1, 0, 0, 1, 1, 1, 1])
  const [op, setOp] = useState<'and' | 'or' | 'xor'>('and')
  const r = a.map((v, i) => {
    if (op === 'and') return (v & b[i]) as 0 | 1
    if (op === 'or') return (v | b[i]) as 0 | 1
    return ((v ^ b[i]) as number) as 0 | 1
  })
  const flip = (row: 'a' | 'b', i: number) =>
    row === 'a' ? setA((p) => p.map((v, j) => (j === i ? ((v ^ 1) as 0 | 1) : v))) : setB((p) => p.map((v, j) => (j === i ? ((v ^ 1) as 0 | 1) : v)))
  const desc = op === 'and' ? '両方とも1の桁だけが1' : op === 'or' ? 'どちらか一方でも1なら1' : '入力が違う桁だけが1'
  return (
    <FigShell title="図解: ビットごとの論理演算" status={`${op === 'and' ? 'AND' : op === 'or' ? 'OR' : 'XOR'}: ${desc} → 結果は ${r.join('')}。`}>
      <Canvas label="2つの8ビット列と演算結果" interactive>
        <svg viewBox="0 0 320 108" className={styles.svg}>
          <GBitRow x={100} y={8} bits={a} tag="A" />
          <GBitRow x={100} y={34} bits={b} tag="B" />
          <GBitRow x={100} y={70} bits={r} tag="結果" />
          {a.map((_, i) => (
            <rect
              key={`ra${i}`}
              x={96 + i * 22}
              y={4}
              width={26}
              height={26}
              fill="transparent"
              {...svgButton(`Aの${i + 1}ビット目 ${a[i]}。押すと反転`, () => flip('a', i), a[i] === 1)}
            />
          ))}
          {b.map((_, i) => (
            <rect
              key={`rb${i}`}
              x={96 + i * 22}
              y={30}
              width={26}
              height={26}
              fill="transparent"
              {...svgButton(`Bの${i + 1}ビット目 ${b[i]}。押すと反転`, () => flip('b', i), b[i] === 1)}
            />
          ))}
        </svg>
      </Canvas>
      <Segmented
        label="演算の種類"
        value={op}
        options={[
          { value: 'and' as const, label: 'AND（かつ）' },
          { value: 'or' as const, label: 'OR（または）' },
          { value: 'xor' as const, label: 'XOR（排他）' },
        ]}
        onChange={setOp}
      />
    </FigShell>
  )
}

/* ---------- q-net-6: パリティ ---------- */

export function NetFig6() {
  const [data, setData] = useState<(0 | 1)[]>([1, 0, 1, 1, 0, 1, 0, 0])
  const [flipIdx, setFlipIdx] = useState<number | null>(null)
  const [pulse, setPulse] = useState<number | null>(null)
  const ones = data.reduce<number>((n, b) => n + b, 0)
  const parity = (ones % 2) as 0 | 1
  const received = flipIdx != null ? data.map((b, i) => (i === flipIdx ? ((b ^ 1) as 0 | 1) : b)) : data

  useEffect(() => {
    if (pulse == null) return
    const timer = window.setTimeout(() => setPulse(null), 260)
    return () => window.clearTimeout(timer)
  }, [pulse])

  const toggleBit = (i: number) => {
    setData((prev) => prev.map((b, j) => (j === i ? ((b ^ 1) as 0 | 1) : b)))
    setPulse(i)
  }

  return (
    <FigureFrame
      title="図解: 1の個数が偶数になるように1つ付ける"
      status={
        flipIdx == null
          ? `1の個数は${ones}個（${ones % 2 === 0 ? '偶数' : '奇数'}）。パリティ ${parity} を付けて ${[...data, parity].join('')} を送る。`
          : '1ビット反転 → 1の個数が奇数になり、誤りを検出できる（位置は分からない）。'
      }
      statusKind={flipIdx != null ? 'ng' : 'plain'}
    >
      <Canvas label="パリティビットを付けた9ビット列。データのビットは押して切り替えられる" interactive>
        <div className={styles.bitRows}>
          <BitGrid bits={data} label="データ（押して 0/1 を切替）" onToggle={toggleBit} pulseIndex={pulse} />
          <div className={styles.bitRow}>
            <span className={styles.cellTag}>送る列（9ビット目がパリティ）</span>
            <CellTrack
              values={[...data, parity]}
              compact
              wrap
              showIndex
              marks={[...Array(8).fill(undefined), 'P']}
              ariaLabel="送る列"
            />
          </div>
          {flipIdx != null && (
            <div className={styles.reveal}>
              <BitGrid bits={[...received, parity]} label="受信（誤りあり）" errorIndex={flipIdx} />
            </div>
          )}
        </div>
      </Canvas>
      <div className={styles.ctrl}>
        <Btn
          small
          onClick={() => {
            const inserting = flipIdx == null
            setFlipIdx(inserting ? 1 : null)
            setPulse(null)
          }}
        >
          {flipIdx == null ? '1ビットの誤りを入れてみる' : '誤りを取り除く'}
        </Btn>
        <Btn
          small
          onClick={() => {
            setFlipIdx(null)
            setPulse(null)
            setData([1, 0, 1, 1, 0, 1, 0, 0])
          }}
        >
          リセット
        </Btn>
      </div>
      <Note>2ビットが同時に反転すると1の個数が偶数のまま残るため、この方式では検出できない。</Note>
    </FigureFrame>
  )
}

/* ---------- q-net-7: データ量と転送時間 ---------- */

export function NetFig7() {
  const [mb, setMb] = useState(8)
  const [mbps, setMbps] = useState(2)
  const bits = mb * 1_000_000 * 8
  const sec = bits / (mbps * 1_000_000)
  return (
    <FigShell
      title="図解: ビット ÷ Mbpsで秒数が出る"
      status={`${mb}MB = ${(mb * 8).toLocaleString()}メガビット。÷ ${mbps}Mbps で ${sec.toLocaleString()} 秒。`}
    >
      <View label="データ量（ビット）と回線速度（Mbps）から転送時間を求める計算">
        <svg viewBox="0 0 320 92" className={styles.svg}>
          <GBox x={14} y={12} w={128} h={30} text={`データ: ${mb}MB`} fs={11} />
          <path d="M 148 27 L 168 27" stroke={MUTED} />
          <GBox x={174} y={12} w={128} h={30} text={`速度 ${mbps}Mbps`} fs={11} />
          <GBox x={96} y={54} w={128} h={26} text={`転送時間 ${sec.toLocaleString()} 秒`} fs={12} bold rx={10} fill={ACCENT} ink="#fff" />
        </svg>
      </View>
      <Calc
        parts={[
          { k: '1MB', v: '8メガビット' },
          { k: `${mb}MB`, v: `${(mb * 8).toLocaleString()}メガビット` },
          { k: `÷${mbps}Mbps`, v: `${sec.toLocaleString()}秒`, strong: true, ok: sec === 32 },
        ]}
      />
      <Slider label="データ量 [MB]" value={mb} min={1} max={100} step={1} onChange={setMb} />
      <Slider label="回線の速度 [Mbps]" value={mbps} min={1} max={100} step={1} onChange={setMbps} />
      <Note>bpsは「1秒あたり何ビット」。MBは8ビット=1バイト。8MB=8×10^6×8ビット＝6400万ビット→2Mbpsでは32秒。</Note>
    </FigShell>
  )
}

/* ---------- q-net-8: 実効速度 ---------- */

export function NetFig8() {
  const [maxMbps, setMax] = useState(100)
  const [pct, setPct] = useState(80)
  const [mb, setMb] = useState(50)
  const eff = Math.round(maxMbps * (pct / 100))
  const secEff = (mb * 8) / eff
  const secMax = (mb * 8) / maxMbps
  return (
    <FigShell
      title="図解: 計算に使うのは「実際に出る速度」"
      status={`最大${maxMbps}Mbpsだが実効${eff}Mbps → ${mb}MB ≈ ${secEff.toFixed(1)}秒（最大値で計算すると ${secMax.toFixed(1)}秒 と楽観的すぎる）。`}
    >
      <Slider label="回線の最大速度 [Mbps]" value={maxMbps} min={10} max={200} step={10} onChange={setMax} />
      <Slider label="実効率 [%]" value={pct} min={10} max={100} step={5} onChange={setPct} fmt={(v) => `${v}%（実効 ${Math.round((maxMbps * v) / 100)}Mbps）`} />
      <Slider label="ダウンロードのサイズ [MB]" value={mb} min={1} max={100} step={1} onChange={setMb} />
      <Calc
        parts={[
          { k: '実効速度', v: `${eff}Mbps`, strong: true },
          { k: `${mb}MB`, v: `${(mb * 8).toLocaleString()}メガビット` },
          { k: '時間', v: `${secEff.toFixed(1)}秒`, ok: Math.abs(secEff - 5) < 0.5 },
        ]}
      />
      <Note>「最大」と「実効」を混同しない。設問の5秒は 実効80Mbps で計算した値。</Note>
    </FigShell>
  )
}

/* ---------- q-net-9: プロトコルの対応 ---------- */

const PROTO_PAIRS = [
  { a: 'Webページの取得', b: 'HTTP', why: 'Webページの閲覧・取得は HTTP（暗号化つきが HTTPS）。' },
  { a: 'IPアドレスの割当て', b: 'DHCP', why: 'DHCPは、端末にIPアドレスを自動で割り当てる仕組み。' },
  { a: '名前からIPの対応づけ', b: 'DNS', why: 'ドメイン名→IPアドレスの名前解決は DNS の仕事。' },
  { a: 'メールの送信', b: 'SMTP', why: 'メールの送信は SMTP。受け取りは POP3・IMAP。' },
] as const

export function NetFig9() {
  const [pick, setPick] = useState(0)
  const p = PROTO_PAIRS[pick]
  return (
    <FigShell title="図解: 操作とプロトコルを線でつなぐ" status={p.why}>
      <Segmented
        label="操作とプロトコルの組合せ"
        value={String(pick)}
        options={PROTO_PAIRS.map((v, i) => ({ value: String(i), label: `${v.a} → ${v.b}` }))}
        onChange={(v) => setPick(Number(v))}
      />
      <View label={`${p.a} と ${p.b} を線でつないだ、正しい対応`}>
        <svg viewBox="0 0 320 86" className={styles.svg}>
          <GBox x={12} y={16} w={150} h={30} text={p.a} fs={11} />
          <GBox x={190} y={16} w={116} h={30} text={p.b} fs={12} bold fill="var(--color-success-tint)" stroke="var(--color-success)" ink={OKINK} />
          <path d="M 166 31 L 186 31" stroke="var(--color-success)" />
          <text x={160} y={74} fontSize={11} textAnchor="middle" fill={MUTED}>
            ほか: ファイル転送=FTP ／ 通信の基本ルール=TCP・IP
          </text>
        </svg>
      </View>
    </FigShell>
  )
}

/* ---------- q-net-10: サブネットマスクとホスト数 ---------- */

export function NetFig10() {
  const [host, setHost] = useState(8)
  const total = 2 ** host
  return (
    <FigShell
      title="図解: 0をホスト部としたビット数で、アドレスの数が決まる"
      status={`ホスト部 ${host}ビット → 2^${host} = ${total.toLocaleString()}個。端末に使えるのは、ネットワークとブロードキャスト用を除いた ${total - 2} 個。`}
    >
      <Slider label="ホスト部のビット数 [bit]" value={host} min={2} max={8} onChange={setHost} />
      <View label="ホスト部ビット数と、割り当てられるアドレス数">
        <svg viewBox="0 0 320 100" className={styles.svg}>
          <GBox x={8} y={18} w={112} h={30} text="192.168.1.0/24" fs={11} />
          <GBox x={126} y={18} w={62} h={30} text="+ 8ビット" fs={11} fill="var(--color-warning-tint)" stroke="var(--color-warning)" ink="var(--color-warning-ink)" />
          <GBox x={194} y={18} w={118} h={30} text="→ 0〜255 = 256個" fs={11} />
          <GBox x={84} y={62} w={152} h={28} rx={10} fill={host === 8 ? ACCENT : TINT} stroke={host === 8 ? ACCENT : BORDER} ink={host === 8 ? '#fff' : MUTED} text={host === 8 ? '最大数（設問の答え）= 256' : `${total} 個（ホスト部${host}bit）`} fs={11} bold />
        </svg>
      </View>
      <Calc
        parts={[
          { k: 'アドレス数', v: `${total}`, strong: host === 8 },
          { k: '端末に使える数', v: `${total - 2}` },
          { k: '−2の中身', v: 'ネットワーク & ブロードキャスト' },
        ]}
      />
      <Note>設問は「（ネットワーク・ブロードキャストを含まない）最大数」。254は「端末に割り当てられる数」なので、選択肢2とは別物。</Note>
    </FigShell>
  )
}

/* ---------- q-net-11: パケット ---------- */

export function NetFig11() {
  const [mode, setMode] = useState<'all' | 'packets'>('packets')
  const [broken, setBroken] = useState(false)
  const dims: number[] = [0, 1, 2, 3]
  const lost = broken ? 1 : -1
  return (
    <FigShell
      title="図解: 部分ごとに送ると、あとで何が戻る？"
      status={
        !broken
          ? mode === 'packets'
            ? 'パケットなら回線を複数人で共有しやすく、一部分が消滅したらその部分だけを再送できる。'
            : '一括では、途中で失われると送りなおしが大きくなる。'
          : mode === 'packets'
            ? '1つ欠けても、その1つのパケットだけを再送すればよい。'
            : '一括では、消えた部分も含めて、全体をもう一度送り直すことになる。'
      }
    >
      <Segmented label="送り方" value={mode} options={[{ value: 'packets' as const, label: '小分け（パケット）' }, { value: 'all' as const, label: '一括' }]} onChange={setMode} />
      <View label="データの送り方と、途中で一部が失われたときの再送範囲">
        <svg viewBox="0 0 320 122" className={styles.svg}>
          {mode === 'packets' ? (
            dims.map((i) => (
              <g key={i}>
                <rect
                  x={14 + i * 78}
                  y={26}
                  width={62}
                  height={34}
                  rx={5}
                  fill={i === lost ? 'var(--color-error-tint)' : TINT}
                  stroke={i === lost ? 'var(--color-error)' : ACCENT}
                />
                <text x={45 + i * 78} y={48} fontSize={11} textAnchor="middle" fill={i === lost ? NGINK : MUTED} fontWeight={i === lost ? 700 : 400}>
                  {i === lost ? `#${i + 1} 消失` : `#${i + 1}`}
                </text>
                <text x={45 + i * 78} y={74} fontSize={11} textAnchor="middle" fill={MUTED}>
                  宛先・
                </text>
                <text x={45 + i * 78} y={86} fontSize={11} textAnchor="middle" fill={MUTED}>
                  順番つき
                </text>
              </g>
            ))
          ) : (
            <>
              <rect x={14} y={38} width={292} height={34} rx={5} fill={broken ? 'var(--color-error-tint)' : TINT} stroke={broken ? 'var(--color-error)' : ACCENT} />
              <text x={160} y={60} fontSize={11} textAnchor="middle" fill={broken ? NGINK : MUTED} fontWeight={700}>
                {broken ? '一つの塊のまま、一部分が消えると全体を送り直し' : '一つの塊として送る'}
              </text>
            </>
          )}
          <text x={160} y={108} fontSize={11} textAnchor="middle" fill={LABEL} fontWeight={700}>
            {mode === 'packets' ? '複数人での共有・部分的な再送がしやすい' : '回線の共有がやりにくい'}
          </text>
        </svg>
      </View>
      <div className={styles.ctrl}>
        <Btn small on={broken} ariaPressed={broken} onClick={() => setBroken((v) => !v)}>
          途中で一部を失わせる
        </Btn>
        <Btn small onClick={() => setBroken(false)} disabled={!broken}>
          リセット
        </Btn>
        <span className={styles.note}>暗号化は別の機能（鍵を使う）。盗み見にくさとは直接の関係がない。</span>
      </div>
    </FigShell>
  )
}

/* ---------- q-net-12: 共通鍵・公開鍵 ---------- */

export function NetFig12() {
  const [kind, setKind] = useState<'common' | 'public'>('common')
  const common = kind === 'common'
  return (
    <FigShell
      title="図解: 鍵を誰が持つか"
      status={common ? '共通鍵方式: 暗号化と復号に同じ鍵。鍵を配る位置が問題になる。' : '公開鍵方式: 受信者の公開鍵で暗号化し、受信者の秘密鍵で復号。鍵の交換問題を避けられる（処理は重い）。'}
    >
      <Segmented
        label="暗号方式"
        value={kind}
        options={[
          { value: 'common' as const, label: '共通鍵（AESなど）' },
          { value: 'public' as const, label: '公開鍵（RSAなど）' },
        ]}
        onChange={setKind}
      />
      <View label="送信者・受信者の間での鍵の使い分け">
        <svg viewBox="0 0 320 118" className={styles.svg}>
          <GBox x={10} y={42} w={70} h={30} text="送信者" fs={11} />
          <GBox x={240} y={42} w={70} h={30} text="受信者" fs={11} />
          <path d="M 84 57 L 236 57" stroke={MUTED} strokeDasharray="5 3" />
          <text x={160} y={48} fontSize={11} textAnchor="middle" fill={MUTED}>
            暗号文 →
          </text>
          {common ? (
            <>
              <GCircle cx={104} cy={20} r={18} text="鍵" fs={11} fill="var(--color-warning)" ink="var(--color-warning-ink)" />
              <GCircle cx={216} cy={20} r={18} text="鍵" fs={11} fill="var(--color-warning)" ink="var(--color-warning-ink)" />
              <path d="M 122 20 L 198 20" stroke="var(--color-warning)" strokeDasharray="3 3" />
              <text x={160} y={94} fontSize={11} textAnchor="middle" fill={MUTED}>
                同じ鍵を、互いに持っておく。鍵を送る経路にも注意
              </text>
            </>
          ) : (
            <>
              <GCircle cx={104} cy={20} r={18} text="公開鍵" fs={11} fill={ACCENT} />
              <GCircle cx={216} cy={20} r={18} text="秘密鍵" fs={11} fill="var(--color-warning)" ink="var(--color-warning-ink)" />
              <path d="M 122 20 L 198 20" stroke={MUTED} strokeDasharray="2 4" />
              <text x={160} y={94} fontSize={11} textAnchor="middle" fill={MUTED}>
                公開鍵は配布してよい鍵。秘密鍵は受信者だけが持つ
              </text>
            </>
          )}
        </svg>
      </View>
      <Note>共通鍵方式は処理が軽いが「鍵をどう届けるか」が課題。公開鍵方式は「公開鍵で暗号化すると、秘密鍵でしか復号できない」ので鍵を安全に渡しやすいが、共通鍵より処理が重い。</Note>
    </FigShell>
  )
}

/* ---------- q-net-13: デジタル署名 ---------- */

export function NetFig13() {
  const [tamp, setTamp] = useState(false)
  const okSig = !tamp
  return (
    <FigShell
      title="図解: 秘密鍵で署名し、公開鍵で検証する"
      status={
        okSig
          ? '受信者は送信者の公開鍵で検証 → 一致 ✓ 本人が作った署名で、途中で改ざんされていない。'
          : '検証が一致しない ✕ 途中で改ざんされた（または別の秘密鍵で作られた）可能性がある。'
      }
      statusKind={okSig ? 'ok' : 'ng'}
    >
      <div className={styles.ctrl}>
        <Btn small on={!tamp} ariaPressed={!tamp} onClick={() => setTamp(false)}>
          そのまま届く
        </Btn>
        <Btn small on={tamp} ariaPressed={tamp} onClick={() => setTamp(true)}>
          途中で改ざん
        </Btn>
      </div>
      <View label="署名の作り方と検証の流れ">
        <svg viewBox="0 0 320 142" className={styles.svg}>
          {[
            { t: '① 送信者の秘密鍵で署名', y: 12 },
            { t: '② データ＋署名を送る', y: 46 },
            { t: '③ 受信者の公開鍵で検証', y: 80 },
          ].map((r, i) => (
            <g key={r.t}>
              <GBox x={26} y={r.y} w={268} h={28} rx={8} text={r.t} fs={11} bold={i === 2} fill={i === 2 ? (okSig ? 'var(--color-success-tint)' : 'var(--color-error-tint)') : TINT} stroke={i === 2 ? (okSig ? 'var(--color-success)' : 'var(--color-error)') : ACCENT} ink={i === 2 ? (okSig ? OKINK : NGINK) : LABEL} />
              {i < 2 && <path d={`M 160 ${r.y + 30} L 160 ${r.y + 32}`} stroke={MUTED} />}
            </g>
          ))}
          <text x={160} y={122} fontSize={11} textAnchor="middle" fill={MUTED}>
            通信中のデータを「読めなくする」のは
          </text>
          <text x={160} y={136} fontSize={11} textAnchor="middle" fill={MUTED}>
            SSL/TLSなど、別の仕組み
          </text>
        </svg>
      </View>
    </FigShell>
  )
}

/* ---------- q-net-14: 2要素認証 ---------- */

const AUTH_EL = ['知識（パスワード）', '所持（スマートフォン）', '生体（指紋・顔）'] as const

export function NetFig14() {
  const [used, setUsed] = useState<boolean[]>([true, true, false])
  const n = used.filter(Boolean).length
  const label = n === 0 ? '認証を通っていない' : n === 1 ? '1要素認証' : n === 2 ? '2要素認証 ✓（設問の仕組み）' : '3要素認証（多要素）'
  return (
    <FigShell
      title="図解: 要素の種類を組み合わせて数える"
      status={`${label}。同じ種類を2回（パスワードと秘密の質問など）組み合わせても2要素とは呼ばない。`}
    >
      <View label="認証の3種類の要素">
        <svg viewBox="0 0 320 102" className={styles.svg}>
          {AUTH_EL.map((t, i) => (
            <g key={t}>
              <rect x={6 + i * 104} y={8} width={100} height={50} rx={8} fill={used[i] ? ACCENT : TINT} stroke={used[i] ? ACCENT : BORDER} />
              <text x={56 + i * 104} y={29} fontSize={12} textAnchor="middle" fill={used[i] ? '#fff' : MUTED} fontWeight={700}>
                {t.slice(0, t.indexOf('（'))}
              </text>
              <text x={56 + i * 104} y={46} fontSize={11} textAnchor="middle" fill={used[i] ? '#fff' : MUTED} fontWeight={700}>
                {t.slice(t.indexOf('（'))}
              </text>
            </g>
          ))}
          <text x={160} y={88} fontSize={12} textAnchor="middle" fill={LABEL} fontWeight={700}>
            要素数 = {n}（異なる種類の数）
          </text>
        </svg>
      </View>
      {AUTH_EL.map((t, i) => (
        <div key={t} className={styles.ctrl}>
          <Btn on={used[i]} ariaPressed={used[i]} onClick={() => setUsed((prev) => prev.map((v, j) => (j === i ? !v : v)))}>
            {used[i] ? '使う' : '使わない'}
          </Btn>
          <span className={styles.status}>{t}</span>
        </div>
      ))}
      <Note>パスワード（知識）＋スマホに届く確認コード（所持）＝2要素認証。暗号方式は認証の種別ではない。</Note>
    </FigShell>
  )
}

/* ---------- q-net-15: 脅威の対応づけ ---------- */

const THREATS = [
  {
    id: 'phishing',
    name: 'フィッシング',
    desc: '正規そっくりの偽サイト・偽メールでID/パスワードを盗む',
    lines: ['正規そっくりの偽サイト・偽メールで', 'ID/パスワードを盗む'],
  },
  {
    id: 'dos',
    name: 'DoS攻撃',
    desc: '大量のリクエストを送り、サービスを応答不能にする',
    lines: ['大量のリクエストを送り、', 'サービスを応答不能にする'],
  },
  {
    id: 'mitm',
    name: '中間者攻撃',
    desc: '通信の途中で盗聴・改ざんする',
    lines: ['通信の途中で盗聴・改ざんする'],
  },
  {
    id: 'brute',
    name: '総当たり攻撃',
    desc: 'パスワードを辞書から一つずつ試して当てる',
    lines: ['パスワードを辞書から一つずつ', '試して当てる'],
  },
] as const

export function NetFig15() {
  const [pick, setPick] = useState<'phishing' | 'dos' | 'mitm' | 'brute'>('phishing')
  const t = THREATS.find((v) => v.id === pick)!
  return (
    <FigShell title="図解: 説明が正しいのはどれ？" status={`${t.name}: ${t.desc}`} statusKind={pick === 'phishing' ? 'ok' : 'ng'}>
      <Segmented
        label="脅威の説明の組合せ"
        value={pick}
        options={THREATS.map((v) => ({ value: v.id, label: `${v.name} ／ ${v.desc.slice(0, 8)}…` }))}
        onChange={setPick}
      />
      <View label="4つの脅威の主な説明の対照">
        <svg viewBox="0 0 320 168" className={styles.svg}>
          {THREATS.map((v, i) => (
            <g key={v.id}>
              <GBox
                x={8}
                y={8 + i * 40}
                w={76}
                h={30}
                text={v.name}
                fs={11}
                fill={v.id === pick ? (pick === 'phishing' ? ACCENT : TINT) : TINT}
                stroke={v.id === pick ? ACCENT : BORDER}
                ink={v.id === pick && pick === 'phishing' ? '#fff' : MUTED}
              />
              <text x={94} y={28 + i * 40} fontSize={11} fill={v.id === pick ? LABEL : MUTED} fontWeight={v.id === pick ? 700 : 400}>
                {v.lines.map((line, j) => (
                  <tspan key={line} x={94} dy={j === 0 ? 0 : 14}>
                    {line}
                  </tspan>
                ))}
              </text>
            </g>
          ))}
        </svg>
      </View>
      <Note>選択肢2〜4は「説明の名前」が入れ替わって別の脅威を挙げている。</Note>
    </FigShell>
  )
}

/* ---------- q-net-16: ファイアウォール ---------- */

export function NetFig16() {
  const [flow, setFlow] = useState(false)
  const packets = [
    { n: 1, pass: true },
    { n: 2, pass: false },
    { n: 3, pass: true },
    { n: 4, pass: false },
  ]
  return (
    <FigShell
      title="図解: 通信を検査して、規則に合うものだけ通す"
      status={flow ? '検査の結果、規則に合う通信だけが内部に通る。合わないものは遮断される。' : '「検査する」を押すと、外部から入ってくる通信が検査される。'}
    >
      <View label="外部からの4つの通信をファイアウォールで検査する様子">
        <svg viewBox="0 0 320 116" className={styles.svg}>
          <text x={14} y={16} fontSize={11} fill={MUTED}>
            外部からの通信
          </text>
          {packets.map((p, i) => (
            <g key={p.n}>
              <circle cx={32 + i * 84} cy={38} r={12} fill={TINT} stroke={BORDER} />
              <text x={32 + i * 84} y={42} fontSize={11} textAnchor="middle" fill={MUTED}>
                #{p.n}
              </text>
              <path
                d={`M ${32 + i * 84} 51 L ${32 + i * 84} 64`}
                stroke={flow ? (p.pass ? 'var(--color-success)' : 'var(--color-error)') : MUTED}
                strokeWidth={2}
                strokeDasharray={p.pass ? '0' : '3 2'}
                fill="none"
              />
            </g>
          ))}
          <GBox x={12} y={66} w={296} h={24} text="ファイアウォール（規則に合うか検査）" fs={11} fill={ACCENT} ink="#fff" bold />
          {flow ? (
            <text x={160} y={108} fontSize={11} textAnchor="middle">
              {packets.map((p) => (
                <tspan key={p.n} fill={p.pass ? 'var(--color-success-ink)' : 'var(--color-error-ink)'} fontWeight={700}>
                  {`#${p.n} ${p.pass ? '通す' : '遮断'}　`}
                </tspan>
              ))}
            </text>
          ) : (
            <text x={160} y={108} fontSize={11} textAnchor="middle" fill={MUTED}>
              通過の可否はここに出る
            </text>
          )}
        </svg>
      </View>
      <div className={styles.ctrl}>
        <Btn small on={flow} ariaPressed={flow} onClick={() => setFlow((v) => !v)}>
          {flow ? '検査をやめる' : '検査する'}
        </Btn>
        <span className={styles.note}>全通信を暗号化する・操作履歴を記録する・USB装置を排除する、はファイアウォールの役割ではない。</span>
      </div>
    </FigShell>
  )
}

/* ---------- q-net-17: プライベートIPとNAT ---------- */

export function NetFig17() {
  const [nat, setNat] = useState(true)
  return (
    <FigShell
      title="図解: 家の中の番号と、ネット側の番号"
      status={nat ? 'NAT（ルータの番号変換）により、プライベートIPのまま外部と通信できる。' : 'NATがないと、内部の番号が同じ他の家の番号と重なってしまう。'}
    >
      <View label="家庭内LANの端末がルータを通じて外部と通信する様子">
        <svg viewBox="0 0 320 120" className={styles.svg}>
          <GBox x={10} y={38} w={110} h={28} text="端末 192.168.1.10" fs={11} fill={TINT} />
          <GCircle cx={170} cy={52} r={20} text="ルータ" fs={11} fill={ACCENT} />
          <GBox x={226} y={38} w={88} h={28} text="インターネット" fs={11} fill="var(--color-warning-tint)" stroke="var(--color-warning)" ink="var(--color-warning-ink)" />
          <text x={270} y={30} fontSize={11} textAnchor="middle" fill={MUTED}>
            {nat ? '203.0.113.7' : '（変換なし）'}
          </text>
          <path d="M 124 52 L 148 52" stroke="var(--color-success)" />
          <path d="M 192 52 L 224 52" stroke={nat ? 'var(--color-success)' : 'var(--color-error)'} strokeDasharray={nat ? '' : '4 3'} />
          <text x={160} y={94} fontSize={11} textAnchor="middle" fill={MUTED}>
            192.168.x.x は「家庭内で重複してもよい内部用の番号」
          </text>
          <text x={160} y={110} fontSize={11} textAnchor="middle" fill={MUTED}>
            通信の暗号化・速度とは別の話
          </text>
        </svg>
      </View>
      <div className={styles.ctrl}>
        <Btn small on={nat} ariaPressed={nat} onClick={() => setNat((v) => !v)}>
          NAT {nat ? 'あり' : 'なし'}
        </Btn>
        <span className={styles.note}>家庭のLANは外部とつながっている。非公開になっているのは番号の種類の話。</span>
      </div>
    </FigShell>
  )
}

/* ---------- q-net-18: 無線LANの暗号化 ---------- */

const WIFI_CASES = {
  wpa2: { enc: true, label: 'WPA2以上（WPA3も）' },
  wep: { enc: false, label: '古いWEP' },
  none: { enc: false, label: '暗号化なし' },
} as const

export function NetFig18() {
  const [wifiCase, setCase] = useState<'wpa2' | 'wep' | 'none'>('wpa2')
  const c = WIFI_CASES[wifiCase]
  return (
    <FigShell
      title="図解: 空中を飛ぶ通信を、読めなくする"
      status={c.enc ? `${c.label}: 内容は暗号化され、盗み見されにくい。` : `${c.label}: 内容をそのまま読めてしまう。公衆Wi-Fiでは避けたい方式。`}
      statusKind={c.enc ? 'ok' : 'ng'}
    >
      <Segmented
        label="公衆Wi-Fiの暗号化方式"
        value={wifiCase}
        options={[
          { value: 'wpa2' as const, label: 'WPA2以上' },
          { value: 'wep' as const, label: 'WEP（古い）' },
          { value: 'none' as const, label: '暗号化なし' },
        ]}
        onChange={setCase}
      />
      <View label="無線の通信と、盗み見の結果">
        <svg viewBox="0 0 320 120" className={styles.svg}>
          <GBox x={14} y={20} w={92} h={28} text="スマホの通信" fs={11} />
          <path d="M 116 34 q 9 -9 18 0 q 9 9 18 0 q 9 -9 18 0 q 9 9 18 0 q 9 -9 18 0" stroke={MUTED} strokeWidth={1.5} fill="none" />
          <GBox x={220} y={20} w={88} h={28} text={c.enc ? '読めない文字列' : '生の本文'} fs={11} fill={c.enc ? TINT : 'var(--color-error-tint)'} stroke={c.enc ? ACCENT : 'var(--color-error)'} ink={c.enc ? MUTED : NGINK} />
          <text x={160} y={18} fontSize={11} textAnchor="middle" fill={MUTED}>
            覗き見する人
          </text>
          <text x={160} y={70} fontSize={12} textAnchor="middle" fill={c.enc ? OKINK : NGINK} fontWeight={700}>
            {c.enc ? '→ 読み取れない' : '→ 読み取れる'}
          </text>
          <text x={160} y={92} fontSize={11} textAnchor="middle" fill={MUTED}>
            無線は有線と違い、電波が届く場所では読める。
          </text>
          <text x={160} y={108} fontSize={11} textAnchor="middle" fill={MUTED}>
            暗号化は必須。
          </text>
        </svg>
      </View>
      <Note>SSIDが見えることと、通信内容が暗号化されていることは別。WEPは解読が容易とされる。</Note>
    </FigShell>
  )
}

export const NET_FIGURES = {
  'q-net-1': NetFig1,
  'q-net-2': NetFig2,
  'q-net-3': NetFig3,
  'q-net-4': NetFig4,
  'q-net-5': NetFig5,
  'q-net-6': NetFig6,
  'q-net-7': NetFig7,
  'q-net-8': NetFig8,
  'q-net-9': NetFig9,
  'q-net-10': NetFig10,
  'q-net-11': NetFig11,
  'q-net-12': NetFig12,
  'q-net-13': NetFig13,
  'q-net-14': NetFig14,
  'q-net-15': NetFig15,
  'q-net-16': NetFig16,
  'q-net-17': NetFig17,
  'q-net-18': NetFig18,
} as const
