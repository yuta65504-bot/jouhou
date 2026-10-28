import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { LABS, labById, labsByField, pickTodaysLab } from '../src/labs'
import {
  binarySearchTrace,
  bitOp,
  bitsToValue,
  caesarShift,
  checksum,
  comparisonCounts,
  contrastRatio,
  fibCalls,
  fillMissing,
  grade,
  histogram,
  leastSquares,
  mean,
  median,
  mode,
  movingAverage,
  networkAddress,
  nyquistOk,
  parityOk,
  passwordCombinations,
  pearson,
  quantile,
  rleEncode,
  rollDice,
  seededRng,
  selectionSortPasses,
  simulatePackets,
  soundBytes,
  stddev,
  subnetHosts,
  subnetMask,
  sumTo,
  transferSeconds,
  type Rng,
} from '../src/labs/sim'
import { questionById } from '../src/content/questions'

const fixedRng = (values: number[]): Rng => {
  let i = 0
  return () => values[i++ % values.length]
}

describe('パケットロスのシミュレーション', () => {
  it('損失率0%なら全パケットが1回で届く', () => {
    const run = simulatePackets(12, 0, 3, seededRng(1))
    expect(run.firstTry).toBe(12)
    expect(run.retried).toBe(0)
    expect(run.failed).toBe(0)
    expect(run.sent).toBe(12)
  })

  it('損失率100%なら上限回数まで送って未達になる', () => {
    const run = simulatePackets(4, 100, 3, seededRng(1))
    expect(run.failed).toBe(4)
    expect(run.sent).toBe(12)
    expect(run.packets.every((p) => p.attempts === 3 && !p.delivered)).toBe(true)
  })

  it('失われたパケットだけ再送し、成功した回数を数える', () => {
    const run = simulatePackets(3, 50, 3, fixedRng([0.1, 0.9, 0.9, 0.1, 0.1, 0.1]))
    expect(run.packets[0]).toEqual({ id: 1, attempts: 2, delivered: true })
    expect(run.packets[1]).toEqual({ id: 2, attempts: 1, delivered: true })
    expect(run.packets[2]).toEqual({ id: 3, attempts: 3, delivered: false })
    expect(run.firstTry).toBe(1)
    expect(run.retried).toBe(1)
    expect(run.failed).toBe(1)
    expect(run.sent).toBe(6)
  })

  it('同じ種なら同じ結果になる', () => {
    expect(simulatePackets(20, 20, 3, seededRng(7))).toEqual(simulatePackets(20, 20, 3, seededRng(7)))
  })
})

describe('シーザー暗号', () => {
  it('英字をずらし、26で一周する', () => {
    expect(caesarShift('HELLO', 3)).toBe('KHOOR')
    expect(caesarShift('KHOOR', -3)).toBe('HELLO')
    expect(caesarShift('XYZ', 3)).toBe('ABC')
    expect(caesarShift('HELLO', 26)).toBe('HELLO')
  })

  it('小文字は小文字のまま、英字以外は変えない', () => {
    expect(caesarShift('Abc 123!', 1)).toBe('Bcd 123!')
  })
})

describe('探索の比較回数', () => {
  it('最悪の位置を探すときの回数を返す', () => {
    expect(comparisonCounts(16, 16)).toEqual({ linear: 16, binary: 5 })
    expect(comparisonCounts(1024, 1024)).toEqual({ linear: 1024, binary: 11 })
  })

  it('先頭に近い値は二分探索でもすぐ見つかる', () => {
    expect(comparisonCounts(100, 50).binary).toBe(1)
  })
})

describe('平均値と中央値', () => {
  it('偶数件の中央値は真ん中2つの平均', () => {
    expect(mean([2, 3, 3, 10])).toBe(4.5)
    expect(median([2, 3, 3, 10])).toBe(3)
    expect(median([1, 2, 3, 4])).toBe(2.5)
    expect(mean([])).toBe(0)
    expect(median([])).toBe(0)
  })

  it('元の配列を並べ替えない', () => {
    const values = [3, 1, 2]
    median(values)
    expect(values).toEqual([3, 1, 2])
  })
})

describe('色・圧縮・音の計算', () => {
  it('コントラスト比を返す', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBe(21)
    expect(contrastRatio('#ffffff', '#ffffff')).toBe(1)
    expect(contrastRatio('#767676', '#ffffff')).toBeGreaterThan(4.5)
  })

  it('ランレングス符号に置き換える', () => {
    expect(rleEncode('AAAAABBBCCDAA')).toEqual({
      encoded: '5A3B2C1D2A',
      original: 13,
      compressed: 10,
    })
    expect(rleEncode('')).toEqual({ encoded: '', original: 0, compressed: 0 })
    expect(rleEncode('AB').compressed).toBeGreaterThan(2)
  })

  it('音のデータ量をバイトで返す', () => {
    expect(soundBytes(44.1, 16, 1)).toBe(88200)
    expect(soundBytes(8, 8, 10)).toBe(80000)
  })
})

describe('ネットワークの計算', () => {
  it('ビット列を10進数に変換する', () => {
    expect(bitsToValue([1, 0, 1, 0])).toBe(10)
    expect(bitsToValue([1, 1, 1, 1, 1, 1, 1, 1])).toBe(255)
  })

  it('ビット演算を桁ごとに行う', () => {
    const a = [1, 0, 1, 0] as const
    const b = [1, 1, 0, 0] as const
    expect(bitOp(a, b, 'and')).toEqual([1, 0, 0, 0])
    expect(bitOp(a, b, 'or')).toEqual([1, 1, 1, 0])
    expect(bitOp(a, b, 'xor')).toEqual([0, 1, 1, 0])
  })

  it('転送時間とパスワードの組み合わせを返す', () => {
    expect(transferSeconds(100, 100)).toBe(8)
    expect(transferSeconds(100, 0)).toBe(Infinity)
    expect(passwordCombinations(8, 26)).toBe(26 ** 8)
    expect(passwordCombinations(8, 0)).toBe(0)
  })
})

describe('プログラムの計算', () => {
  it('合計・再帰呼び出し・判定を返す', () => {
    expect(sumTo(10)).toBe(55)
    expect(fibCalls(0)).toBe(1)
    expect(fibCalls(5)).toBe(15)
    expect(grade(80)).toBe('A')
    expect(grade(79)).toBe('B')
    expect(grade(40)).toBe('C')
    expect(grade(39)).toBe('D')
  })

  it('乱数でサイコロを振る', () => {
    const run = rollDice(3, fixedRng([0, 0.2, 0.999]))
    expect(run.counts).toEqual([1, 1, 0, 0, 0, 1])
    expect(run.mean).toBe(3)
  })
})

describe('データの集計', () => {
  it('階級に分ける', () => {
    expect(histogram([1, 2, 3, 4], 2)).toEqual([
      { start: 0, count: 1 },
      { start: 2, count: 2 },
      { start: 4, count: 1 },
    ])
    expect(histogram([], 10)).toEqual([])
  })

  it('四分位数と相関係数を返す', () => {
    expect(quantile([1, 2, 3, 4], 0.5)).toBe(2.5)
    expect(quantile([1, 2, 3, 4], 0.25)).toBe(1.75)
    expect(pearson([{ x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 3 }])).toBeCloseTo(1)
    expect(pearson([{ x: 1, y: 3 }, { x: 2, y: 2 }, { x: 3, y: 1 }])).toBeCloseTo(-1)
  })

  it('移動平均と欠損値の扱い', () => {
    expect(movingAverage([1, 2, 3], 2)).toEqual([1, 1.5, 2.5])
    expect(fillMissing([10, null, 20], 'drop')).toEqual([10, 20])
    expect(fillMissing([10, null, 20], 'zero')).toEqual([10, 0, 20])
    expect(fillMissing([10, null, 20], 'mean')).toEqual([10, 15, 20])
  })
})

describe('追加30本の計算', () => {
  it('標本化定理の条件を返す', () => {
    expect(nyquistOk(44100, 20000)).toBe(true)
    expect(nyquistOk(8000, 3000)).toBe(true)
    expect(nyquistOk(8000, 4000)).toBe(false)
  })

  it('パリティを検査する', () => {
    expect(parityOk([1, 0, 1, 1, 0, 0, 1, 0, 0], 'even')).toBe(true)
    expect(parityOk([1, 0, 1, 1, 0, 0, 1, 0, 1], 'even')).toBe(false)
    expect(parityOk([1, 0, 1, 1, 0, 0, 1, 0, 1], 'odd')).toBe(true)
  })

  it('サブネットのマスク・ネットワーク・ホスト数を返す', () => {
    expect(subnetMask(24)).toBe('255.255.255.0')
    expect(subnetMask(26)).toBe('255.255.255.192')
    expect(subnetHosts(24)).toBe(254)
    expect(subnetHosts(30)).toBe(2)
    expect(networkAddress('192.168.10.34', 24)).toBe('192.168.10.0')
    expect(networkAddress('10.1.2.3', 8)).toBe('10.0.0.0')
  })

  it('同じ文なら同じチェックサムになる', () => {
    expect(checksum('送金1000円')).toBe(checksum('送金1000円'))
    expect(checksum('送金1000円')).not.toBe(checksum('送金9000円'))
    expect(checksum('abc')).toHaveLength(4)
  })

  it('二分探索で比べた位置を返す', () => {
    expect(binarySearchTrace(16, 1)).toEqual([8, 4, 2, 1])
    expect(binarySearchTrace(16, 16)).toEqual([8, 12, 14, 15, 16])
    expect(binarySearchTrace(16, 0)).toEqual([])
  })

  it('選択ソートのパスごとの配列と交換回数を返す', () => {
    const { passes, swaps } = selectionSortPasses([5, 3, 8, 1, 4])
    expect(passes[0]).toEqual([1, 3, 8, 5, 4])
    expect(passes[passes.length - 1]).toEqual([1, 3, 4, 5, 8])
    expect(swaps).toEqual([1, 0, 1, 0])
  })

  it('最頻値・標準偏差・回帰直線を返す', () => {
    expect(mode([3, 5, 5, 7, 7, 7, 9])).toBe(7)
    expect(mode([1, 2, 2, 3, 3])).toBe(2)
    expect(mode([])).toBe(0)
    expect(stddev([2, 2, 2])).toBe(0)
    expect(stddev([0, 10])).toBe(5)
    const line = leastSquares([
      { x: 0, y: 1 },
      { x: 1, y: 3 },
      { x: 2, y: 5 },
    ])
    expect(line.slope).toBeCloseTo(2)
    expect(line.intercept).toBeCloseTo(1)
  })
})

describe('実験の一覧', () => {
  it('IDが重複せず、関連する問題と分野が一致する', () => {
    expect(LABS.length).toBe(55)
    expect(new Set(LABS.map((lab) => lab.id)).size).toBe(LABS.length)
    for (const lab of LABS) {
      const question = questionById(lab.questionId)
      expect(question, `${lab.id} の関連問題がない`).toBeDefined()
      expect(question!.fieldId, `${lab.id} の分野が問題と違う`).toBe(lab.fieldId)
      expect(labById(lab.id)).toBe(lab)
      expect(labsByField(lab.fieldId)).toContain(lab)
    }
  })

  it('どの実験もSSRで描画できる', () => {
    for (const lab of LABS) {
      const html = renderToStaticMarkup(createElement(lab.Component))
      expect(html.length, `${lab.id} が空`).toBeGreaterThan(0)
      expect(html, `${lab.id} に実験タイトルがない`).toContain('<h3')
      expect(html, `${lab.id} に結果表示がない`).toContain('role="status"')
    }
  })

  it('今日の実験は一覧から選ばれる', () => {
    expect(LABS).toContain(pickTodaysLab())
  })
})
