/**
 * 情報社会の実験（追加分）。著作権・音のデータ量・圧縮・配色・量子化。
 */
import { useState } from 'react'
import { CheckIcon, CrossIcon } from '@/components/Icons'
import { Segmented } from '@/components/Segmented'
import { Canvas, FigureFrame, GBox, Note, Readout, Slider } from '@/figures/parts'
import fig from '@/figures/figures.module.css'
import { contrastRatio, nyquistOk, rleEncode, soundBytes } from './sim'
import s from './labs.module.css'

/* ---------- 著作権の保護期間 ---------- */

const COPYRIGHT_YEARS = 70

export function CopyrightTermLab() {
  const [years, setYears] = useState(40)
  const protectedNow = years < COPYRIGHT_YEARS
  const x = (y: number) => 16 + (y / 100) * 288

  return (
    <FigureFrame
      badge="実験"
      title="著作権は、作者の死後いつまで続く？"
      status={`作者の死後${years}年。日本の著作権（原則）は死後${COPYRIGHT_YEARS}年までなので、${
        protectedNow ? 'まだ保護されている。' : '保護期間は終了している。'
      }`}
      statusKind={protectedNow ? 'plain' : 'ok'}
    >
      <Slider label="作者の死後、何年たったか" value={years} min={0} max={100} onChange={setYears} fmt={(v) => `${v}年`} />
      <Canvas label="著作権の保護期間のタイムライン" interactive>
        <svg viewBox="0 0 320 104" className={fig.svg} role="img" aria-label={`死後${years}年。保護期間は死後${COPYRIGHT_YEARS}年まで`}>
          <line x1={x(0)} y1={58} x2={x(100)} y2={58} stroke="var(--color-border)" strokeWidth={2} />
          <line x1={x(0)} y1={48} x2={x(COPYRIGHT_YEARS)} y2={48} stroke="var(--color-success)" strokeWidth={10} strokeLinecap="round" />
          <line x1={x(COPYRIGHT_YEARS)} y1={30} x2={x(COPYRIGHT_YEARS)} y2={72} stroke="var(--color-success)" strokeDasharray="4 3" />
          {[0, COPYRIGHT_YEARS, 100].map((v) => (
            <g key={v}>
              <line x1={x(v)} y1={54} x2={x(v)} y2={62} stroke="var(--color-border)" />
              <text
                x={x(v)}
                y={88}
                fontSize={11}
                textAnchor={v === 0 ? 'start' : v === 100 ? 'end' : 'middle'}
                fill="var(--color-secondary-label)"
              >
                死後{v}年
              </text>
            </g>
          ))}
          <circle cx={x(years)} cy={48} r={7} fill={protectedNow ? 'var(--color-accent)' : 'var(--color-secondary-label)'} stroke="var(--color-card)" strokeWidth={2} />
          <text x={x(COPYRIGHT_YEARS)} y={22} fontSize={11} textAnchor="middle" fill="var(--color-success-ink)" fontWeight={700}>
            ここで終了
          </text>
        </svg>
      </Canvas>
      <Readout
        items={[
          { k: '原則の保護期間', v: `死後${COPYRIGHT_YEARS}年` },
          { k: '経過した年数', v: `${years}年` },
          { k: 'いまの状態', v: protectedNow ? '保護中' : '保護期間の終了', ok: !protectedNow },
        ]}
      />
      <Note>2018年の法改正で、原則が死後50年から70年に延びた。映画など一部は扱いが異なる。</Note>
    </FigureFrame>
  )
}

/* ---------- 音のデータ量 ---------- */

const RATE_OPTIONS = [
  { value: '8', label: '8kHz' },
  { value: '16', label: '16kHz' },
  { value: '22.05', label: '22.05kHz' },
  { value: '44.1', label: '44.1kHz' },
  { value: '48', label: '48kHz' },
] as const
const BIT_OPTIONS = [
  { value: '8', label: '8bit' },
  { value: '16', label: '16bit' },
  { value: '24', label: '24bit' },
] as const
type Rate = (typeof RATE_OPTIONS)[number]['value']
type BitDepth = (typeof BIT_OPTIONS)[number]['value']

export function SamplingSizeLab() {
  const [rate, setRate] = useState<Rate>('44.1')
  const [bits, setBits] = useState<BitDepth>('16')
  const [seconds, setSeconds] = useState(10)
  const bytes = soundBytes(Number(rate), Number(bits), seconds)
  const kb = bytes / 1024
  const size = kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${Math.round(kb)} KB`

  return (
    <FigureFrame
      badge="実験"
      title="音のデータ量は、何で決まる？"
      status={`${rate}kHz・${bits}bitで${seconds}秒録音すると、約${size}。標本化周波数か量子化ビット数を上げるほど、音は細かくなるがデータも増える。`}
    >
      <Segmented label="標本化周波数" value={rate} options={RATE_OPTIONS} onChange={setRate} />
      <Segmented label="量子化ビット数" value={bits} options={BIT_OPTIONS} onChange={setBits} />
      <Slider label="録音する長さ [秒]" value={seconds} min={1} max={60} onChange={setSeconds} fmt={(v) => `${v}秒`} />
      <Canvas label="音のデータ量の計算" interactive>
        <svg viewBox="0 0 320 92" className={fig.svg} role="img" aria-label={`${rate}kHz、${bits}bit、${seconds}秒で約${size}`}>
          <GBox x={8} y={18} w={86} h={32} text={`${rate}kHz`} />
          <text x={102} y={39} fontSize={14} textAnchor="middle" fill="var(--color-secondary-label)">
            ×
          </text>
          <GBox x={112} y={18} w={86} h={32} text={`${bits}bit`} />
          <text x={206} y={39} fontSize={14} textAnchor="middle" fill="var(--color-secondary-label)">
            ×
          </text>
          <GBox x={216} y={18} w={96} h={32} text={`${seconds}秒`} />
          <text x={160} y={78} fontSize={15} textAnchor="middle" fill="var(--color-label)" fontWeight={700}>
            = {size}
          </text>
        </svg>
      </Canvas>
      <Readout
        items={[
          { k: '1秒あたり', v: `${Math.round(soundBytes(Number(rate), Number(bits), 1) / 1024)} KB` },
          { k: '合計', v: size, strong: true },
          { k: '計算', v: `${rate}k × ${bits}bit × ${seconds}秒 ÷ 8` },
        ]}
      />
      <Note>ステレオなら2倍。CDは44.1kHz・16bit・2chで、1秒あたり約176KBになる。</Note>
    </FigureFrame>
  )
}

/* ---------- ランレングス圧縮 ---------- */

export function RleLab() {
  const [text, setText] = useState('AAAAABBBCCDAA')
  const result = rleEncode(text)
  const saved = result.original > 0 ? (1 - result.compressed / result.original) * 100 : 0

  return (
    <FigureFrame
      badge="実験"
      title="同じ文字が続くと、どこまで縮む？"
      status={
        text
          ? `${result.original}文字が${result.compressed}文字になった。${saved >= 0 ? `${saved.toFixed(0)}%短くなった。` : '元より長くなった。'}`
          : 'A–Zを入力すると、圧縮した結果が出ます。'
      }
      statusKind={saved >= 0 ? 'ok' : 'ng'}
    >
      <div className={s.field}>
        <label className={s.fieldLabel} htmlFor="rle-input">
          圧縮する文字（A–Zと空白）
        </label>
        <input
          id="rle-input"
          className={s.input}
          value={text}
          maxLength={24}
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
          placeholder="AAAAABBBCCDAA"
          onChange={(e) => setText(e.target.value.toUpperCase().replace(/[^A-Z ]/g, '').slice(0, 24))}
        />
      </div>
      <Canvas label="元の文字列とランレングス符号" interactive>
        <div className={s.cipherGroup}>
          <div>
            <span className={s.cipherLabel}>元の文字（{result.original}文字）</span>
            <p className={s.cipherBox}>{text || '（入力してください）'}</p>
          </div>
          <p className={s.cipherArrow} aria-hidden="true">
            ↓ 回数＋文字に置き換える
          </p>
          <div>
            <span className={s.cipherLabel}>圧縮後（{result.compressed}文字）</span>
            <p className={`${s.cipherBox} ${s.cipherOut}`}>{result.encoded || '—'}</p>
          </div>
        </div>
      </Canvas>
      <Readout
        items={[
          { k: '元の文字数', v: `${result.original}文字` },
          { k: '圧縮後', v: `${result.compressed}文字` },
          { k: '削減率', v: `${saved.toFixed(0)}%`, ok: saved >= 0, ng: saved < 0, strong: true },
        ]}
      />
      <Note>同じ文字が続かないデータでは、回数と文字を足す分だけ長くなることがある。</Note>
    </FigureFrame>
  )
}

/* ---------- 色のコントラスト ---------- */

export function ContrastLab() {
  const [textColor, setTextColor] = useState('#1c1c1e')
  const [bgColor, setBgColor] = useState('#ffffff')
  const ratio = contrastRatio(textColor, bgColor)
  const ok = ratio >= 4.5

  return (
    <FigureFrame
      badge="実験"
      title="文字と背景の色で、読みやすさを測る"
      status={`コントラスト比は ${ratio.toFixed(1)}:1。${ok ? '4.5:1以上なので、通常の文字として読みやすい。' : '4.5:1未満なので、通常の文字には読みにくい。'}`}
      statusKind={ok ? 'ok' : 'ng'}
    >
      <div className={s.colorRow}>
        <label className={s.colorField}>
          <span className={s.fieldLabel}>文字色</span>
          <input type="color" className={s.colorInput} value={textColor} onChange={(e) => setTextColor(e.target.value)} />
        </label>
        <label className={s.colorField}>
          <span className={s.fieldLabel}>背景色</span>
          <input type="color" className={s.colorInput} value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
        </label>
      </div>
      <Canvas label="選んだ色での文字の見え方" interactive>
        <p className={s.preview} style={{ color: textColor, background: bgColor }}>
          この文字は読める？
        </p>
      </Canvas>
      <Readout
        items={[
          { k: 'コントラスト比', v: `${ratio.toFixed(1)}:1`, strong: true },
          { k: '通常の文字の基準', v: '4.5:1以上', ok },
          { k: '大きな文字の基準', v: '3:1以上' },
        ]}
      />
      <Note>色だけで状態を伝えず、文字やアイコンも添える。コントラストはその第一歩。</Note>
    </FigureFrame>
  )
}

/* ---------- 量子化ビット数 ---------- */

export function QuantizationLab() {
  const [bits, setBits] = useState(2)
  const levels = 2 ** bits
  const samples = 25
  const raw = (i: number) => 0.5 + Math.sin((i / (samples - 1)) * Math.PI * 4) * 0.4
  const quantized = (i: number) => Math.round(raw(i) * (levels - 1)) / (levels - 1)
  const points = Array.from({ length: samples }, (_, i) => `${16 + i * 12},${74 - raw(i) * 52}`)
  const steps = Array.from({ length: samples }, (_, i) => `${16 + i * 12},${74 - quantized(i) * 52}`)

  return (
    <FigureFrame
      badge="実験"
      title="量子化の段階を増やすと、音はどう変わる？"
      status={`${bits}bit なら ${levels}段階。段階が少ないと波形がカクカクになり、多いほど元の音に近づく。`}
      statusKind={bits >= 8 ? 'ok' : 'plain'}
    >
      <Slider label="量子化ビット数 [bit]" value={bits} min={1} max={8} onChange={setBits} fmt={(v) => `${v}bit`} />
      <Canvas label={`${bits}bitで量子化した波形`} interactive>
        <svg viewBox="0 0 320 94" className={fig.svg} role="img" aria-label={`${bits}bit、${levels}段階で量子化した波形`}>
          <line x1={16} y1={74} x2={304} y2={74} stroke="var(--color-border)" />
          <polyline points={points.join(' ')} fill="none" stroke="var(--color-border)" strokeWidth={2} />
          <polyline points={steps.join(' ')} fill="none" stroke="var(--color-accent)" strokeWidth={2} />
          <text x={160} y={90} fontSize={11} textAnchor="middle" fill="var(--color-secondary-label)">
            灰色 = 元の波形 ／ 青 = 量子化した波形
          </text>
        </svg>
      </Canvas>
      <Readout
        items={[
          { k: '段階の数', v: `${levels}段階`, strong: true },
          { k: '1段階の細かさ', v: `1/${levels}` },
          { k: '1サンプルあたり', v: `${bits}bit` },
        ]}
      />
      <Note>段階を増やすと音はきれいになるが、その分データ量が増える。16bitなら65,536段階。</Note>
    </FigureFrame>
  )
}

/* ---------- タップ領域（追加30本） ---------- */

export function TapTargetLab() {
  const [size, setSize] = useState(28)
  const ok = size >= 44

  return (
    <FigureFrame
      badge="実験"
      title="ボタンの大きさで、押しやすさは変わる？"
      status={`タップ領域は${size}px。44px以上なら指で狙いやすく、誤タップしにくい。`}
      statusKind={ok ? 'ok' : 'ng'}
    >
      <Slider label="ボタンの一辺 [px]" value={size} min={20} max={64} onChange={setSize} fmt={(v) => `${v}px`} />
      <Canvas label="44pxの目安と、いまのボタンの大きさ" interactive>
        <svg viewBox="0 0 320 110" className={fig.svg} role="img" aria-label={`ボタンは${size}px。目安は44px`}>
          <circle cx={90} cy={50} r={22} fill="none" stroke="var(--color-success)" strokeDasharray="4 3" strokeWidth={2} />
          <text x={90} y={98} fontSize={11} textAnchor="middle" fill="var(--color-secondary-label)">
            目安 44px
          </text>
          <circle cx={230} cy={50} r={Math.min(32, size / 2)} fill={ok ? 'var(--color-success)' : 'var(--color-error)'} />
          <text x={230} y={98} fontSize={11} textAnchor="middle" fill="var(--color-secondary-label)">
            いまのボタン {size}px
          </text>
        </svg>
      </Canvas>
      <Readout
        items={[
          { k: 'タップ領域', v: `${size}px` },
          { k: '目安', v: '44px以上', ok: true },
          { k: '判定', v: ok ? '押しやすい' : '小さすぎる', ok, ng: !ok, strong: true },
        ]}
      />
      <Note>指の太さに対して小さすぎるボタンは、隣を押してしまう原因になる。余白を含めて44px以上を確保する。</Note>
    </FigureFrame>
  )
}

/* ---------- 写真公開の判断（肖像権・プライバシー） ---------- */

const PHOTO_CONDITIONS = [
  '写っている本人から許可をとった',
  '写っているのは自分だけ',
  '顔をぼかした',
  '公開範囲を「友だちだけ」にした',
]

export function PrivacyScopeLab() {
  const [met, setMet] = useState<boolean[]>(PHOTO_CONDITIONS.map(() => false))
  const portraitOk = met[0] || met[1] || met[2]
  const privacyOk = met[3]
  const ok = portraitOk && privacyOk

  return (
    <FigureFrame
      badge="実験"
      title="この写真、公開しても大丈夫？"
      status={`肖像権の面は${portraitOk ? '問題が少ない' : 'リスクがある'}。公開範囲の配慮は${privacyOk ? 'できている' : '足りない'}。`}
      statusKind={ok ? 'ok' : 'ng'}
    >
      <div className={s.checks} role="group" aria-label="写真を公開する前の確認">
        {PHOTO_CONDITIONS.map((label, i) => (
          <button
            key={label}
            type="button"
            className={`${s.check} ${met[i] ? s.checkOn : ''}`}
            aria-pressed={met[i]}
            onClick={() => setMet((prev) => prev.map((value, j) => (j === i ? !value : value)))}
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
        <span>{ok ? '公開してもトラブルになりにくい' : '確認が足りないまま公開すると、トラブルになりうる'}</span>
      </div>
      <Readout
        items={[
          { k: '肖像権の配慮', v: portraitOk ? 'あり' : 'なし', ok: portraitOk, ng: !portraitOk },
          { k: '公開範囲の配慮', v: privacyOk ? 'あり' : 'なし', ok: privacyOk, ng: !privacyOk },
          { k: '総合', v: ok ? '公開可' : '要確認', strong: true, ok, ng: !ok },
        ]}
      />
      <Note>肖像権は本人の許可が基本。写っているのが自分だけ、顔を隠す、公開範囲を絞ることもリスクを下げる。</Note>
    </FigureFrame>
  )
}

/* ---------- 個人情報の判定 ---------- */

const PROFILE_ITEMS = ['氏名', '学籍番号', '生年月日', '趣味', '出身地']

export function PersonalInfoLab() {
  const [met, setMet] = useState<boolean[]>(PROFILE_ITEMS.map(() => false))
  const identified = met[0] || met[1]
  const any = met.some(Boolean)

  return (
    <FigureFrame
      badge="実験"
      title="どの項目がそろうと、個人情報になる？"
      status={
        identified
          ? '氏名や学籍番号があり、特定の個人を識別できる。これは個人情報。'
          : any
            ? '単独では特定できないが、他の情報と組み合わせると個人情報になりうる。'
            : '項目を選ぶと、個人情報に当たるか判定します。'
      }
      statusKind={identified ? 'ng' : 'plain'}
    >
      <div className={s.checks} role="group" aria-label="集める情報の項目">
        {PROFILE_ITEMS.map((label, i) => (
          <button
            key={label}
            type="button"
            className={`${s.check} ${met[i] ? s.checkOn : ''}`}
            aria-pressed={met[i]}
            onClick={() => setMet((prev) => prev.map((value, j) => (j === i ? !value : value)))}
          >
            <span className={s.checkMark} aria-hidden="true">
              {met[i] ? <CheckIcon /> : <CrossIcon />}
            </span>
            <span>{label}</span>
          </button>
        ))}
      </div>
      <Readout
        items={[
          { k: '選んだ項目', v: `${met.filter(Boolean).length}個` },
          { k: '識別できる', v: identified ? 'はい' : 'いいえ', ok: identified, ng: identified },
          { k: '判定', v: identified ? '個人情報' : any ? '組合せ次第' : '—', strong: true },
        ]}
      />
      <Note>氏名や学籍番号など、特定の個人を識別できる情報が個人情報。単独で分からなくても、組合せで個人情報になりうる。</Note>
    </FigureFrame>
  )
}

/* ---------- 情報の信ぴょう性 ---------- */

const CREDIBILITY_CHECKS = [
  '発信者がはっきりしている',
  '根拠（一次情報）がある',
  '更新日が新しい',
  '複数の情報源で一致している',
]

export function CredibilityLab() {
  const [met, setMet] = useState<boolean[]>(CREDIBILITY_CHECKS.map(() => false))
  const score = met.filter(Boolean).length
  const ok = score >= 3

  return (
    <FigureFrame
      badge="実験"
      title="その情報、どこまで確かめた？"
      status={`確かめた項目は${score}/4。${ok ? '裏づけが多く、信ぴょう性は高い。' : '確かめ方が足りない。うのみにしない。'}`}
      statusKind={ok ? 'ok' : 'ng'}
    >
      <div className={s.checks} role="group" aria-label="情報の確かめ方">
        {CREDIBILITY_CHECKS.map((label, i) => (
          <button
            key={label}
            type="button"
            className={`${s.check} ${met[i] ? s.checkOn : ''}`}
            aria-pressed={met[i]}
            onClick={() => setMet((prev) => prev.map((value, j) => (j === i ? !value : value)))}
          >
            <span className={s.checkMark} aria-hidden="true">
              {met[i] ? <CheckIcon /> : <CrossIcon />}
            </span>
            <span>{label}</span>
          </button>
        ))}
      </div>
      <Canvas label="確かめた項目の数" interactive>
        <div className={s.meter} aria-hidden="true">
          <div className={`${s.meterFill} ${ok ? s.meterOk : s.meterNg}`} style={{ width: `${(score / CREDIBILITY_CHECKS.length) * 100}%` }} />
        </div>
        <p className={s.valueList}>{score} / {CREDIBILITY_CHECKS.length} 項目を確認</p>
      </Canvas>
      <Note>発信者・根拠・更新日・複数の情報源を確かめる。1つだけを信じず、照らし合わせる。</Note>
    </FigureFrame>
  )
}

/* ---------- 標本化周波数 ---------- */

export function SamplingRateLab() {
  const [rate, setRate] = useState(8)
  const samples = Math.max(1, Math.round(rate * 3))
  const points = Array.from({ length: samples }, (_, i) => {
    const t = i / rate
    return { x: 16 + (t / 3) * 288, y: 55 - Math.sin(2 * Math.PI * t) * 34 }
  })
  const wave = Array.from({ length: 60 }, (_, i) => {
    const t = (i / 59) * 3
    return `${16 + (t / 3) * 288},${55 - Math.sin(2 * Math.PI * t) * 34}`
  })
  const enough = nyquistOk(rate * 1000, 1000)

  return (
    <FigureFrame
      badge="実験"
      title="標本化周波数を変えると、波は再現できる？"
      status={`${rate}kHzなら1秒に${(rate * 1000).toLocaleString()}個の点を取る。1kHzの波には${enough ? '足りる' : '足りない（波形が崩れる）'}。`}
      statusKind={enough ? 'ok' : 'ng'}
    >
      <Slider label="標本化周波数 [kHz]" value={rate} min={2} max={44} onChange={setRate} fmt={(v) => `${v}kHz`} />
      <Canvas label="元の波と、標本化した点" interactive>
        <svg viewBox="0 0 320 100" className={fig.svg} role="img" aria-label={`${rate}kHzで標本化。1kHzの波には${enough ? '足りる' : '足りない'}`}>
          <line x1={16} y1={55} x2={304} y2={55} stroke="var(--color-border)" />
          <polyline points={wave.join(' ')} fill="none" stroke="var(--color-border)" strokeWidth={2} />
          <polyline points={points.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke="var(--color-accent)" strokeWidth={1.5} />
          {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={2.5} fill="var(--color-accent)" />
          ))}
          <text x={160} y={92} fontSize={11} textAnchor="middle" fill="var(--color-secondary-label)">
            灰色 = 元の波（1kHz） ／ 青 = 標本点
          </text>
        </svg>
      </Canvas>
      <Readout
        items={[
          { k: '1秒の標本数', v: `${(rate * 1000).toLocaleString()}個` },
          { k: '3msの標本数', v: `${samples}個` },
          { k: '再現できるか', v: enough ? 'できる' : 'できない', ok: enough, ng: !enough, strong: true },
        ]}
      />
      <Note>元の波を再現するには、波の周波数の2倍を超える標本化周波数が必要（標本化定理）。足りないと別の波に見える。</Note>
    </FigureFrame>
  )
}

/* ---------- 解像度と画素数 ---------- */

const DEPTH_OPTIONS = [
  { value: '1', label: '1bit（白黒）' },
  { value: '8', label: '8bit（256色）' },
  { value: '24', label: '24bit（約1677万色）' },
] as const
type Depth = (typeof DEPTH_OPTIONS)[number]['value']

export function ResolutionLab() {
  const [width, setWidth] = useState(640)
  const [height, setHeight] = useState(360)
  const [depth, setDepth] = useState<Depth>('24')
  const pixels = width * height
  const bytes = (pixels * Number(depth)) / 8
  const size = bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`

  return (
    <FigureFrame
      badge="実験"
      title="解像度と色の深さで、画像の容量は変わる？"
      status={`${width}×${height}で${pixels.toLocaleString()}画素。${depth}bitなら約${size}。`}
    >
      <Slider label="横の画素数 [px]" value={width} min={100} max={1920} step={20} onChange={setWidth} fmt={(v) => `${v}px`} />
      <Slider label="縦の画素数 [px]" value={height} min={100} max={1080} step={20} onChange={setHeight} fmt={(v) => `${v}px`} />
      <Segmented label="1画素あたりの色の深さ" value={depth} options={DEPTH_OPTIONS} onChange={setDepth} />
      <Canvas label="選んだ解像度の比率" interactive>
        <svg viewBox="0 0 320 110" className={fig.svg} role="img" aria-label={`${width}×${height}画素、${depth}bitで約${size}`}>
          <rect x={16} y={12} width={(width / 1920) * 288} height={(height / 1080) * 64} rx={3} fill="var(--color-accent-tint)" stroke="var(--color-accent)" />
          <text x={16} y={96} fontSize={11} fill="var(--color-secondary-label)">
            {width} × {height}
          </text>
          <text x={304} y={96} fontSize={11} textAnchor="end" fill="var(--color-secondary-label)">
            {pixels.toLocaleString()}画素
          </text>
        </svg>
      </Canvas>
      <Readout
        items={[
          { k: '画素数', v: `${pixels.toLocaleString()}画素` },
          { k: '1画素', v: `${depth}bit` },
          { k: 'データ量', v: `約${size}`, strong: true },
        ]}
      />
      <Note>データ量は「画素数 × 1画素のビット数 ÷ 8」。解像度や色数を上げるほど容量が増える。</Note>
    </FigureFrame>
  )
}

/* ---------- 特許の保護期間 ---------- */

const PATENT_YEARS = 20

export function PatentTermLab() {
  const [years, setYears] = useState(10)
  const active = years < PATENT_YEARS
  const x = (y: number) => 16 + (y / 30) * 288

  return (
    <FigureFrame
      badge="実験"
      title="特許は、出願からいつまで保護される？"
      status={`出願から${years}年。特許権は原則${PATENT_YEARS}年なので、${active ? 'まだ保護されている。' : '保護期間は終了している。'}`}
      statusKind={active ? 'plain' : 'ok'}
    >
      <Slider label="出願から何年たったか" value={years} min={0} max={30} onChange={setYears} fmt={(v) => `${v}年`} />
      <Canvas label="特許の保護期間のタイムライン" interactive>
        <svg viewBox="0 0 320 104" className={fig.svg} role="img" aria-label={`出願から${years}年。特許は${PATENT_YEARS}年まで`}>
          <line x1={x(0)} y1={58} x2={x(30)} y2={58} stroke="var(--color-border)" strokeWidth={2} />
          <line x1={x(0)} y1={48} x2={x(PATENT_YEARS)} y2={48} stroke="var(--color-success)" strokeWidth={10} strokeLinecap="round" />
          <line x1={x(PATENT_YEARS)} y1={30} x2={x(PATENT_YEARS)} y2={72} stroke="var(--color-success)" strokeDasharray="4 3" />
          {[0, PATENT_YEARS, 30].map((v) => (
            <g key={v}>
              <line x1={x(v)} y1={54} x2={x(v)} y2={62} stroke="var(--color-border)" />
              <text
                x={x(v)}
                y={88}
                fontSize={11}
                textAnchor={v === 0 ? 'start' : v === 30 ? 'end' : 'middle'}
                fill="var(--color-secondary-label)"
              >
                {v}年
              </text>
            </g>
          ))}
          <circle cx={x(years)} cy={48} r={7} fill={active ? 'var(--color-accent)' : 'var(--color-secondary-label)'} stroke="var(--color-card)" strokeWidth={2} />
          <text x={x(PATENT_YEARS)} y={22} fontSize={11} textAnchor="middle" fill="var(--color-success-ink)" fontWeight={700}>
            ここで終了
          </text>
        </svg>
      </Canvas>
      <Readout
        items={[
          { k: '特許の保護期間', v: `出願から${PATENT_YEARS}年` },
          { k: '経過した年数', v: `${years}年` },
          { k: 'いまの状態', v: active ? '保護中' : '保護期間の終了', ok: !active },
        ]}
      />
      <Note>特許権は原則、出願から20年。著作権（死後70年）とは保護の考え方が違う。</Note>
    </FigureFrame>
  )
}

/* ---------- アンケート設計 ---------- */

const SURVEY_CHECKS = [
  '選択肢が重ならない',
  '選択肢がすべてを網羅している',
  '中立な聞き方になっている',
  '回答者に偏りがない',
]

export function SurveyDesignLab() {
  const [met, setMet] = useState<boolean[]>(SURVEY_CHECKS.map(() => false))
  const missing = SURVEY_CHECKS.filter((_, i) => !met[i])
  const ok = missing.length === 0

  return (
    <FigureFrame
      badge="実験"
      title="そのアンケート、結果を信じて大丈夫？"
      status={ok ? '4つの点を満たした。偏りの少ない調査になった。' : `あと${missing.length}個の点を直す必要がある。`}
      statusKind={ok ? 'ok' : 'ng'}
    >
      <div className={s.checks} role="group" aria-label="アンケート設計のチェック">
        {SURVEY_CHECKS.map((label, i) => (
          <button
            key={label}
            type="button"
            className={`${s.check} ${met[i] ? s.checkOn : ''}`}
            aria-pressed={met[i]}
            onClick={() => setMet((prev) => prev.map((value, j) => (j === i ? !value : value)))}
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
          {ok ? '使えるアンケート' : 'このままでは結果がゆがむ'}
          {!ok && <span className={s.verdictReason}>（足りない点: {missing.join('、')}）</span>}
        </span>
      </div>
      <Note>選択肢は重ならず漏れなく、中立な聞き方で、偏りのない相手に聞く。1つでも欠けると結果がゆがむ。</Note>
    </FigureFrame>
  )
}
