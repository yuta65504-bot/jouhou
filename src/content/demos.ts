import { demosSchema, type DemoMeta } from './schema'

/** デモのメタ情報（仕様書 §8）。表示コンポーネントは src/demos 配下で React.lazy により遅延読込 */
export const demos: DemoMeta[] = demosSchema.parse([
  {
    id: 'ui-compare',
    fieldId: 'society',
    title: 'UIの違いを比べる',
    summary: '自由記述だけの入力画面と選択式の入力画面を比べ、使われ方の違いを確かめる。',
    level: 'L1',
    quizId: 'q-soc-1',
  },
  {
    id: 'bit-ops',
    fieldId: 'network',
    title: 'ビット演算を試す',
    summary: '背景とキャラクターのビット列にAND/OR/XORを適用し、2値画像の見え方を確かめる。',
    level: 'L1',
    quizId: 'q-net-1',
  },
  {
    id: 'dncl-step',
    fieldId: 'programming',
    title: 'DNCLステップ実行',
    summary: 'DNCL風のプログラムを1手ずつ動かし、変数の値の変化を追いかける。',
    level: 'L2',
    quizId: 'q-pro-1',
  },
  {
    id: 'graph-explore',
    fieldId: 'data',
    title: 'グラフの見せ方を比べる',
    summary: '同じデータでもグラフの種類と縦軸の範囲で印象が変わることを確かめる。',
    level: 'L1',
    quizId: 'q-dat-2',
  },
])

export function getDemo(id: string): DemoMeta | undefined {
  return demos.find((d) => d.id === id)
}

export function demosByField(fieldId: string): DemoMeta[] {
  return demos.filter((d) => d.fieldId === fieldId)
}
