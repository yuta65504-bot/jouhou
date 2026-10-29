import { dnclProgramsSchema, type DnclProgram } from './schema'

/**
 * DNCL風サブセットのサンプルプログラム。
 * ※DNCL（授業で用いる擬似言語）の構文を参考にした図解用の簡易サブセットであり、
 * 　正式なDNCLの全構文を網羅するものではない（監修時に校正する）。
 */
export const dnclPrograms: DnclProgram[] = dnclProgramsSchema.parse([
  {
    id: 'sum',
    title: '合計と平均',
    note: '1から5までの合計を求め、その平均を出す。',
    lines: [
      'total ← 0',
      'i を 1 から 5 まで 増やしながら 繰り返す:',
      '    total ← total + i',
      '繰り返しここまで',
      'mean ← total ÷ 5',
    ],
  },
  {
    id: 'count-even',
    title: '偶数を数える',
    note: '条件分岐（if … then … end）を使って、偶数の個数を数える。',
    lines: [
      'count ← 0',
      'i を 1 から 6 まで 増やしながら 繰り返す:',
      '    if i % 2 = 0 then',
      '        count ← count + 1',
      '    end',
      '繰り返しここまで',
    ],
  },
  {
    id: 'infinite',
    title: '無限ループの例',
    note: 'i を増やす行がないため、条件が永遠に真のまま。自動再生を続けると「エラー（無限ループの可能性）」になる。',
    lines: [
      'sum ← 0',
      'i ← 1',
      'i ≤ 5 の間 繰り返す:',
      '    sum ← sum + i',
      '繰り返しここまで',
    ],
  },
])
