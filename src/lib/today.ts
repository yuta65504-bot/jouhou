import { questions } from '@/content/questions'
import type { Question } from '@/content/schema'
import { dateHash, todayJst } from './dates'

/** その日まだ解いていない問題を優先して、「今日の1問」を決定的に選ぶ */
export function pickTodaysQuestion(attemptedToday: Set<string>): Question {
  const today = todayJst()
  const idx = dateHash(today, questions.length)
  for (let k = 0; k < questions.length; k++) {
    const q = questions[(idx + k) % questions.length]
    if (!attemptedToday.has(q.id)) return q
  }
  return questions[idx]
}

/** 今日（JST）に解いた問題IDの集合 */
export function attemptedTodayIds(attempts: readonly { questionId: string; at: string }[]): Set<string> {
  const today = todayJst()
  const fmt = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Tokyo' })
  const ids = new Set<string>()
  for (const a of attempts) {
    if (fmt.format(new Date(a.at)) === today) ids.add(a.questionId)
  }
  return ids
}
