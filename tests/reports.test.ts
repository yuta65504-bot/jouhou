import { describe, expect, it } from 'vitest'
import { isCategory, isStatus, REPORT_CATEGORIES, reportCategoryLabel } from '../src/lib/report'
import { nextQuestionId } from '../src/lib/nextQuestion'
import { questions } from '../src/content/questions'
import { questionSchema } from '../src/content/schema'

/** 報告APIと周辺ユーティリティの検証（README「報告APIの仕様」） */
describe('report domain', () => {
  it('isCategory: 報告種別のキー（typo/answer/layout/other）のみを受け付ける', () => {
    for (const c of REPORT_CATEGORIES) expect(isCategory(c.value), c.value).toBe(true)
    expect(isCategory('誤字・脱字')).toBe(false) // UIラベルは受付けない（D1には英文キーを保存）
    expect(isCategory('')).toBe(false)
    expect(isCategory(null)).toBe(false)
    expect(isCategory(undefined)).toBe(false)
  })

  it('isStatus: open / resolved のみを受け付ける', () => {
    expect(isStatus('open')).toBe(true)
    expect(isStatus('resolved')).toBe(true)
    expect(isStatus('Open')).toBe(false)
    expect(isStatus('')).toBe(false)
    expect(isStatus(null)).toBe(false)
  })

  it('reportCategoryLabel: 英文キーを日本語ラベルへ変換する', () => {
    expect(reportCategoryLabel('typo')).toBe('誤字・脱字')
    expect(reportCategoryLabel('answer')).toBe('解答・解説の誤り')
    expect(reportCategoryLabel('layout')).toBe('表示崩れ')
    expect(reportCategoryLabel('other')).toBe('その他')
    // 未知のキー（将来の値や不正データ）は元の値をそのまま出す
    expect(reportCategoryLabel('nakano')).toBe('nakano')
  })
})

/** 「すぐに次の問題を解く」の付与ロジック（wrap-around） */
describe('nextQuestionId', () => {
  it('コンテンツ登録順で翌問題のIDを返す', () => {
    expect(nextQuestionId(questions[0].id)).toBe(questions[1].id)
  })

  it('最後の問題の次は先頭に戻る（ループ）', () => {
    const last = questions[questions.length - 1]
    expect(nextQuestionId(last.id)).toBe(questions[0].id)
  })

  it('存在しないIDはundefined', () => {
    expect(nextQuestionId('q-not-exist')).toBeUndefined()
  })
})

/** 問題スキーマの任意項目（topic / source） */
describe('question schema', () => {
  const base = {
    id: 'q-x-1',
    fieldId: 'society',
    difficulty: 1,
    text: 'テスト用の問題文です。',
    choices: ['a', 'b', 'c', 'd'],
    answerIndex: 0,
    explanation: 'テスト用の解説です。',
  } as const

  it('topic / source が無くても受理される', () => {
    expect(questionSchema.safeParse(base).success).toBe(true)
  })

  it('topic / source があっても受理される', () => {
    expect(
      questionSchema.safeParse({
        ...base,
        fieldId: 'programming',
        topic: 'アルゴリズム・繰り返し',
        source: 'アルゴリズム・繰り返し',
      }).success,
    ).toBe(true)
  })
})
