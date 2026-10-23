/**
 * SVG図解レジストリ（仕様書 §2: 図表はすべて自作）
 * - 文字選択・拡大・読み上げに有利なよう Canvas ではなく SVG + DOM で描く
 * - 各図に role="img" + aria-label（または <title>/<desc>）を付与（§10）
 */
import type { FC } from 'react'

const LABEL = 'var(--color-label)'
const MUTED = 'var(--color-secondary-label)'
const ACCENT = 'var(--color-accent)'
const BORDER = 'var(--color-border)'
const TINT = 'var(--color-accent-tint)'

const Bit = ({ x, y, v }: { x: number; y: number; v: 0 | 1 }) => (
  <g>
    <rect x={x} y={y} width={16} height={16} rx={3} fill={v ? ACCENT : TINT} stroke={BORDER} />
    <text x={x + 8} y={y + 12} fontSize={10} textAnchor="middle" fill={v ? '#fff' : LABEL}>
      {v}
    </text>
  </g>
)

const bitRow = (x0: number, y: number, bits: (0 | 1)[]) =>
  bits.map((v, i) => <Bit key={i} x={x0 + i * 20} y={y} v={v} />)

const DigitalData: FC = () => (
  <svg viewBox="0 0 200 120" role="img" aria-label="画素の集まり（画像）と、それを0と1の並びで表した様子">
    <title>デジタルデータ</title>
    <desc>画像は小さな点（画素）の集まりで、各点の明るさや色を数値化して0と1の列で記録される。</desc>
    {Array.from({ length: 16 }, (_, i) => (
      <rect
        key={i}
        x={40 + (i % 4) * 20}
        y={16 + Math.floor(i / 4) * 20}
        width={18}
        height={18}
        rx={2}
        fill={[1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1][i] ? ACCENT : TINT}
        stroke={BORDER}
      />
    ))}
    <text x={100} y={88} fontSize={10} textAnchor="middle" fill={MUTED}>
      ↓ 数値化して記録
    </text>
    {bitRow(28, 98, [1, 0, 1, 1, 0, 1, 0, 1])}
  </svg>
)

const Encryption: FC = () => (
  <svg viewBox="0 0 200 120" role="img" aria-label="平文が鍵で暗号文に変換され、鍵で元に戻る流れ">
    <title>暗号化</title>
    <desc>平文は鍵を使って暗号文に変換され、鍵を持つ人だけが元に戻せる。</desc>
    <rect x={10} y={40} width={52} height={26} rx={5} fill={TINT} stroke={BORDER} />
    <text x={36} y={57} fontSize={10} textAnchor="middle" fill={LABEL}>
      もとの文
    </text>
    <text x={78} y={57} fontSize={14} textAnchor="middle" fill={ACCENT}>
      →
    </text>
    <rect x={88} y={40} width={58} height={26} rx={5} fill={TINT} stroke={BORDER} />
    <text x={117} y={57} fontSize={12} textAnchor="middle" fill={ACCENT}>
      $#x&amp;9
    </text>
    <text x={160} y={57} fontSize={14} textAnchor="middle" fill={ACCENT}>
      →
    </text>
    <rect x={170} y={44} width={22} height={18} rx={3} fill={ACCENT} />
    <text x={181} y={58} fontSize={11} textAnchor="middle" fill="#fff">
      鍵
    </text>
    <text x={100} y={92} fontSize={10} textAnchor="middle" fill={MUTED}>
      鍵を持つ人だけが読める
    </text>
  </svg>
)

const Copyright: FC = () => (
  <svg viewBox="0 0 200 120" role="img" aria-label="著作権表示と、無断転載が禁止であることの図">
    <title>著作権</title>
    <desc>作品には©の権利があり、作者の許諾のない転載は原則禁止。</desc>
    <rect x={55} y={18} width={90} height={60} rx={6} fill={TINT} stroke={BORDER} />
    <text x={100} y={46} fontSize={18} textAnchor="middle" fill={ACCENT}>
      ©
    </text>
    <text x={100} y={62} fontSize={9} textAnchor="middle" fill={LABEL}>
      作者の作品
    </text>
    <circle cx={100} cy={100} r={13} fill="none" stroke="var(--color-error)" strokeWidth={2.5} />
    <line x1={91} y1={109} x2={109} y2={91} stroke="var(--color-error)" strokeWidth={2.5} />
    <text x={130} y={105} fontSize={10} fill="var(--color-error-ink)">
      無断転載は禁止
    </text>
  </svg>
)

const BitFig: FC = () => (
  <svg viewBox="0 0 200 120" role="img" aria-label="8個のビットが並んだビット列。1ビットは0か1のどちらか">
    <title>ビット</title>
    <desc>1ビットは0か1を表す最小単位。8ビットで256通りの状態を表せる。</desc>
    {bitRow(28, 40, [1, 0, 1, 1, 0, 0, 1, 0])}
    <text x={100} y={84} fontSize={10} textAnchor="middle" fill={MUTED}>
      8ビット = 2の8乗 = 256通り
    </text>
  </svg>
)

const Binary: FC = () => (
  <svg viewBox="0 0 200 120" role="img" aria-label="2進数の各桁の重み。8と2と1が立っているので11を表す">
    <title>2進数</title>
    <desc>上の桁ほど重みが2倍になる。1011は8+2+1で10進数の11。</desc>
    {bitRow(48, 30, [1, 0, 1, 1])}
    <text x={58} y={70} fontSize={10} textAnchor="middle" fill={MUTED}>
      8
    </text>
    <text x={78} y={70} fontSize={10} textAnchor="middle" fill={MUTED}>
      4
    </text>
    <text x={98} y={70} fontSize={10} textAnchor="middle" fill={MUTED}>
      2
    </text>
    <text x={118} y={70} fontSize={10} textAnchor="middle" fill={MUTED}>
      1
    </text>
    <text x={100} y={98} fontSize={11} textAnchor="middle" fill={LABEL}>
      8 + 2 + 1 = 11
    </text>
  </svg>
)

const Packet: FC = () => (
  <svg viewBox="0 0 200 120" role="img" aria-label="大きなデータを3つのパケットに分割して送る様子">
    <title>パケット</title>
    <desc>大きなデータは小さな塊に分けて送られる。各パケットには宛先と順番が記録される。</desc>
    <rect x={64} y={12} width={72} height={22} rx={5} fill={TINT} stroke={BORDER} />
    <text x={100} y={27} fontSize={10} textAnchor="middle" fill={LABEL}>
      データ
    </text>
    {[0, 1, 2].map((i) => (
      <g key={i}>
        <text x={100} y={52} fontSize={11} textAnchor="middle" fill={ACCENT}>
          ↓
        </text>
        <rect x={16 + i * 60} y={58} width={50} height={30} rx={5} fill={TINT} stroke={BORDER} />
        <text x={41 + i * 60} y={72} fontSize={9} textAnchor="middle" fill={LABEL}>
          {i + 1}番目
        </text>
        <text x={41 + i * 60} y={83} fontSize={8} textAnchor="middle" fill={MUTED}>
          宛先つき
        </text>
      </g>
    ))}
    <text x={100} y={110} fontSize={10} textAnchor="middle" fill={MUTED}>
      分けて送ると、一部分だけ送り直せる
    </text>
  </svg>
)

const Network: FC = () => (
  <svg viewBox="0 0 200 120" role="img" aria-label="3台の機器がルーターを通じてつながっている様子。各機器にIPアドレスが割り当てられている">
    <title>IPアドレス</title>
    <desc>ネットワーク上の機器には住所のような番号（IPアドレス）が付く。ドメイン名との対応はDNSが管理する。</desc>
    <circle cx={100} cy={58} r={17} fill={ACCENT} />
    <text x={100} y={62} fontSize={9} textAnchor="middle" fill="#fff">
      ルータ
    </text>
    {[
      { x: 26, y: 24, ip: '…1' },
      { x: 26, y: 88, ip: '…2' },
      { x: 140, y: 58, ip: '…3' },
    ].map((m) => (
      <g key={m.ip}>
        <line x1={m.x + 44} y1={m.y + 12} x2={m.x < 100 ? 84 : 116} y2={58} stroke={BORDER} />
        <rect x={m.x} y={m.y} width={44} height={24} rx={5} fill={TINT} stroke={BORDER} />
        <text x={m.x + 22} y={m.y + 16} fontSize={9} textAnchor="middle" fill={LABEL}>
          端末{m.ip}
        </text>
      </g>
    ))}
  </svg>
)

const Variable: FC = () => (
  <svg viewBox="0 0 200 120" role="img" aria-label="変数xという箱に、x = 2 + 3 の代入で値5が入る様子">
    <title>変数</title>
    <desc>変数は値を入れておく箱。代入で中身が入れ替わる。</desc>
    <text x={52} y={44} fontSize={13} textAnchor="middle" fill={LABEL}>
      x
    </text>
    <rect x={40} y={52} width={48} height={34} rx={6} fill={TINT} stroke={ACCENT} strokeWidth={2} />
    <text x={64} y={74} fontSize={15} textAnchor="middle" fill={LABEL}>
      5
    </text>
    <text x={118} y={66} fontSize={13} fill={LABEL}>
      = 2 + 3
    </text>
    <text x={100} y={104} fontSize={10} textAnchor="middle" fill={MUTED}>
      箱の中身はいつでも入れ替えられる
    </text>
  </svg>
)

const Branch: FC = () => (
  <svg viewBox="0 0 200 120" role="img" aria-label="条件分岐の流れ図。条件が真のときと偽のときで実行する処理が分かれる">
    <title>条件分岐</title>
    <desc>「もし 条件 ならば:」で、真のときと偽のときの処理に分かれる。</desc>
    <rect x={60} y={10} width={80} height={24} rx={12} fill={ACCENT} />
    <text x={100} y={26} fontSize={10} textAnchor="middle" fill="#fff">
      条件は正しい？
    </text>
    <line x1={78} y1={34} x2={54} y2={54} stroke={LABEL} />
    <line x1={122} y1={34} x2={146} y2={54} stroke={LABEL} />
    <text x={62} y={50} fontSize={9} fill="var(--color-success-ink)">
      真
    </text>
    <text x={126} y={50} fontSize={9} fill="var(--color-error-ink)">
      偽
    </text>
    <rect x={24} y={60} width={62} height={26} rx={5} fill={TINT} stroke={BORDER} />
    <text x={55} y={77} fontSize={10} textAnchor="middle" fill={LABEL}>
      真の処理
    </text>
    <rect x={114} y={60} width={62} height={26} rx={5} fill={TINT} stroke={BORDER} />
    <text x={145} y={77} fontSize={10} textAnchor="middle" fill={LABEL}>
      偽の処理
    </text>
  </svg>
)

const Loop: FC = () => (
  <svg viewBox="0 0 200 120" role="img" aria-label="繰り返しの流れ図。条件が真の間、処理を回り続ける">
    <title>繰り返し</title>
    <desc>指定した範囲の間、同じ処理をくり返す。条件が真のまま終わらないと無限ループになる。</desc>
    <rect x={64} y={16} width={72} height={24} rx={5} fill={ACCENT} />
    <text x={100} y={32} fontSize={10} textAnchor="middle" fill="#fff">
      1から5まで
    </text>
    <path d="M 100 44 L 100 56" stroke={LABEL} fill="none" />
    <rect x={58} y={58} width={84} height={26} rx={5} fill={TINT} stroke={BORDER} />
    <text x={100} y={75} fontSize={10} textAnchor="middle" fill={LABEL}>
      繰り返す処理
    </text>
    <path d="M 142 71 C 178 71 178 28 136 26" stroke={ACCENT} fill="none" strokeWidth={2} />
    <path d="M 136 26 l 8 -2 l -3 8 z" fill={ACCENT} />
  </svg>
)

const Average: FC = () => (
  <svg viewBox="0 0 200 120" role="img" aria-label="3本の棒グラフと、平均の高さを示す点線">
    <title>平均値</title>
    <desc>全部の値を足して個数で割った高さが平均。点線が平均の位置。</desc>
    <line x1={20} y1={94} x2={180} y2={94} stroke={BORDER} />
    {[
      { x: 44, h: 50 },
      { x: 90, h: 30 },
      { x: 136, h: 60 },
    ].map((b) => (
      <rect key={b.x} x={b.x} y={94 - b.h} width={26} height={b.h} rx={3} fill={TINT} stroke={BORDER} />
    ))}
    <line x1={16} y1={94 - 46} x2={184} y2={94 - 46} stroke={ACCENT} strokeDasharray="4 3" />
    <text x={184} y={44} fontSize={9} textAnchor="end" fill={ACCENT}>
      平均
    </text>
  </svg>
)

const Median: FC = () => (
  <svg viewBox="0 0 200 120" role="img" aria-label="5つの値を大きさ順に並べ、中央の値を強調した図">
    <title>中央値</title>
    <desc>大きさ順に並べて、ちょうど真ん中の値を取る。極端な値の影響を受けにくい。</desc>
    {['2', '3', '5', '7', '12'].map((v, i) => (
      <g key={v}>
        <rect
          x={22 + i * 32}
          y={40}
          width={24}
          height={30}
          rx={4}
          fill={i === 2 ? ACCENT : TINT}
          stroke={i === 2 ? ACCENT : BORDER}
        />
        <text x={34 + i * 32} y={60} fontSize={11} textAnchor="middle" fill={i === 2 ? '#fff' : LABEL}>
          {v}
        </text>
      </g>
    ))}
    <text x={100} y={94} fontSize={10} textAnchor="middle" fill={ACCENT}>
      中央 = 5
    </text>
  </svg>
)

const TruncatedAxis: FC = () => (
  <svg viewBox="0 0 200 120" role="img" aria-label="同じデータの棒グラフ2つ。左は縦軸0から、右は縦軸50から始まるため、右は変化が大きく見える">
    <title>グラフの見せ方</title>
    <desc>同じデータでも、縦軸の始まりが0なら変化は小さく、50からなら大きく見える。</desc>
    {[
      { x: 12, base: 96, from: '0から', height: (v: number) => v * 0.6 },
      { x: 106, base: 96, from: '50から', height: (v: number) => (v - 50) * 3 },
    ].map((g) => {
      const vals = [55, 60, 58, 65]
      return (
        <g key={g.x}>
          {vals.map((v, i) => {
            const h = g.height(v)
            return (
              <rect
                key={i}
                x={g.x + 6 + i * 19}
                y={g.base - h}
                width={13}
                height={Math.max(2, h)}
                rx={2}
                fill={TINT}
                stroke={BORDER}
              />
            )
          })}
          <line x1={g.x} y1={g.base} x2={g.x + 82} y2={g.base} stroke={BORDER} />
          <text x={g.x + 41} y={110} fontSize={9} textAnchor="middle" fill={MUTED}>
            縦軸{g.from}
          </text>
        </g>
      )
    })}
  </svg>
)

const REGISTRY: Record<string, FC> = {
  'digital-data': DigitalData,
  encryption: Encryption,
  copyright: Copyright,
  bit: BitFig,
  binary: Binary,
  packet: Packet,
  network: Network,
  variable: Variable,
  branch: Branch,
  loop: Loop,
  average: Average,
  median: Median,
  'truncated-axis': TruncatedAxis,
}

export const FIGURE_IDS = Object.keys(REGISTRY)

export function Figure({ id, className }: { id: string; className?: string }) {
  const C = REGISTRY[id]
  if (!C) return null
  return (
    <div className={className}>
      <C />
    </div>
  )
}
