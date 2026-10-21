/** 日付ユーティリティ。日付は学習日として JST（受験生の暦）で扱う */

/** JST の今日を YYYY-MM-DD で返す */
export function todayJst(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Tokyo' }).format(now)
}

/** YYYY-MM-DD の前日を返す */
export function prevDay(date: string): string {
  const d = new Date(`${date}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() - 1)
  return d.toISOString().slice(0, 10)
}

/** YYYY-MM-DD を人間向け表示（M/D）にする */
export function formatDateJa(date: string): string {
  const [, m, d] = date.split('-')
  return `${Number(m)}/${Number(d)}`
}

/** 連続学習日数を計算する（今日または昨日から過去に連続している日数） */
export function calcStreak(
  dates: readonly string[],
  today: string,
): { streak: number; todayActive: boolean } {
  const set = new Set(dates)
  const todayActive = set.has(today)
  let cursor = todayActive ? today : prevDay(today)
  if (!set.has(cursor)) return { streak: 0, todayActive }
  let streak = 0
  while (set.has(cursor)) {
    streak += 1
    cursor = prevDay(cursor)
  }
  return { streak, todayActive }
}

/** 日付文字列から決定的な 0..max-1 の数値を作る（「今日の1問」用） */
export function dateHash(date: string, max: number): number {
  let h = 7
  for (const ch of date) {
    h = ((h * 31 + ch.charCodeAt(0)) >>> 0) % 100000
  }
  return h % max
}
