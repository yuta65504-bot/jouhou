/**
 * 情報社会（society, q-soc-1〜18）: 問題ごとに付けた個別のインタラクティブ図解。
 * 1問 = 1コンポーネント。図は SVG + DOM、「押す・動かす」結果が即時に図へ反映される。
 */
import { useState } from 'react'
import styles from './figures.module.css'
import { Segmented } from '@/components/Segmented'
import {
  ACCENT,
  BORDER,
  LABEL,
  Calc,
  FigShell,
  MUTED,
  NGINK,
  Note,
  OKINK,
  TINT,
  View,
  Btn,
  Slider,
  GBox,
} from './parts'

/** 縦並びの操作ブロック */
const Col = ({ children }: { children: React.ReactNode }) => (
  <div className={styles.ctrl} style={{ flexDirection: 'column', alignItems: 'stretch' }}>
    {children}
  </div>
)

/* ---------- q-soc-1: タップ領域と誤タップ ---------- */

export function SocFig1() {
  const [size, setSize] = useState(32)
  const ok = size >= 44
  const risk = Math.max(0, Math.round(((44 - size) / 20) * 100))
  return (
    <FigShell
      title="図解: タップ領域の広さを変えてみる"
      status={ok ? '44px以上。指に収まりやすく、誤タップが減る設計。' : '44px未満。指が収まりにくく、誤タップが増えやすい。'}
      statusKind={ok ? 'ok' : 'ng'}
    >
      <View label={`一辺${size}pxのタップ領域を模した図`}>
        <svg viewBox="0 0 320 150" className={styles.svg}>
          <rect x={40} y={10} width={240} height={104} rx={10} fill="var(--color-card)" stroke={BORDER} />
          <text x={160} y={32} fontSize={9} textAnchor="middle" fill={MUTED}>
            スマホの画面（部分）
          </text>
          <rect
            x={160 - size / 2}
            y={62 - size / 2}
            width={size}
            height={size}
            rx={8}
            fill={ok ? ACCENT : 'var(--color-error-tint)'}
            stroke={ok ? ACCENT : 'var(--color-error)'}
            strokeWidth={2}
          />
          <text x={160} y={62} fontSize={Math.min(11, size * 0.3)} textAnchor="middle" fill={ok ? '#fff' : NGINK} fontWeight={700}>
            送信
          </text>
          <line x1={60} y1={130} x2={260} y2={130} stroke={MUTED} strokeWidth={1} strokeDasharray="3 3" />
          <text x={160} y={144} fontSize={10} textAnchor="middle" fill={MUTED}>
            ボタンの一辺 {size}px ／ 目安は44px以上
          </text>
        </svg>
      </View>
      <Slider label="ボタンの一辺 [px]" value={size} min={24} max={88} step={4} onChange={setSize} />
      <div className={styles.barRow}>
        <span className={styles.barLabel}>誤タップの目安</span>
        <span className={styles.barTrack}>
          <span
            className={styles.barFill}
            style={{ width: `${Math.min(100, risk)}%`, background: ok ? TINT : 'var(--color-error-tint)' }}
          />
        </span>
        <span className={styles.barValue}>{ok ? '低い' : '高い'}</span>
      </div>
      <Note>サイズ以外に「色だけでなく文字・アイコンでも状態を伝える」「端ぎりぎりに置かない」ことも大切。</Note>
    </FigShell>
  )
}

/* ---------- q-soc-2: 著作物利用の正誤 ---------- */

const SOC2_CASES = [
  { id: 'url', label: 'URLだけ書いて使用', ok: false, why: '出典の明示だけでは足りない。「公正な慣行」「主要部分を改変しない」など引用の条件も満たす必要がある。' },
  { id: 'quote', label: '引用の条件を満たす', ok: true, why: '出所明示・公正な慣行・正当な目的の範囲内を満たせば、許諾なしの「引用」が認められる場合がある。' },
  { id: 'search', label: '検索で見つけた画像をそのまま使用', ok: false, why: '検索は利用の許可とは別。著作権者的許諾のない利用は原則、侵害になる。' },
  { id: 'mod', label: '改変して投稿', ok: false, why: '主要な表現を変えることは引用の条件に反し、同一性保持権の侵害に当たり得る。' },
] as const

export function SocFig2() {
  const [pick, setPick] = useState<(typeof SOC2_CASES)[number]['id']>('url')
  const c = SOC2_CASES.find((x) => x.id === pick)!
  return (
    <FigShell
      title="図解: 著作物の利用を判定する"
      status={c.ok ? 'この利用は「引用」として認められる場合がある。' : 'この利用は原則、著作権の侵害になる。'}
      statusKind={c.ok ? 'ok' : 'ng'}
    >
      <Segmented
        label="利用のケース"
        value={pick}
        options={SOC2_CASES.map((v) => ({ value: v.id, label: v.label }))}
        onChange={setPick}
      />
      <View label="利用の判断の流れ">
        <svg viewBox="0 0 320 120" className={styles.svg}>
          <GBox x={8} y={12} w={130} h={28} text="ネット上の著作物" rx={8} />
          <path d="M 138 26 L 158 26" stroke={MUTED} />
          <GBox x={158} y={12} w={130} h={28} text="使用したい" rx={8} />
          <path d="M 92 40 L 92 58" stroke={MUTED} />
          <GBox x={60} y={58} w={200} h={28} text="引用の条件をすべて満たすか？" rx={8} bold />
          <path d="M 160 86 L 160 100" stroke={MUTED} />
          <text x={160} y={112} fontSize={12} textAnchor="middle" fill={c.ok ? OKINK : NGINK} fontWeight={700}>
            {c.ok ? '✓ 引用として利用できる' : '✕ 原則 許諾が必要'}
          </text>
        </svg>
      </View>
      <Note>{c.why}</Note>
    </FigShell>
  )
}

/* ---------- q-soc-3: 引用の3条件 ---------- */

const COND3 = ['出所を明示した', '公正な慣行に合致している', '主要な部分を改変していない'] as const

export function SocFig3() {
  const [on, setOn] = useState([true, false, true])
  const all = on.every(Boolean)
  const n = on.filter(Boolean).length
  return (
    <FigShell
      title="図解: 条件を満たしているか順にチェック"
      status={all ? '3条件かつあてはまる → 引用として認められ得る。' : `まだ満たしていない条件が${3 - n}つある → 引用としては成立しない。`}
      statusKind={all ? 'ok' : 'ng'}
    >
      <Col>
        {COND3.map((text, i) => (
          <div key={text} className={styles.ctrl}>
            <Btn on={on[i]} ariaPressed={on[i]} onClick={() => setOn((prev) => prev.map((v, j) => (j === i ? !v : v)))}>
              {on[i] ? '✓' : '✗'}
            </Btn>
            <span className={styles.status}>{text}</span>
          </div>
        ))}
      </Col>
      <div className={styles.barRow}>
        <span className={styles.barLabel}>引用の成立</span>
        <span className={styles.barTrack}>
          <span className={styles.barFill} style={{ width: `${(n / 3) * 100}%`, background: all ? TINT : 'var(--color-error-tint)' }} />
        </span>
        <span className={styles.barValue}>{all ? 'OK' : 'NG'}</span>
      </div>
      <Note>引用した割合の多寡（「半分以下ならよい」）や順番の入れ替え、著作者名の省略は、どの条件にも含まれない。</Note>
    </FigShell>
  )
}

/* ---------- q-soc-4: 特許権と著作権 ---------- */

const IP_ROWS = [
  [
    { k: '発生', t: '出願・審査を経て成立' },
    { k: '公開', t: '内容を公開する（独占と交換）' },
    { k: '独占', t: '一定期間だけ独占できる' },
    { k: '他社', t: '許諾を受ければ製作できる → 普及が進む' },
  ],
  [
    { k: '発生', t: '創作した時点で自動的に発生' },
    { k: '公開', t: '公開する義務はない' },
    { k: '独占', t: '保護期間の間、保護される' },
    { k: '他社', t: '権利者の許諾がないと使えない（引用などの例外を除く）' },
  ],
] as const

export function SocFig4() {
  const [kind, setKind] = useState<'tokkyo' | 'chosaku'>('tokkyo')
  const rows = kind === 'tokkyo' ? IP_ROWS[0] : IP_ROWS[1]
  return (
    <FigShell
      title="図解: ふたつの知的財産権を比べる"
      status={kind === 'tokkyo' ? '特許権: 「内容を公開すること」と引き換えに、一定期間の独占を得る。' : '著作権: 創作した時点で自動的に発生し、手続きの記録は不要。'}
    >
      <Segmented
        label="権利の種類"
        value={kind}
        options={[
          { value: 'tokkyo' as const, label: '特許権（二次元コード）' },
          { value: 'chosaku' as const, label: '著作権' },
        ]}
        onChange={setKind}
      />
      <View label="それぞれの権利の特徴の対照表">
        <svg viewBox="0 0 320 150" className={styles.svg}>
          <rect x={8} y={8} width={304} height={134} rx={10} fill="var(--color-card)" stroke={BORDER} />
          {rows.map((r, i) => (
            <g key={r.k}>
              <GBox x={22} y={14 + i * 30} w={58} h={24} text={r.k} fs={10} fill={TINT} stroke={ACCENT} />
              <text
                x={92}
                y={14 + i * 30 + 16}
                fontSize={9.5}
                fill={i === 1 ? ACCENT : MUTED}
                fontWeight={i === 1 ? 700 : 400}
              >
                {r.t}
              </text>
            </g>
          ))}
        </svg>
      </View>
      <Note>「初めて作れば独占」「政府の補助金」「秘密のまま独占」は、どれも「公開と交換の取引」の考え方に合わない。</Note>
    </FigShell>
  )
}

/* ---------- q-soc-5: 著作権表示と自動発生 ---------- */

export function SocFig5() {
  const [mark, setMark] = useState(false)
  const [year, setYear] = useState(0)
  const inTerm = year < 70
  return (
    <FigShell
      title="図解: ©の有無と、保護期間"
      status={inTerm ? `©表示${mark ? 'あり' : 'なし'}・${year}年経過 → 保護期間中。` : `©表示${mark ? 'あり' : 'なし'}・${year}年経過 → 保護期間が過ぎてパブリックドメイン。`}
    >
      <div className={styles.ctrl}>
        <Btn on={mark} ariaPressed={mark} onClick={() => setMark((v) => !v)}>
          ©表示 {mark ? 'あり' : 'なし'}
        </Btn>
        <span className={styles.status}>表示を付けても付けなくても、創作した時点で保護が始まる</span>
      </div>
      <View label={`©表示${mark ? 'あり' : 'なし'}の作品と、創作から${year}年経過した時点の保護状態`}>
        <svg viewBox="0 0 320 128" className={styles.svg}>
          <GBox x={16} y={10} w={110} h={30} text={mark ? '© 表示ありの作品' : '© 表示なしの作品'} fs={9} fill={TINT} />
          <path d="M 126 25 L 158 25" stroke={MUTED} />
          <rect
            x={162}
            y={12}
            width={142}
            height={28}
            rx={8}
            fill={inTerm ? 'var(--color-success-tint)' : 'var(--color-warning-tint)'}
            stroke={inTerm ? 'var(--color-success)' : 'var(--color-warning)'}
          />
          <text x={233} y={30} fontSize={9.5} textAnchor="middle" fill={inTerm ? OKINK : 'var(--color-warning-ink)'} fontWeight={700}>
            {inTerm ? '著作権の保護対象' : 'パブリックドメイン'}
          </text>
          <line x1={20} y1={92} x2={300} y2={92} stroke={BORDER} />
          <circle cx={40} cy={92} r={6} fill={ACCENT} />
          <text x={40} y={112} fontSize={9} textAnchor="middle" fill={MUTED}>
            創作時点
          </text>
          <line x1={40} y1={92} x2={268} y2={92} stroke={ACCENT} strokeWidth={3} />
          <text x={154} y={80} fontSize={10} textAnchor="middle" fill={OKINK} fontWeight={700}>
            自動的に保護が続く
          </text>
          <circle cx={272} cy={92} r={6} fill={MUTED} />
          <text x={272} y={112} fontSize={9} textAnchor="middle" fill={MUTED}>
            保護期間の終了
          </text>
          <line x1={40 + (228 * year) / 80} y1={84} x2={40 + (228 * year) / 80} y2={100} stroke={year < 70 ? 'var(--color-success)' : 'var(--color-warning)'} strokeWidth={2} />
        </svg>
      </View>
      <Slider label="創作からの経過年数 [年]" value={year} min={0} max={80} step={5} onChange={setYear} fmt={(v) => `${v}年`} />
      <Note>日本を含む多くの国は無方式主義（ベルヌ条約）。©表示は「権利者の意思表示」として扱われる。</Note>
    </FigShell>
  )
}

/* ---------- q-soc-6: 肖像権・名誉権・プライバシー ---------- */

const SOC6_ACTIONS = ['名前を無断で使う', '写真を無断で掲載', '名誉を傷つける発信'] as const
const SOC6_RIGHTS: Record<(typeof SOC6_ACTIONS)[number], string> = {
  '名前を無断で使う': 'プライバシー（＋悪評なら名誉権）',
  '写真を無断で掲載': '肖像権（＋プライバシー）',
  '名誉を傷つける発信': '名誉権',
}

export function SocFig6() {
  const [sel, setSel] = useState(1)
  const act = SOC6_ACTIONS[sel]
  return (
    <FigShell
      title="図解: どの権利が問題になるか"
      status={`「${act}」は ${SOC6_RIGHTS[act]} の問題になり得る。本人の同意が必要。`}
    >
      <Segmented
        label="無断で行った操作"
        value={String(sel)}
        options={SOC6_ACTIONS.map((a, i) => ({ value: String(i), label: a }))}
        onChange={(v) => setSel(Number(v))}
      />
      <View label="本人の写真・名前を、本人の同意なしに使うと問題になる権利">
        <svg viewBox="0 0 320 120" className={styles.svg}>
          <rect x={22} y={12} width={96} height={76} rx={8} fill={TINT} stroke={BORDER} />
          <circle cx={70} cy={38} r={12} fill="var(--color-card)" stroke={MUTED} />
          <path d="M 52 70 q 18 -18 36 0" stroke={MUTED} fill="none" />
          <text x={70} y={100} fontSize={9} textAnchor="middle" fill={MUTED}>
            本人の写真・名前
          </text>
          <path d="M 120 50 L 152 50" stroke={MUTED} />
          <GBox x={154} y={36} w={120} h={28} text="無断で投稿" fs={10} fill="var(--color-error-tint)" stroke="var(--color-error)" ink={NGINK} />
          <text x={214} y={96} fontSize={11} fill={NGINK} fontWeight={700} textAnchor="middle">
            ✕ 同意なしは使えない
          </text>
          <text x={214} y={114} fontSize={10} fill={LABEL} fontWeight={700} textAnchor="middle">
            {SOC6_RIGHTS[act].split('（')[0]}
          </text>
        </svg>
      </View>
      <Note>著作権は「創作した表現」にただわれる権利。人の名前や写真そのものは、通常は誰かの著作物ではない。</Note>
    </FigShell>
  )
}

/* ---------- q-soc-7: 個人情報の取扱い ---------- */

export function SocFig7() {
  const [consent, setConsent] = useState(true)
  const [purpose, setPurpose] = useState<'order' | 'ads'>('order')
  const ok = consent && purpose === 'order'
  return (
    <FigShell
      title="図解: 同意と利用目的で判定する"
      status={ok ? '本人の同意・取得した目的の範囲内 → 適切。' : purpose === 'ads' ? '収集目的（注文処理）の範囲を超える目的外利用 → 適切でない。' : '本人の同意がない → 目的内でも不適切。'}
      statusKind={ok ? 'ok' : 'ng'}
    >
      <div className={styles.ctrl}>
        <Btn on={consent} ariaPressed={consent} onClick={() => setConsent((v) => !v)}>
          本人の同意 {consent ? 'あり' : 'なし'}
        </Btn>
      </div>
      <Segmented
        label="情報の使われ方"
        value={purpose}
        options={[
          { value: 'order' as const, label: '注文処理（取得目的）' },
          { value: 'ads' as const, label: '広告メール送付（目的外）' },
        ]}
        onChange={setPurpose}
      />
      <View label="収集した個人情報の流れと、同意・目的の判定">
        <svg viewBox="0 0 320 118" className={styles.svg}>
          <GBox x={12} y={34} w={92} h={30} text="氏名・住所・電話" fs={9.5} />
          <path d="M 108 49 L 138 49" stroke={MUTED} />
          <rect
            x={140}
            y={34}
            width={52}
            height={30}
            rx={8}
            fill={ok ? 'var(--color-success-tint)' : 'var(--color-error-tint)'}
            stroke={ok ? 'var(--color-success)' : 'var(--color-error)'}
          />
          <text x={166} y={54} fontSize={13} textAnchor="middle" fill={ok ? OKINK : NGINK} fontWeight={700}>
            {ok ? '✓ OK' : '✕ NG'}
          </text>
          <path d="M 194 49 L 222 49" stroke={MUTED} />
          <GBox x={224} y={34} w={84} h={30} text={purpose === 'order' ? '注文の処理' : '広告の送付'} fs={9.5} />
          <text x={160} y={16} fontSize={10} textAnchor="middle" fill={MUTED}>
            取得した目的の範囲内で管理する
          </text>
          <text x={160} y={94} fontSize={10} textAnchor="middle" fill={ok ? OKINK : NGINK} fontWeight={700}>
            {ok ? '＋ 暗号化やアクセス制御で漏えいを防ぐ' : '目的外利用・無同意・むやみの社内共有は不適切'}
          </text>
          <text x={160} y={112} fontSize={9} textAnchor="middle" fill={MUTED}>
            暗号化は管理の手段の一つで、同意を不要にするものではない
          </text>
        </svg>
      </View>
    </FigShell>
  )
}

/* ---------- q-soc-8: 情報の信ぴょう性 ---------- */

const SOC8_CHECKS = ['出所（どこから出た情報か）を確認', '配信日時を確認', '一次情報か二次情報かを見分ける', '複数の情報源で照合'] as const

export function SocFig8() {
  const [checks, setChecks] = useState([false, false, false, false])
  const n = checks.filter(Boolean).length
  return (
    <FigShell
      title="図解: 共有する前のチェックリスト"
      status={n === 4 ? '確認が十分。出所・日時・一次情報か、複数源の照合ができている。' : `まだ${4 - n}項目、確認できていない。共有せずに確かめよう。`}
    >
      <Col>
        {SOC8_CHECKS.map((text, i) => (
          <div key={text} className={styles.ctrl}>
            <Btn on={checks[i]} ariaPressed={checks[i]} onClick={() => setChecks((prev) => prev.map((v, j) => (j === i ? !v : v)))}>
              {checks[i] ? '✓' : '□'}
            </Btn>
            <span className={styles.status}>{text}</span>
          </div>
        ))}
      </Col>
      <div className={styles.barRow}>
        <span className={styles.barLabel}>確認の進み</span>
        <span className={styles.barTrack}>
          <span className={styles.barFill} style={{ width: `${(n / 4) * 100}%` }} />
        </span>
        <span className={styles.barValue}>{n}/4</span>
      </div>
      <Note>「共有数が多い＝正しい」ではない。画像は加工されやすくはあるが、テキストより信頼できるとも限らない。</Note>
    </FigShell>
  )
}

/* ---------- q-soc-9: 情報システムの5要素 ---------- */

const SYS5 = [
  { k: '人', ex: 'レジを打つ店員・運用を支える担当者' },
  { k: '機器', ex: 'POS端末・バーコードリーダ・サーバ' },
  { k: '技術', ex: 'データベース・通信技術' },
  { k: '手順', ex: '開店前の点検・レジ締めの手順' },
  { k: '法規', ex: '個人情報保護法などの法令・社内規程' },
]

export function SocFig9() {
  const [sel, setSel] = useState(0)
  return (
    <FigShell title="図解: 5要素をPOSシステムで見てみる" status={`${SYS5[sel].k} の、この分野の例: ${SYS5[sel].ex}`}>
      <Segmented
        label="情報システムの要素"
        value={String(sel)}
        options={SYS5.map((v, i) => ({ value: String(i), label: v.k }))}
        onChange={(v) => setSel(Number(v))}
      />
      <View label="情報システムは人・機器・技術・手順・法規の要素からなる">
        <svg viewBox="0 0 320 120" className={styles.svg}>
          <GBox x={98} y={8} w={124} h={28} text="情報システム" fs={10} fill={TINT} />
          <path d="M 160 36 L 160 52" stroke={MUTED} />
          {SYS5.map((v, i) => (
            <g key={v.k} onClick={() => setSel(i)} style={{ cursor: 'pointer' }}>
              <rect
                x={8 + i * 62}
                y={54}
                width={56}
                height={26}
                rx={7}
                fill={i === sel ? ACCENT : TINT}
                stroke={i === sel ? ACCENT : BORDER}
              />
              <text x={36 + i * 62} y={72} fontSize={11} textAnchor="middle" fill={i === sel ? '#fff' : LABEL} fontWeight={700}>
                {v.k}
              </text>
            </g>
          ))}
          <text x={160} y={106} fontSize={9.5} textAnchor="middle" fill={MUTED}>
            選択肢1の「五大装置」はコンピュータ本体の構成
          </text>
        </svg>
      </View>
      <Note>「人・機器・技術・手順・法規」が情報システム全体の要素。五つの装置（ハードウェア構成）や通信の構成、開発工程とは別物。</Note>
    </FigShell>
  )
}

/* ---------- q-soc-10: 問題解決のサイクル ---------- */

const SOLVE_STEPS = ['課題を把握', '情報を集める', '解決策を立案', '実行する', '評価・改善'] as const

export function SocFig10() {
  const [step, setStep] = useState(0)
  const last = step === SOLVE_STEPS.length - 1
  return (
    <FigShell
      title="図解: 解決の流れを1つずつ進める"
      status={last ? '評価の結果をふまえ、課題把握へ戻って改善（サイクル）。' : `${step + 1}/5: ${SOLVE_STEPS[step]} の段階。`}
    >
      <View label="課題把握 → 調査 → 立案 → 実行 → 評価の順路と、評価から課題把握への戻り矢印">
        <svg viewBox="0 0 320 120" className={styles.svg}>
          {SOLVE_STEPS.map((s, i) => {
            const x = 12 + (i % 3) * 104
            const y = 12 + Math.floor(i / 3) * 56
            return (
              <g key={s}>
                <GBox
                  x={x}
                  y={y}
                  w={96}
                  h={36}
                  text={s}
                  fs={9.5}
                  fill={i <= step ? ACCENT : TINT}
                  stroke={i <= step ? ACCENT : BORDER}
                  ink={i <= step ? '#fff' : MUTED}
                  bold={i === step}
                />
                {i < 2 && <path d={`M ${x + 98} ${y + 18} L ${x + 104} ${y + 18}`} stroke={MUTED} />}
              </g>
            )
          })}
          <path
            d="M 140 118 C 60 132 4 70 58 14"
            stroke={last ? ACCENT : MUTED}
            strokeWidth={last ? 2.5 : 1.2}
            fill="none"
            strokeDasharray="4 3"
          />
          {last && <text x={96} y={116} fontSize={9} fill={ACCENT} fontWeight={700}>評価のつぎは課題へ戻る（改善）</text>}
        </svg>
      </View>
      <div className={styles.ctrl}>
        <Btn small onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
          ◀ 戻る
        </Btn>
        <Btn small onClick={() => setStep((s) => Math.min(SOLVE_STEPS.length - 1, s + 1))} disabled={last}>
          次へ ▶
        </Btn>
        <span className={styles.note}>実行した結果が正しい保証はない（選択肢3の誤り）。</span>
      </div>
    </FigShell>
  )
}

/* ---------- q-soc-11: アンケート設計 ---------- */

export function SocFig11() {
  const [leading, setLeading] = useState(false)
  const bars = leading ? [58, 14, 12, 16] : [30, 25, 30, 15]
  return (
    <FigShell
      title="図解: 選択肢の見せ方で回答が変わる"
      status={leading ? '誘導的な並び → 特定の答えに偏る（集計の信頼性が下がる）。' : '中性の並び → 回答が偏りにくく、選びやすい。'}
      statusKind={leading ? 'ng' : 'ok'}
    >
      <Segmented
        label="選択肢の見せ方"
        value={leading ? 'on' : 'off'}
        options={[
          { value: 'off' as const, label: '過不足なく中性に' },
          { value: 'on' as const, label: '一部だけ大きく目立たせる' },
        ]}
        onChange={(v) => setLeading(v === 'on')}
      />
      <View label="回答分布の変化を棒グラフで比べる">
        <svg viewBox="0 0 320 130" className={styles.svg}>
          <line x1={20} y1={92} x2={300} y2={92} stroke={BORDER} />
          {bars.map((h, i) => (
            <g key={i}>
              <rect
                x={24 + i * 70}
                y={92 - h}
                width={44}
                height={h}
                rx={3}
                fill={leading && i === 0 ? 'var(--color-error-tint)' : TINT}
                stroke={leading && i === 0 ? 'var(--color-error)' : ACCENT}
              />
              <text x={46 + i * 70} y={92 - h - 6} fontSize={10} textAnchor="middle" fill={LABEL} fontWeight={700}>
                {h}%
              </text>
              <text x={46 + i * 70} y={106} fontSize={9} textAnchor="middle" fill={MUTED}>
                {['満足', 'まあ満足', 'ふつう', '不満'][i]}
              </text>
            </g>
          ))}
          <text x={160} y={124} fontSize={9.5} textAnchor="middle" fill={NGINK} fontWeight={700}>
            {leading ? '目立った選択肢（満足）に答えが寄る' : 'まんべんなく回答が分かれる'}
          </text>
        </svg>
      </View>
      <Note>自由記述だけでは集計しにくく、配布と回収の差が大きい（低回答率）と対象が偏る。</Note>
    </FigShell>
  )
}

/* ---------- q-soc-12: 誹謗中傷への対応 ---------- */

const SOC12_ACTIONS = ['報復の投稿', 'そのまま拡散', '証拠を残して通報', '気にしない'] as const
const SOC12_RESULT: Record<(typeof SOC12_ACTIONS)[number], { ok: boolean; why: string }> = {
  報復の投稿: { ok: false, why: '事態が悪化し、自分も人格権の侵害に当たり得る。' },
  'そのまま拡散': { ok: false, why: '注目が集まるほど被害が広がる。' },
  証拠を残して通報: { ok: true, why: 'URL・日時を保存し、通報で対応を求め、必要なら法的措置も検討するのが適切。' },
  気にしない: { ok: false, why: '他人の投稿でも被害は続く。見つけたら記録・通報できる。' },
}

export function SocFig12() {
  const [act, setAct] = useState<(typeof SOC12_ACTIONS)[number]>('証拠を残して通報')
  const r = SOC12_RESULT[act]
  return (
    <FigShell title="図解: 対応の3段取り" status={r.why} statusKind={r.ok ? 'ok' : 'ng'}>
      <Segmented label="対応方法" value={act} options={SOC12_ACTIONS.map((a) => ({ value: a, label: a }))} onChange={setAct} />
      <View label="記録 → 通報 → 法的措置の3段取り">
        <svg viewBox="0 0 320 118" className={styles.svg}>
          {[
            { t: '1. 証拠を保存', s: 'URL・日時など' },
            { t: '2. 通報', s: '運営者に対応を求める' },
            { t: '3. 法的措置', s: '名誉権の侵害など' },
          ].map((b, i) => (
            <g key={b.t}>
              <GBox
                x={12 + i * 106}
                y={20}
                w={94}
                h={34}
                text={b.t}
                fs={9.5}
                bold
                fill={r.ok ? ACCENT : TINT}
                stroke={r.ok ? ACCENT : BORDER}
                ink={r.ok ? '#fff' : LABEL}
              />
              <text x={59 + i * 106} y={66} fontSize={8.5} textAnchor="middle" fill={MUTED}>
                {b.s}
              </text>
              {i < 2 && <path d={`M ${108 + i * 106} 37 L ${118 + i * 106} 37`} stroke={MUTED} />}
            </g>
          ))}
          <text x={160} y={96} fontSize={10.5} textAnchor="middle" fill={r.ok ? OKINK : NGINK} fontWeight={700}>
            不正な投稿は人格権（名誉権・プライバシー・肖像権）の侵害になり得る
          </text>
          <text x={160} y={112} fontSize={8.5} textAnchor="middle" fill={MUTED}>
            報復や拡散は事態を悪化させるだけ
          </text>
        </svg>
      </View>
    </FigShell>
  )
}

/* ---------- q-soc-13: サンプリング定理 ---------- */

export function SocFig13() {
  const [fs, setFs] = useState(30)
  const ok = fs >= 40
  const points = Math.max(3, Math.round((fs / 60) * 16))
  const xs = Array.from({ length: points }, (_, i) => 16 + (i * 288) / (points - 1))
  return (
    <FigShell
      title="図解: 標本化周波数を上げてみる"
      status={ok ? `${fs}kHz ≥ 2×20kHz → 音の成分をほぼ完全に再現できる。` : `${fs}kHz < 40kHz → 20kHzの成分を再現できない。`}
      statusKind={ok ? 'ok' : 'ng'}
    >
      <View label={`標本化周波数${fs}kHzで上限20kHzの音を拾う様子`}>
        <svg viewBox="0 0 320 122" className={styles.svg}>
          <path d="M 16 60 Q 52 4 88 60 T 160 60 T 232 60 T 304 60" stroke={MUTED} strokeWidth={1.5} fill="none" />
          <line x1={16} y1={60} x2={304} y2={60} stroke={BORDER} />
          {xs.map((x, i) => (
            <circle key={i} cx={x} cy={60 - 44 * Math.sin(i * 2.5)} r={3.5} fill={ok ? 'var(--color-success)' : 'var(--color-error)'} />
          ))}
          <text x={160} y={100} fontSize={10} textAnchor="middle" fill={ok ? OKINK : NGINK} fontWeight={700}>
            {ok ? 'サンプル点が元の波を忠実に拾えている' : 'サンプル点が疎で、別の低い波と見分けがつかない'}
          </text>
          <text x={160} y={116} fontSize={9} textAnchor="middle" fill={MUTED}>
            音の上限 20kHz ／ 標本化 {fs}kHz
          </text>
        </svg>
      </View>
      <Slider label="標本化周波数 [kHz]" value={fs} min={10} max={60} step={5} onChange={setFs} />
      <Calc
        parts={[
          { k: '求める最小値', v: '40 kHz（2倍）', strong: true },
          { k: '選んだ値', v: `${fs} kHz`, ok, ng: !ok },
          { k: '44.1kHz (CD)', v: '条件を満たす値の一つ' },
        ]}
      />
    </FigShell>
  )
}

/* ---------- q-soc-14: 量子化ビット数 ---------- */

export function SocFig14() {
  const [bits, setBits] = useState(2)
  const levels = 2 ** bits
  const step = 82 / Math.max(1, levels - 1)
  const stair = Array.from({ length: levels }, (_, i) => i)
  return (
    <FigShell
      title="図解: 量子化ビット数を増やす"
      status={`${bits}ビット → ${levels}段階。段階が増えるほど原音に近づき、データ量は増える。`}
    >
      <Slider label="量子化ビット数 [bit]" value={bits} min={1} max={5} step={1} onChange={setBits} fmt={(v) => `${v} bit（${2 ** v}段階）`} />
      <View label={`量子化ビット数${bits}ビットで音量の段階を表す様子`}>
        <svg viewBox="0 0 320 124" className={styles.svg}>
          <path d="M 16 112 Q 60 24 100 112 T 184 112 T 268 112 L 304 112" stroke={MUTED} strokeWidth={1.5} fill="none" strokeDasharray="4 3" />
          {stair.map((i) => (
            <line key={i} x1={16} y1={112 - i * step} x2={304} y2={112 - i * step} stroke={BORDER} strokeDasharray="2 4" opacity={0.4} />
          ))}
          <path
            d={`M 16 112 ${stair
              .map((i) => `L ${16 + (i * 288) / Math.max(1, levels - 1)} ${112 - i * step}`)
              .join(' ')}`}
            stroke={ACCENT}
            strokeWidth={2}
            fill="none"
          />
          <text x={160} y={122} fontSize={9.5} textAnchor="middle" fill={MUTED}>
            {levels}段階の音量を表せる（1標本あたり {bits} ビット）
          </text>
        </svg>
      </View>
      <Calc
        parts={[
          { k: '音質', v: bits >= 4 ? '原音に近い（滑らか）' : bits === 3 ? 'やや細かい' : '粗い（階段状）', strong: true },
          { k: 'データ量', v: bits >= 4 ? '大きい' : bits === 3 ? 'ふつう' : '少ない' },
        ]}
      />
      <Note>量子化ビット数と標本化周波数（1秒あたりの標本数）は別の概念。ビット数を増やしてもサンプリング周波数は変わらない。</Note>
    </FigShell>
  )
}

/* ---------- q-soc-15: 解像度 ---------- */

export function SocFig15() {
  const [k4, setK4] = useState(false)
  /** FHD: 5×3個の大きい画素 / 4K: 10×6個の半分の大きさの画素（=4倍） */
  const cols = k4 ? 10 : 5
  const rows = k4 ? 6 : 3
  const cell = k4 ? 13 : 26
  const cells = Array.from({ length: cols * rows }, (_, idx) => ({
    i: idx % cols,
    j: Math.floor(idx / cols),
  }))
  return (
    <FigShell
      title="図解: 同じ画面だと、1画素の大きさは半分に"
      status={k4 ? '3840×2160 = 画素数4倍。1画素の1辺は半分 → 細かく表示できる。' : '1920×1080。1画素は大きく、表示は粗め。'}
    >
      <Segmented
        label="ディスプレイの解像度"
        value={k4 ? '4k' : 'fhd'}
        options={[
          { value: 'fhd' as const, label: '1920×1080' },
          { value: '4k' as const, label: '3840×2160' },
        ]}
        onChange={(v) => setK4(v === '4k')}
      />
      <View label="同じ画面面積に対する1画素の見かけの大きさ">
        <svg viewBox="0 0 320 128" className={styles.svg}>
          <rect x={16} y={8} width={196} height={98} rx={6} fill="var(--color-card)" stroke={BORDER} />
          {cells.map(({ i, j }) => (
            <rect
              key={`${i}-${j}`}
              x={24 + i * (cell + 1)}
              y={16 + j * (cell + 1)}
              width={cell}
              height={cell}
              rx={1.5}
              fill={TINT}
              stroke={BORDER}
            />
          ))}
          <GBox x={226} y={24} w={82} h={26} text={k4 ? '1辺 半分' : '1辺 大きめ'} fs={9.5} bold />
          <GBox x={226} y={58} w={82} h={26} text={k4 ? '画素数 ×4' : '画素数 ×1'} fs={9.5} fill={k4 ? 'var(--color-success-tint)' : TINT} stroke={k4 ? 'var(--color-success)' : ACCENT} ink={k4 ? OKINK : MUTED} />
        </svg>
      </View>
      <Calc
        parts={[
          { k: '画素数', v: k4 ? '約829万（×4）' : '約207万' },
          { k: 'データ量(24bit/px)', v: k4 ? '約24MB' : '約6MB' },
        ]}
      />
      <Note>色の数やフレームレートは解像度とは別の指標で、変わらない。</Note>
    </FigShell>
  )
}

/* ---------- q-soc-16: 可逆・不可逆圧縮 ---------- */

const SOC16 = {
  lossless: { skip: 2, rate: '低い', restored: true, ex: 'ZIP / PNG' },
  lossy: { skip: 4, rate: '高い', restored: false, ex: 'JPEG / MP3' },
} as const

export function SocFig16() {
  const [kind, setKind] = useState<'lossless' | 'lossy'>('lossless')
  const v = SOC16[kind]
  return (
    <FigShell
      title="図解: 圧縮の方式で、戻し方が変わる"
      status={v.restored ? '可逆圧縮: 情報を捨てないので、完全に元どおりに戻る。' : '不可逆圧縮: 情報の一部を捨てるため、完全には元に戻せない。'}
    >
      <Segmented
        label="圧縮方式"
        value={kind}
        options={[
          { value: 'lossless' as const, label: '可逆（ZIP / PNG）' },
          { value: 'lossy' as const, label: '不可逆（JPEG / MP3）' },
        ]}
        onChange={setKind}
      />
      <View label="圧縮後のデータ量と、復元の可否">
        <svg viewBox="0 0 320 122" className={styles.svg}>
          <GBox x={16} y={8} w={130} h={26} text="圧縮前: 全部の情報" fs={9.5} />
          <path d="M 66 36 L 96 46" stroke={MUTED} />
          <GBox
            x={98}
            y={46}
            w={(v.restored ? 120 : 92)}
            h={26}
            text={v.restored ? '圧縮後: 情報はまちがいないまま' : '圧縮後: 情報の一部を捨てた'}
            fs={8.5}
            fill="var(--color-warning-tint)"
            stroke="var(--color-warning)"
            ink="var(--color-warning-ink)"
          />
          <rect
            x={200}
            y={40}
            width={104}
            height={34}
            rx={8}
            fill={v.restored ? 'var(--color-success-tint)' : 'var(--color-error-tint)'}
            stroke={v.restored ? 'var(--color-success)' : 'var(--color-error)'}
          />
          <text x={252} y={55} fontSize={10} textAnchor="middle" fill={v.restored ? OKINK : NGINK} fontWeight={700}>
            {v.restored ? '完全復元 OK' : '完全には戻せない'}
          </text>
          <text x={252} y={68} fontSize={8} textAnchor="middle" fill={MUTED}>
            {v.ex}
          </text>
          <text x={160} y={94} fontSize={10} textAnchor="middle" fill={LABEL} fontWeight={700}>
            圧縮率は {v.rate}（保持する情報が多い → データ量が大きい）
          </text>
        </svg>
      </View>
      <Note>不可逆圧縮は、「人が感じにくい情報」を捨てて圧縮率を上げる。用途に合わせて使い分ける（不可逆は画像・音声・動画に広く使われる）。</Note>
    </FigShell>
  )
}

/* ---------- q-soc-17: ユニバーサルデザイン ---------- */

export function SocFig17() {
  const [big, setBig] = useState(true)
  const [cont, setCont] = useState(true)
  return (
    <FigShell
      title="図解: ユーザーが調整して、全員が使いやすいように"
      status={`大きな文字: ${big ? 'あり' : 'なし'} ／ よく見える配色: ${cont ? 'あり' : 'なし'}`}
    >
      <View label="設定の変化で、同じ画面が読みやすくなる様子">
        <svg viewBox="0 0 320 124" className={styles.svg}>
          <rect x={24} y={8} width={180} height={108} rx={10} fill="var(--color-card)" stroke={BORDER} />
          <rect x={40} y={24} width={148} height={40} rx={6} fill={cont ? 'var(--color-card)' : 'var(--color-warning-tint)'} stroke={BORDER} />
          <text x={50} y={46} fontSize={big ? 13 : 10} fill={cont ? 'var(--color-label)' : 'var(--color-warning-ink)'} fontWeight={700}>
            ご注文へ進む
          </text>
          <text x={50} y={82} fontSize={big ? 10 : 8} fill={MUTED}>
            {cont ? '説明文字もはっきり見える' : '薄い色で読みにくい'}
          </text>
          <GBox x={216} y={20} w={92} h={26} text={big ? '文字: 大きい' : '文字: 小さい'} fs={8.5} fill={TINT} />
          <GBox x={216} y={56} w={92} h={26} text={cont ? 'コントラスト: 高い' : 'コントラスト: 低い'} fs={8} fill={cont ? TINT : 'var(--color-warning-tint)'} stroke={cont ? ACCENT : 'var(--color-warning)'} />
        </svg>
      </View>
      <div className={styles.ctrl}>
        <Btn on={big} ariaPressed={big} onClick={() => setBig((v) => !v)}>
          大きい文字
        </Btn>
        <Btn on={cont} ariaPressed={cont} onClick={() => setCont((v) => !v)}>
          十分なコントラスト
        </Btn>
      </div>
      <Note>UDは「特定の人向けの別画面」に頼らず、そのまま全員（年齢や能力の違いを含め）が使いやすい設計を基本に置く考え方。</Note>
    </FigShell>
  )
}

/* ---------- q-soc-18: データ量の計算 ---------- */

export function SocFig18() {
  const [mul, setMul] = useState(1)
  const [bits, setBits] = useState(24)
  const px = 1920 * 1080 * mul * mul
  const mb = (px * bits) / 8 / 1_000_000
  return (
    <FigShell
      title="図解: データ量 = 画素数 × 1画素あたりのバイト数"
      status={`約${mb.toFixed(1)}MB（${1920 * mul}×${1080 * mul}画素、1画素${bits / 8}バイト）`}
    >
      <Slider label="画像の倍率（FHDの何倍か）" value={mul} min={1} max={4} step={1} onChange={setMul} fmt={(v) => `×${v}`} />
      <Segmented
        label="1画素のデータ量"
        value={String(bits)}
        options={[
          { value: '8' as const, label: '8ビット（1バイト）' },
          { value: '24' as const, label: '24ビット（3バイト）' },
        ]}
        onChange={(v) => setBits(Number(v))}
      />
      <View label="計算の構成分解">
        <svg viewBox="0 0 320 104" className={styles.svg}>
          <GBox x={16} y={14} w={130} h={28} text={`${(1920 * mul).toLocaleString()} × ${(1080 * mul).toLocaleString()} 画素`} fs={9} />
          <text x={156} y={33} fontSize={12} fill={MUTED}>
            ×
          </text>
          <GBox x={170} y={14} w={134} h={28} text={`1画素 ${bits / 8} バイト`} fs={9} />
          <GBox x={80} y={56} w={160} h={30} text={`≈ ${mb.toFixed(1)} MB`} fs={12} bold rx={10} fill={ACCENT} ink="#fff" />
        </svg>
      </View>
      <div className={styles.ctrl}>
        <Calc
          parts={[
            { k: '選択肢1', v: '約0.6MB', ng: Math.abs(mb - 0.6) < 1.5 },
            { k: '選択肢2', v: '約6MB', ok: Math.abs(mb - 6) < 2 },
            { k: '選択肢3', v: '約24MB' },
            { k: '選択肢4', v: '約62MB' },
          ]}
        />
      </div>
      <Note>FHD・24ビットなら 1920×1080×3 ≈ 6.2MB。MBを100万バイトでも1048576バイトでも、答えは「約6MB」。</Note>
    </FigShell>
  )
}

export const SOC_FIGURES = {
  'q-soc-1': SocFig1,
  'q-soc-2': SocFig2,
  'q-soc-3': SocFig3,
  'q-soc-4': SocFig4,
  'q-soc-5': SocFig5,
  'q-soc-6': SocFig6,
  'q-soc-7': SocFig7,
  'q-soc-8': SocFig8,
  'q-soc-9': SocFig9,
  'q-soc-10': SocFig10,
  'q-soc-11': SocFig11,
  'q-soc-12': SocFig12,
  'q-soc-13': SocFig13,
  'q-soc-14': SocFig14,
  'q-soc-15': SocFig15,
  'q-soc-16': SocFig16,
  'q-soc-17': SocFig17,
  'q-soc-18': SocFig18,
} as const
