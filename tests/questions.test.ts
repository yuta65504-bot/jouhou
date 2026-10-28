import { describe, expect, it } from 'vitest'
import { questions } from '../src/content/questions'
import { FIELD_IDS } from '../src/lib/fields'

/** 問題バンク（question.md）の品質チェック。全範囲を網羅できていることを担保する */
describe('question bank', () => {
  it('4分野それぞれに十分な問数がある', () => {
    for (const f of FIELD_IDS) {
      expect(questions.filter((q) => q.fieldId === f).length, f).toBeGreaterThanOrEqual(10)
    }
  })

  it('4分野それぞれに難易度1〜3がすべて存在する', () => {
    for (const f of FIELD_IDS) {
      for (const d of [1, 2, 3] as const) {
        const n = questions.filter((q) => q.fieldId === f && q.difficulty === d).length
        expect(n, `${f} / 難易度${d}`).toBeGreaterThanOrEqual(1)
      }
    }
  })

  it('問題文・テーマが重複していない', () => {
    const texts = new Set(questions.map((q) => q.text))
    expect(texts.size).toBe(questions.length)
    const topics = new Set(questions.map((q) => q.topic))
    expect(topics.size).toBeGreaterThanOrEqual(FIELD_IDS.length * 8)
  })

  it('同じ問題で選択肢が重複していない', () => {
    for (const q of questions) {
      expect(new Set(q.choices).size, q.id).toBe(4)
    }
  })

  it('全問にテーマと解説があり、解説が20字以上ある', () => {
    for (const q of questions) {
      expect(q.topic, q.id).toBeTruthy()
      expect(q.explanation.length, q.id).toBeGreaterThanOrEqual(20)
    }
  })

  it('全問に参考情報が付き、特定の試験問題への依存を示す表現を含まない', () => {
    for (const q of questions) {
      expect(q.source, q.id).toBeTruthy()
      expect(q.source, q.id).not.toMatch(/共通テスト|同型|出典|定番|参考にした設問/)
    }
  })
})
