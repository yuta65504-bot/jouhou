import { questions } from '../content/questions'

/**
 * 「すぐに次の問題を解く」（仕様書「問題・演習の仕様」）。
 * コンテンツ登録順で次の問題のIDを返す。最後の問題の次は先頭に戻る（ループ）。
 */
export function nextQuestionId(id: string): string | undefined {
  const index = questions.findIndex((q) => q.id === id)
  if (index < 0 || questions.length === 0) return undefined
  return questions[(index + 1) % questions.length].id
}
