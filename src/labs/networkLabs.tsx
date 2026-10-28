/**
 * ネットワークの実験（追加分）。ビット・ビット演算・転送時間・パスワード。
 */
import { useState } from 'react'
import { CheckIcon, CrossIcon } from '@/components/Icons'
import { Segmented } from '@/components/Segmented'
import { BitGrid, Btn, Canvas, FigureFrame, GBox, Note, Readout, Slider } from '@/figures/parts'
import fig from '@/figures/figures.module.css'
import {
  bitOp,
  bitsToValue,
  checksum,
  networkAddress,
  parityOk,
  passwordCombinations,
  subnetHosts,
  subnetMask,
  transferSeconds,
} from './sim'
import s from './labs.module.css'

/* ---------- ビット数と状態数 ---------- */

export function BitStatesLab() {
  const [bits, setBits] = useState(8)
  const states = 2 ** bits
  const cell = Math.min(24, 280 / bits)

  return (
    <FigureFrame
      badge="実験"
      title="ビットを増やすと、表せる状態はどう増える？"
      status={`${bits}ビットなら ${states.toLocaleString()}通り。1ビット増えるたびに、表せる状態は2倍になる。`}
    >
      <Slider label="ビット数" value={bits} min={1} max={12} onChange={setBits} fmt={(v) => `${v}bit`} />
      <Canvas label={`${bits}ビットで表せる状態の数`} interactive>
        <svg viewBox="0 0 320 92" className={fig.svg} role="img" aria-label={`${bits}ビットで${states}通り`}>
          {Array.from({ length: bits }, (_, i) => (
            <GBox
              key={i}
              x={16 + i * cell}
              y={20}
              w={cell - 3}
              h={28}
              text={i % 2 === 0 ? '0' : '1'}
              fs={12}
              fill={i % 2 === 0 ? 'var(--color-surface)' : 'var(--color-accent-tint)'}
              stroke={i % 2 === 0 ? 'var(--color-border)' : 'var(--color-accent)'}
            />
          ))}
          <text x={160} y={76} fontSize={15} textAnchor="middle" fill="var(--color-label)" fontWeight={700}>
            2^{bits} = {states.toLocaleString()}通り
          </text>
        </svg>
      </Canvas>
      <Readout
        items={[
          { k: 'ビット数', v: `${bits}bit` },
          { k: '表せる状態', v: `${states.toLocaleString()}通り`, strong: true },
          { k: '1つ増やすと', v: '状態は2倍' },
        ]}
      />
      <Note>0と1の2通りを並べるので、nビットで2のn乗通り。色の表現や文字コードも同じ考え方。</Note>
    </FigureFrame>
  )
}

/* ---------- 2進数から10進数 ---------- */

export function BinaryConvertLab() {
  const [bits, setBits] = useState<(0 | 1)[]>([1, 0, 1, 1, 0, 0, 1, 0])
  const value = bitsToValue(bits)
  const hex = value.toString(16).toUpperCase().padStart(2, '0')

  return (
    <FigureFrame
      badge="実験"
      title="ビットを押して、10進数に変えてみる"
      status={`2進数 ${bits.join('')} は、10進数で ${value}、16進数で ${hex}。`}
    >
      <BitGrid
        bits={bits}
        label="8ビット"
        onToggle={(index) => setBits((prev) => prev.map((b, i) => (i === index ? ((b ^ 1) as 0 | 1) : b)))}
      />
      <p className={s.valueList}>左から 128・64・32・16・8・4・2・1 の重み。押すと0と1が入れ替わる。</p>
      <Readout
        items={[
          { k: '2進数', v: bits.join('') },
          { k: '10進数', v: `${value}`, strong: true },
          { k: '16進数', v: hex },
        ]}
      />
      <Note>各ビットの重みを足すと10進数になる。1が立っている重みだけを合計する。</Note>
    </FigureFrame>
  )
}

/* ---------- ビット演算 ---------- */

export function BitOpsLab() {
  const [a, setA] = useState<(0 | 1)[]>([1, 0, 1, 0, 1, 1, 0, 0])
  const [b, setB] = useState<(0 | 1)[]>([1, 1, 0, 0, 1, 1, 1, 1])
  const [op, setOp] = useState<'and' | 'or' | 'xor'>('and')
  const result = bitOp(a, b, op)
  const opLabel = op === 'and' ? 'AND（両方1なら1）' : op === 'or' ? 'OR（どちらか1なら1）' : 'XOR（違うとき1）'

  const toggle = (set: (v: (0 | 1)[]) => void, row: (0 | 1)[]) => (index: number) =>
    set(row.map((bit, i) => (i === index ? ((bit ^ 1) as 0 | 1) : bit)))

  return (
    <FigureFrame badge="実験" title="2つのビット列を、演算で組み合わせる" status={`${opLabel}。結果は ${result.join('')}（10進数 ${bitsToValue(result)}）。`}>
      <Segmented
        label="ビット演算"
        value={op}
        options={[
          { value: 'and' as const, label: 'AND' },
          { value: 'or' as const, label: 'OR' },
          { value: 'xor' as const, label: 'XOR' },
        ]}
        onChange={setOp}
      />
      <BitGrid bits={a} label="A" onToggle={toggle(setA, a)} />
      <BitGrid bits={b} label="B" onToggle={toggle(setB, b)} />
      <BitGrid bits={result} label="結果" />
      <Readout
        items={[
          { k: 'A', v: `${bitsToValue(a)}` },
          { k: 'B', v: `${bitsToValue(b)}` },
          { k: '結果', v: `${bitsToValue(result)}`, strong: true },
        ]}
      />
      <Note>ビットごとに計算し、けた上がりはしない。マスク処理やフラグの管理で使われる。</Note>
    </FigureFrame>
  )
}

/* ---------- 転送時間 ---------- */

function duration(seconds: number): string {
  if (!Number.isFinite(seconds)) return '—'
  if (seconds < 60) return `${seconds.toFixed(seconds < 10 ? 1 : 0)}秒`
  const minutes = Math.floor(seconds / 60)
  const rest = Math.round(seconds % 60)
  return `${minutes}分${rest}秒`
}

export function TransferTimeLab() {
  const [size, setSize] = useState(100)
  const [speed, setSpeed] = useState(100)
  const seconds = transferSeconds(size, speed)

  return (
    <FigureFrame
      badge="実験"
      title="データ量と回線速度から、転送時間を出す"
      status={`${size}MBのデータを${speed}Mbpsで送ると、約${duration(seconds)}。`}
    >
      <Slider label="データ量 [MB]" value={size} min={1} max={1000} step={1} onChange={setSize} fmt={(v) => `${v}MB`} />
      <Slider label="回線速度 [Mbps]" value={speed} min={1} max={1000} step={1} onChange={setSpeed} fmt={(v) => `${v}Mbps`} />
      <Canvas label="転送時間の計算" interactive>
        <svg viewBox="0 0 320 88" className={fig.svg} role="img" aria-label={`${size}MBを${speed}Mbpsで送ると${duration(seconds)}`}>
          <GBox x={8} y={18} w={84} h={32} text={`${size}MB`} />
          <text x={101} y={39} fontSize={14} textAnchor="middle" fill="var(--color-secondary-label)">
            ÷
          </text>
          <GBox x={110} y={18} w={90} h={32} text={`${speed}Mbps`} />
          <text x={209} y={39} fontSize={14} textAnchor="middle" fill="var(--color-secondary-label)">
            =
          </text>
          <GBox x={218} y={18} w={94} h={32} text={duration(seconds)} fill="var(--color-accent-tint)" />
          <text x={160} y={74} fontSize={11} textAnchor="middle" fill="var(--color-secondary-label)">
            MB × 8 = Mbit にしてから、Mbpsで割る
          </text>
        </svg>
      </Canvas>
      <Readout
        items={[
          { k: 'データ量', v: `${size * 8}Mbit` },
          { k: '回線速度', v: `${speed}Mbps` },
          { k: '転送時間', v: duration(seconds), strong: true },
        ]}
      />
      <Note>実際はヘッダや待ち時間があるので、計算より少し長くなる。単位のMbitとMBを混ぜないこと。</Note>
    </FigureFrame>
  )
}

/* ---------- パスワードの組み合わせ ---------- */

const CHAR_SETS = [
  { id: 'lower', label: '小文字 a–z', size: 26 },
  { id: 'upper', label: '大文字 A–Z', size: 26 },
  { id: 'digit', label: '数字 0–9', size: 10 },
  { id: 'symbol', label: '記号 !@#$…', size: 32 },
]

function shortNumber(n: number): string {
  if (n >= 1e12) return n.toExponential(2)
  return Math.round(n).toLocaleString('ja-JP')
}

export function PasswordLab() {
  const [length, setLength] = useState(8)
  const [on, setOn] = useState<boolean[]>([true, false, true, false])
  const charset = CHAR_SETS.reduce((sum, set, i) => sum + (on[i] ? set.size : 0), 0)
  const combinations = passwordCombinations(length, charset)
  /* 1秒に10億回試す想定 */
  const years = combinations / 1e9 / (365 * 24 * 3600)
  const strong = years >= 100
  const meter = Math.min(100, (Math.log10(Math.max(1, combinations)) / 20) * 100)

  return (
    <FigureFrame
      badge="実験"
      title="文字の種類と長さで、破られにくさが変わる"
      status={
        charset === 0
          ? '文字の種類を1つ以上選んでください。'
          : `組み合わせは約${shortNumber(combinations)}通り。1秒に10億回試すと、全部試すのに約${
              years >= 1 ? shortNumber(years) + '年' : '1年未満'
            }。`
      }
      statusKind={charset === 0 ? 'plain' : strong ? 'ok' : 'ng'}
    >
      <div className={s.checks} role="group" aria-label="使う文字の種類">
        {CHAR_SETS.map((set, i) => (
          <button
            key={set.id}
            type="button"
            className={`${s.check} ${on[i] ? s.checkOn : ''}`}
            aria-pressed={on[i]}
            onClick={() => setOn((prev) => prev.map((v, j) => (j === i ? !v : v)))}
          >
            <span className={s.checkMark} aria-hidden="true">
              {on[i] ? <CheckIcon /> : <CrossIcon />}
            </span>
            <span>{set.label}</span>
          </button>
        ))}
      </div>
      <Slider label="パスワードの長さ" value={length} min={4} max={24} onChange={setLength} fmt={(v) => `${v}文字`} />
      <Canvas label="パスワードの強さの目安" interactive>
        <div className={s.meter} aria-hidden="true">
          <div className={`${s.meterFill} ${strong ? s.meterOk : s.meterNg}`} style={{ width: `${meter}%` }} />
        </div>
        <p className={s.valueList}>使える文字: {charset}種類 ／ 組み合わせ: {shortNumber(combinations)}通り</p>
      </Canvas>
      <Readout
        items={[
          { k: '文字の種類', v: `${charset}種類` },
          { k: '長さ', v: `${length}文字` },
          { k: '組み合わせ', v: `${shortNumber(combinations)}通り`, strong: true },
          { k: '全部試す時間', v: years >= 1 ? `約${shortNumber(years)}年` : '1年未満', ok: strong, ng: charset > 0 && !strong },
        ]}
      />
      <Note>長さを1文字増やすと、組み合わせは「文字の種類」倍になる。サービス側の試行回数制限も合わせて効く。</Note>
    </FigureFrame>
  )
}

/* ---------- プロトコルの層（追加30本） ---------- */

const PROTOCOL_OPTIONS = [
  { value: 'web', label: 'Web' },
  { value: 'mail', label: 'メール' },
  { value: 'ftp', label: 'ファイル転送' },
  { value: 'dns', label: '名前解決' },
] as const
type ProtocolId = (typeof PROTOCOL_OPTIONS)[number]['value']

const PROTOCOLS: Record<ProtocolId, { label: string; app: string; transport: string; port: string }> = {
  web: { label: 'Webページの閲覧', app: 'HTTPS', transport: 'TCP', port: '443' },
  mail: { label: 'メールの送信', app: 'SMTP', transport: 'TCP', port: '25' },
  ftp: { label: 'ファイルの転送', app: 'FTP', transport: 'TCP', port: '20/21' },
  dns: { label: 'ドメイン名の解決', app: 'DNS', transport: 'UDP', port: '53' },
}

export function ProtocolStackLab() {
  const [use, setUse] = useState<ProtocolId>('web')
  const info = PROTOCOLS[use]
  const layers = [info.app, info.transport, 'IP', 'Ethernet']

  return (
    <FigureFrame
      badge="実験"
      title="用途が変わると、どのプロトコルが使われる？"
      status={`${info.label}では、アプリ層に${info.app}、トランスポート層に${info.transport}を使う。ポート番号は${info.port}。`}
    >
      <Segmented label="やりたいこと" value={use} options={PROTOCOL_OPTIONS} onChange={setUse} />
      <Canvas label="プロトコルの4つの層" interactive>
        <svg viewBox="0 0 320 104" className={fig.svg} role="img" aria-label={`${info.label}のプロトコルは${layers.join('、')}`}>
          {layers.map((layer, i) => (
            <GBox
              key={layers[i]}
              x={12 + i * 75}
              y={20}
              w={70}
              h={34}
              text={layer}
              fill={i === 0 ? 'var(--color-accent-tint)' : 'var(--color-surface)'}
              stroke={i === 0 ? 'var(--color-accent)' : 'var(--color-border)'}
              fs={11}
              bold={i === 0}
            />
          ))}
          {['アプリ', 'トランスポート', 'インターネット', 'リンク'].map((name, i) => (
            <text key={name} x={47 + i * 75} y={82} fontSize={11} textAnchor="middle" fill="var(--color-secondary-label)">
              {name}
            </text>
          ))}
        </svg>
      </Canvas>
      <Readout
        items={[
          { k: '用途', v: info.label },
          { k: 'アプリ層', v: info.app, strong: true },
          { k: 'トランスポート層', v: info.transport },
          { k: 'ポート番号', v: info.port },
        ]}
      />
      <Note>通信はアプリ・トランスポート・インターネット・リンクの層に分かれる。用途ごとにアプリ層のプロトコルが変わる。</Note>
    </FigureFrame>
  )
}

/* ---------- 16進数 ---------- */

export function HexConvertLab() {
  const [value, setValue] = useState(171)
  const bits = Array.from({ length: 8 }, (_, i) => (((value >> (7 - i)) & 1) as 0 | 1))
  const hex = value.toString(16).toUpperCase().padStart(2, '0')

  return (
    <FigureFrame
      badge="実験"
      title="10進数を、16進数と2進数で表す"
      status={`${value} は 16進数で ${hex}、2進数で ${bits.join('')}。16進数の1桁は4ビットに対応する。`}
    >
      <Slider label="10進数の値" value={value} min={0} max={255} onChange={setValue} fmt={(v) => `${v}`} />
      <BitGrid bits={bits} label="2進数（8ビット）" />
      <Canvas label="16進数の桁と2進数の対応" interactive>
        <svg viewBox="0 0 320 86" className={fig.svg} role="img" aria-label={`${value}は16進数で${hex}`}>
          <GBox x={16} y={14} w={130} h={38} text={`10進数 ${value}`} fs={12} />
          <GBox x={174} y={14} w={130} h={38} text={`16進数 ${hex}`} fill="var(--color-accent-tint)" fs={12} bold />
          <text x={160} y={74} fontSize={11} textAnchor="middle" fill="var(--color-secondary-label)">
            16進数の1桁 = 4ビット（8・4・2・1の重み）
          </text>
        </svg>
      </Canvas>
      <Readout
        items={[
          { k: '10進数', v: `${value}` },
          { k: '16進数', v: hex, strong: true },
          { k: '2進数', v: bits.join('') },
        ]}
      />
      <Note>16進数の1桁は4ビット。2桁で8ビット（0〜255）を表せるので、2進数より短く書ける。</Note>
    </FigureFrame>
  )
}

/* ---------- パリティ検査 ---------- */

export function ParityCheckLab() {
  const [bits, setBits] = useState<(0 | 1)[]>([1, 0, 1, 1, 0, 0, 1, 0])
  const [mode, setMode] = useState<'even' | 'odd'>('even')
  const [corrupted, setCorrupted] = useState(false)
  const ones = bits.reduce<number>((sum, b) => sum + b, 0)
  const parity = mode === 'even' ? (ones % 2) : (ones % 2 === 0 ? 1 : 0)
  const sent: (0 | 1)[] = [...bits, parity as 0 | 1]
  const received = corrupted ? sent.map((b, i) => (i === 3 ? ((b ^ 1) as 0 | 1) : b)) : sent
  const ok = parityOk(received, mode)

  const toggle = (index: number) =>
    setBits((prev) => prev.map((b, i) => (i === index ? ((b ^ 1) as 0 | 1) : b)))

  return (
    <FigureFrame
      badge="実験"
      title="パリティで、1ビットの誤りを見つけられる？"
      status={
        corrupted
          ? `1ビット化けさせた。受信した9ビットの検査結果は「${ok ? '誤りなし' : '誤りを検出'}」。`
          : `送信する9ビットは ${sent.join('')}。パリティビットで1の個数を${mode === 'even' ? '偶数' : '奇数'}にそろえる。`
      }
      statusKind={ok ? 'ok' : 'ng'}
    >
      <Segmented
        label="パリティの方式"
        value={mode}
        options={[
          { value: 'even' as const, label: '偶数パリティ' },
          { value: 'odd' as const, label: '奇数パリティ' },
        ]}
        onChange={setMode}
      />
      <BitGrid bits={bits} label="データ8ビット" onToggle={toggle} />
      <BitGrid bits={received} label="受信した9ビット（末尾がパリティ）" />
      <div className={fig.ctrl}>
        <Btn on={corrupted} ariaPressed={corrupted} onClick={() => setCorrupted((v) => !v)}>
          1ビット化けさせる
        </Btn>
      </div>
      <Readout
        items={[
          { k: '1の個数（データ）', v: `${ones}個` },
          { k: 'パリティビット', v: `${parity}`, strong: true },
          { k: '検査結果', v: ok ? '誤りなし' : '誤りを検出', ok, ng: !ok },
        ]}
      />
      <Note>パリティビットで1の個数をそろえると、1ビットの誤りを検出できる。2ビット以上だと見逃すことがある。</Note>
    </FigureFrame>
  )
}

/* ---------- 実効速度 ---------- */

export function EffectiveSpeedLab() {
  const [speed, setSpeed] = useState(100)
  const [utilization, setUtilization] = useState(80)
  const [overhead, setOverhead] = useState(5)
  const effective = speed * (utilization / 100) * (1 - overhead / 100)
  const seconds = transferSeconds(100, effective)

  return (
    <FigureFrame
      badge="実験"
      title="回線速度どおりには、運べない？"
      status={`${speed}Mbpsの回線でも、利用率${utilization}%・オーバーヘッド${overhead}%なら実効${effective.toFixed(1)}Mbps。100MB送るのに約${duration(seconds)}。`}
    >
      <Slider label="回線速度 [Mbps]" value={speed} min={10} max={1000} step={10} onChange={setSpeed} fmt={(v) => `${v}Mbps`} />
      <Slider label="回線の利用率 [%]" value={utilization} min={10} max={100} onChange={setUtilization} fmt={(v) => `${v}%`} />
      <Slider label="ヘッダなどのオーバーヘッド [%]" value={overhead} min={0} max={20} onChange={setOverhead} fmt={(v) => `${v}%`} />
      <Canvas label="理論値と実効速度の比較" interactive>
        <div className={s.bars} role="img" aria-label={`理論値${speed}Mbps、実効${effective.toFixed(1)}Mbps`}>
          <div className={s.barRow}>
            <div className={s.barHead}>
              <span>理論値</span>
              <strong>{speed}Mbps</strong>
            </div>
            <div className={s.barTrack}>
              <div className={`${s.barFill} ${s.barLinear}`} style={{ width: '100%' }} />
            </div>
          </div>
          <div className={s.barRow}>
            <div className={s.barHead}>
              <span>実効速度</span>
              <strong>{effective.toFixed(1)}Mbps</strong>
            </div>
            <div className={s.barTrack}>
              <div className={`${s.barFill} ${s.barBinary}`} style={{ width: `${Math.max(1, effective / speed * 100)}%` }} />
            </div>
          </div>
        </div>
      </Canvas>
      <Readout
        items={[
          { k: '理論値', v: `${speed}Mbps` },
          { k: '実効速度', v: `${effective.toFixed(1)}Mbps`, strong: true },
          { k: '100MBの転送', v: duration(seconds) },
        ]}
      />
      <Note>実効速度は回線速度より小さい。利用率やヘッダの分だけ、実際に運べるデータは減る。</Note>
    </FigureFrame>
  )
}

/* ---------- サブネットマスク ---------- */

export function SubnetLab() {
  const [prefix, setPrefix] = useState(24)
  const ip = '192.168.10.34'
  const mask = subnetMask(prefix)
  const network = networkAddress(ip, prefix)
  const hosts = subnetHosts(prefix)

  return (
    <FigureFrame
      badge="実験"
      title="サブネットマスクで、ネットワークを区切る"
      status={`${ip} に /${prefix} を付けると、マスクは ${mask}。ネットワーク部は ${network}、使えるホストは ${hosts}台。`}
    >
      <Slider label="プレフィックス長 [bit]" value={prefix} min={8} max={30} onChange={setPrefix} fmt={(v) => `/${v}`} />
      <Canvas label={`${ip}/${prefix} のネットワーク部とホスト部`} interactive>
        <svg viewBox="0 0 320 96" className={fig.svg} role="img" aria-label={`/${prefix}、ネットワーク部${prefix}ビット、ホスト部${32 - prefix}ビット`}>
          {Array.from({ length: 32 }, (_, i) => (
            <rect
              key={i}
              x={16 + (i % 16) * 17}
              y={i < 16 ? 12 : 36}
              width={15}
              height={18}
              rx={2}
              fill={i < prefix ? 'var(--color-accent-tint)' : 'var(--color-surface)'}
              stroke={i < prefix ? 'var(--color-accent)' : 'var(--color-border)'}
            />
          ))}
          <text x={16} y={76} fontSize={11} textAnchor="start" fill="var(--color-accent)">
            青 = ネットワーク部 {prefix}ビット
          </text>
          <text x={304} y={76} fontSize={11} textAnchor="end" fill="var(--color-secondary-label)">
            灰 = ホスト部 {32 - prefix}ビット
          </text>
        </svg>
      </Canvas>
      <Readout
        items={[
          { k: 'サブネットマスク', v: mask },
          { k: 'ネットワークアドレス', v: network },
          { k: '使えるホスト', v: `${hosts.toLocaleString()}台`, strong: true },
        ]}
      />
      <Note>/n のマスクは先頭nビットをネットワーク部にする。ホスト数は 2^(32-n)-2（ネットワークとブロードキャストを除く）。</Note>
    </FigureFrame>
  )
}

/* ---------- デジタル署名 ---------- */

export function DigitalSignatureLab() {
  const [tampered, setTampered] = useState(false)
  const [wrongKey, setWrongKey] = useState(false)
  const original = '送金1000円'
  const shown = tampered ? '送金9000円' : original
  const signed = checksum(original)
  const received = checksum(shown)
  const verified = signed === received && !wrongKey

  return (
    <FigureFrame
      badge="実験"
      title="デジタル署名は、改ざんを見抜ける？"
      status={
        tampered
          ? `文書が「${shown}」に変わった。ダイジェストは ${signed} → ${received} で、検証は${verified ? '成功' : '失敗'}。`
          : `文書「${shown}」のダイジェストは ${signed}。検証は${verified ? '成功' : '失敗'}。`
      }
      statusKind={verified ? 'ok' : 'ng'}
    >
      <div className={fig.ctrl}>
        <Btn on={tampered} ariaPressed={tampered} onClick={() => setTampered((v) => !v)}>
          文書を改ざんする
        </Btn>
        <Btn on={wrongKey} ariaPressed={wrongKey} onClick={() => setWrongKey((v) => !v)}>
          別人の公開鍵で検証する
        </Btn>
      </div>
      <Canvas label="文書・ダイジェスト・署名の検証" interactive>
        <div className={s.cipherGroup}>
          <div>
            <span className={s.cipherLabel}>受け取った文書</span>
            <p className={`${s.cipherBox} ${tampered ? s.cipherOut : ''}`}>{shown}</p>
          </div>
          <p className={s.cipherArrow} aria-hidden="true">
            ↓ ダイジェストを計算
          </p>
          <div>
            <span className={s.cipherLabel}>受信時のダイジェスト / 署名に含まれる値</span>
            <p className={s.cipherBox}>
              {received} / {signed}
            </p>
          </div>
        </div>
      </Canvas>
      <Readout
        items={[
          { k: '送信時のダイジェスト', v: signed },
          { k: '受信時のダイジェスト', v: received, ng: signed !== received },
          { k: '検証結果', v: verified ? '成功（本人の文書）' : '失敗（改ざんか別人）', ok: verified, ng: !verified, strong: true },
        ]}
      />
      <Note>デジタル署名は、文書のダイジェストを本人の秘密鍵で暗号化したもの。改ざんすると検証に失敗する。この実験では短いチェックサムでダイジェストを代用している。</Note>
    </FigureFrame>
  )
}

/* ---------- 多要素認証 ---------- */

const MFA_FACTORS = [
  { id: 'password', label: 'パスワード（知識）', breach: 0.1 },
  { id: 'sms', label: 'SMSコード（所持）', breach: 0.05 },
  { id: 'biometric', label: '生体認証（身体）', breach: 0.01 },
  { id: 'device', label: 'ICカード（所持）', breach: 0.02 },
]

export function MfaLab() {
  const [on, setOn] = useState<boolean[]>([true, false, false, false])
  const [required, setRequired] = useState(1)
  const selected = MFA_FACTORS.filter((_, i) => on[i])
  const enough = selected.length >= required
  const probability = enough
    ? [...selected]
        .sort((a, b) => b.breach - a.breach)
        .slice(0, required)
        .reduce((p, factor) => p * factor.breach, 1)
    : 1
  const strong = enough && probability < 0.01
  const meter = Math.min(100, Math.max(2, ((Math.log10(probability) + 4) / 4) * 100))

  return (
    <FigureFrame
      badge="実験"
      title="認証の要素を増やすと、突破されにくくなる？"
      status={
        enough
          ? `${required}要素そろうと、すべて破られる確率は約${(probability * 100).toFixed(2)}%。`
          : `要素が${required}個必要だが、選ばれているのは${selected.length}個。`
      }
      statusKind={strong ? 'ok' : 'ng'}
    >
      <div className={s.checks} role="group" aria-label="使う認証の要素">
        {MFA_FACTORS.map((factor, i) => (
          <button
            key={factor.id}
            type="button"
            className={`${s.check} ${on[i] ? s.checkOn : ''}`}
            aria-pressed={on[i]}
            onClick={() => setOn((prev) => prev.map((v, j) => (j === i ? !v : v)))}
          >
            <span className={s.checkMark} aria-hidden="true">
              {on[i] ? <CheckIcon /> : <CrossIcon />}
            </span>
            <span>{factor.label}</span>
          </button>
        ))}
      </div>
      <Slider label="必要な要素数" value={required} min={1} max={3} onChange={setRequired} fmt={(v) => `${v}要素`} />
      <Canvas label="突破される確率の目安" interactive>
        <div className={s.meter} aria-hidden="true">
          <div className={`${s.meterFill} ${strong ? s.meterOk : s.meterNg}`} style={{ width: `${meter}%` }} />
        </div>
        <p className={s.valueList}>
          {enough ? `突破される確率 約${(probability * 100).toFixed(2)}%` : '要素が足りません'}
        </p>
      </Canvas>
      <Readout
        items={[
          { k: '選んだ要素', v: `${selected.length}個` },
          { k: '必要な要素', v: `${required}個` },
          { k: '突破される確率', v: enough ? `約${(probability * 100).toFixed(2)}%` : '—', ok: strong, ng: enough && !strong, strong: true },
        ]}
      />
      <Note>知識・所持・生体のうち複数の要素を組み合わせると、1つ破られても突破されにくい。この実験の確率は説明用の目安。</Note>
    </FigureFrame>
  )
}

/* ---------- NAT ---------- */

export function NatLab() {
  const [devices, setDevices] = useState(3)

  return (
    <FigureFrame
      badge="実験"
      title="1つのグローバルIPを、みんなで共有する"
      status={`${devices}台がグローバルIP 203.0.113.5 を共有。ポート番号を変えて、戻り先を区別する。`}
    >
      <Slider label="同時に使う台数" value={devices} min={1} max={8} onChange={setDevices} fmt={(v) => `${v}台`} />
      <Canvas label="プライベートIPとグローバルIPの対応表" interactive>
        <ol className={s.packets} aria-label="NATの変換表">
          {Array.from({ length: devices }, (_, i) => (
            <li key={i} className={s.packet}>
              <span className={s.packetId}>
                192.168.0.{i + 1}:{40000 + i}
              </span>
              <span className={s.packetMeta}>→ 203.0.113.5:{50000 + i}</span>
            </li>
          ))}
        </ol>
      </Canvas>
      <Readout
        items={[
          { k: 'グローバルIP', v: '203.0.113.5' },
          { k: '変換した数', v: `${devices}件` },
          { k: 'ポート番号', v: `50000〜${49999 + devices}`, strong: true },
        ]}
      />
      <Note>NAT（NAPT）は、プライベートIPとポートをグローバルIPのポートに対応づけ、1つのIPを複数台で共有する。</Note>
    </FigureFrame>
  )
}
