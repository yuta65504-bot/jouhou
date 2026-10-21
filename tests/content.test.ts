import { describe, expect, it } from 'vitest'
import { demos, getDemo } from '../src/content/demos'
import { questions } from '../src/content/questions'
import { terms } from '../src/content/terms'
import { dnclPrograms } from '../src/content/dncl'
import { computeRun, parseProgram, varNamesOf } from '../src/demos/dncl/engine'
import { FIGURE_IDS } from '../src/components/Figures'
import { FIELD_IDS } from '../src/lib/fields'

/** コンテンツの必須項目は zod で検証する（仕様書 §11）。CI/npm test で欠落を弾く */
describe('content validation', () => {
  it('分野IDが4分野に収まっている', () => {
    expect(FIELD_IDS).toEqual(['society', 'network', 'programming', 'data'])
  })

  it('デモ: IDが重複せず、関連ミニ問題が存在する', () => {
    const demoIds = demos.map((d) => d.id)
    expect(new Set(demoIds).size).toBe(demoIds.length)
    const quizIds = new Set(questions.map((q) => q.id))
    for (const d of demos) {
      expect(quizIds.has(d.quizId), `demo ${d.id} の quizId ${d.quizId}`).toBe(true)
    }
  })

  it('デモ: 4分野それぞれに最低1本ある', () => {
    for (const f of FIELD_IDS) expect(demos.some((d) => d.fieldId === f), f).toBe(true)
  })

  it('用語: IDが重複せず、図解と関連用語とデモが存在する', () => {
    const termIds = terms.map((t) => t.id)
    expect(new Set(termIds).size).toBe(termIds.length)
    for (const t of terms) {
      expect(FIGURE_IDS, `${t.name} の図解 ${t.figure}`).toContain(t.figure)
      for (const r of t.related) {
        expect(termIds, `${t.name} の関連用語 ${r}`).toContain(r)
      }
      if (t.demoId) expect(getDemo(t.demoId), `${t.name} のデモ ${t.demoId}`).toBeDefined()
    }
  })

  it('問題: 解答が選択肢の範囲内で、逆リンク先のデモが存在する', () => {
    for (const q of questions) {
      expect(q.choices).toHaveLength(4)
      expect(q.answerIndex).toBeGreaterThanOrEqual(0)
      expect(q.answerIndex).toBeLessThan(4)
      if (q.demoId) expect(getDemo(q.demoId), `${q.id} のデモ ${q.demoId}`).toBeDefined()
    }
  })

  it('問題: 4分野それぞれに最低2問ある', () => {
    for (const f of FIELD_IDS) {
      expect(questions.filter((q) => q.fieldId === f).length, f).toBeGreaterThanOrEqual(2)
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

  it('1手戻る: N手目とN-1手目でスナップショットが連続する', () => {
    const lines = byId('sum').lines
    const r5 = computeRun(parseProgram(lines), 5)
    const r4 = computeRun(parseProgram(lines), 4)
    expect(r5.snapshots.length).toBe(5)
    expect(r4.snapshots.length).toBe(4)
    expect(r5.snapshots[3]).toEqual(r4.snapshots[3])
  })
})
