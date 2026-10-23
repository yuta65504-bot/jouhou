import { describe, expect, it } from 'vitest'
import { questions } from '../src/content/questions'
import { terms } from '../src/content/terms'
import { dnclPrograms } from '../src/content/dncl'
import { computeRun, parseProgram, varNamesOf } from '../src/lib/dncl-engine'
import { FIGURE_IDS } from '../src/components/Figures'
import { QUESTION_FIGURE_IDS } from '../src/figures'
import { FIELD_IDS } from '../src/lib/fields'

/** コンテンツの必須項目は zod で検証する（仕様書 §11）。CI/npm test で欠落を弾く */
describe('content validation', () => {
  it('分野IDが4分野に収まっている', () => {
    expect(FIELD_IDS).toEqual(['society', 'network', 'programming', 'data'])
  })

  it('用語: IDが重複せず、図解と関連用語が存在する', () => {
    const termIds = terms.map((t) => t.id)
    expect(new Set(termIds).size).toBe(termIds.length)
    for (const t of terms) {
      expect(FIGURE_IDS, `${t.name} の図解 ${t.figure}`).toContain(t.figure)
      for (const r of t.related) {
        expect(termIds, `${t.name} の関連用語 ${r}`).toContain(r)
      }
    }
  })

  it('問題: 選択肢が4つで、解答が選択肢の範囲内', () => {
    for (const q of questions) {
      expect(q.choices).toHaveLength(4)
      expect(q.answerIndex).toBeGreaterThanOrEqual(0)
      expect(q.answerIndex).toBeLessThan(4)
    }
  })

  it('図解: 72問それぞれに1つずつ存在し、問題IDと1対1で対応する', () => {
    expect(QUESTION_FIGURE_IDS.length).toBe(72)
    expect(new Set(QUESTION_FIGURE_IDS).size).toBe(72)
    const figIds = new Set<string>(QUESTION_FIGURE_IDS)
    const qIds = new Set(questions.map((q) => q.id))
    for (const id of figIds) {
      expect(qIds.has(id), `対応する問題が無い図解: ${id}`).toBe(true)
    }
    for (const q of questions) {
      expect(figIds.has(q.id), `${q.id} の図解がない`).toBe(true)
    }
  })

  it('図解: 4分野それぞれに18問分ある', () => {
    const figIds = new Set<string>(QUESTION_FIGURE_IDS)
    for (const f of FIELD_IDS) {
      const qs = questions.filter((q) => q.fieldId === f)
      expect(qs.length, f).toBe(18)
      for (const q of qs) expect(figIds.has(q.id), `${q.id} の図解`).toBe(true)
    }
  })

  it('DNCL: サンプルプログラムが全てパースできる', () => {
    for (const p of dnclPrograms) {
      const stmts = parseProgram(p.lines)
      expect(varNamesOf(stmts).length).toBeGreaterThan(0)
      expect(p.lines.length).toBeLessThanOrEqual(12)
    }
  })
})

describe('dncl engine', () => {
  const byId = (id: string) => dnclPrograms.find((p) => p.id === id)!

  it('合計と平均が正しく計算される', () => {
    const r = computeRun(parseProgram(byId('sum').lines), 100)
    expect(r.error).toBeNull()
    expect(r.done).toBe(true)
    const last = r.snapshots[r.snapshots.length - 1]
    expect(last.vars.total).toBe(15)
    expect(last.vars.mean).toBe(3)
  })

  it('偶数の個数が3になる', () => {
    const r = computeRun(parseProgram(byId('count-even').lines), 100)
    expect(r.error).toBeNull()
    expect(r.done).toBe(true)
    const last = r.snapshots[r.snapshots.length - 1]
    expect(last.vars.count).toBe(3)
  })

  it('無限ループのサンプルは上限に達するまで終わらない', () => {
    const r = computeRun(parseProgram(byId('infinite').lines), 100)
    expect(r.done).toBe(false)
    expect(r.error).toBeNull()
    expect(r.snapshots.length).toBe(100)
  })

  it('本体が空の繰り返しでもステップ上限で必ず止まる（巨大回数でも固まらない）', () => {
    const program = parseProgram([
      'n ← 1',
      'i を 1 から 1000000000 まで 増やしながら 繰り返す:',
      '繰り返しここまで',
      'n ← 2',
    ])
    const r = computeRun(program, 10)
    expect(r.done).toBe(false)
    expect(r.error).toBeNull()
    expect(r.snapshots.length).toBe(10)
  })

  it('1手戻る: N手目とN-1手目でスナップショットが連続する', () => {
    const lines = byId('sum').lines
    const r5 = computeRun(parseProgram(lines), 5)
    const r4 = computeRun(parseProgram(lines), 4)
    expect(r5.snapshots.length).toBe(5)
    expect(r4.snapshots.length).toBe(4)
    expect(r5.snapshots[3]).toEqual(r4.snapshots[3])
  })
})
