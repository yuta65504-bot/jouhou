/**
 * 学習記録ストア（仕様書 §9）
 * - localStorage に永続化（schemaVersion を保持し、将来の端末間同期に備える）
 * - データ消去対策として JSON エクスポート／インポートを提供
 * - 「後で解く」フラグ・テーマは Store 本体のスキーマ外として別キーで管理
 */
import { z } from 'zod'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { calcStreak, todayJst } from './dates'
import { FIELD_IDS, isFieldId } from './fields'

/* ---------- スキーマ ---------- */

export const sessionSchema = z.object({
  date: z.string(),
  fieldId: z.string(),
  correct: z.number().int().min(0),
  total: z.number().int().min(1),
})

export const attemptSchema = z.object({
  questionId: z.string(),
  correct: z.boolean(),
  at: z.string(),
})

export const termReviewSchema = z.object({
  confidence: z.enum(['known', 'unsure']),
  lastSeen: z.string(),
})

export const storeSchema = z.object({
  schemaVersion: z.literal(1),
  sessions: z.array(sessionSchema),
  attempts: z.array(attemptSchema),
  termReviews: z.record(termReviewSchema),
})

export type Store = z.infer<typeof storeSchema>
export type Session = z.infer<typeof sessionSchema>
export type Attempt = z.infer<typeof attemptSchema>
export type TermReview = z.infer<typeof termReviewSchema>

export const settingsSchema = z.object({
  theme: z.enum(['system', 'light', 'dark']),
})
export type Settings = z.infer<typeof settingsSchema>

/* ---------- localStorage ---------- */

const STORE_KEY = 'jouhou.store.v1'
const SETTINGS_KEY = 'jouhou.settings.v1'
const LATER_KEY = 'jouhou.quiz.later.v1'

export function emptyStore(): Store {
  return storeSchema.parse({ schemaVersion: 1, sessions: [], attempts: [], termReviews: {} })
}

function load<T>(key: string, schema: z.ZodType<T>, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw == null) return fallback
    return schema.parse(JSON.parse(raw))
  } catch {
    return fallback
  }
}

function save<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* プライベートモード等では保存できないが、アプリは動作し続ける */
  }
}

/* ---------- Context ---------- */

type StoreContextValue = {
  store: Store
  settings: Settings
  later: string[]
  /** 学習活性日（演習・用語復習のいずれかがあった日付）の一覧 */
  activityDates: string[]
  streak: number
  todayActive: boolean
  recordAttempt: (fieldId: string, questionId: string, correct: boolean) => void
  reviewTerm: (termId: string, confidence: 'known' | 'unsure') => void
  toggleLater: (questionId: string) => void
  setTheme: (theme: Settings['theme']) => void
  exportJson: () => string
  importJson: (json: string) => { ok: true } | { ok: false; error: string }
  resetData: () => void
}

const StoreContext = createContext<StoreContextValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<Store>(() => load(STORE_KEY, storeSchema, emptyStore()))
  const [settings, setSettings] = useState<Settings>(() =>
    load(SETTINGS_KEY, settingsSchema, settingsSchema.parse({ theme: 'system' })),
  )
  const [later, setLater] = useState<string[]>(() => load(LATER_KEY, z.array(z.string()), []))

  useEffect(() => save(STORE_KEY, store), [store])
  useEffect(() => save(SETTINGS_KEY, settings), [settings])
  useEffect(() => save(LATER_KEY, later), [later])

  /* テーマを <html data-theme> に反映（system は CSS の media query に任せる） */
  useEffect(() => {
    if (settings.theme === 'system') {
      delete document.documentElement.dataset.theme
    } else {
      document.documentElement.dataset.theme = settings.theme
    }
  }, [settings.theme])

  const today = todayJst()

  const recordAttempt = useCallback((fieldId: string, questionId: string, correct: boolean) => {
    const date = todayJst()
    setStore((prev) => {
      const attempt: Attempt = { questionId, correct, at: new Date().toISOString() }
      const sessions = [...prev.sessions]
      const idx = sessions.findIndex((s) => s.date === date && s.fieldId === fieldId)
      if (idx >= 0) {
        const s = sessions[idx]
        sessions[idx] = {
          ...s,
          correct: s.correct + (correct ? 1 : 0),
          total: s.total + 1,
        }
      } else {
        sessions.push({ date, fieldId, correct: correct ? 1 : 0, total: 1 })
      }
      return { ...prev, attempts: [...prev.attempts, attempt], sessions }
    })
  }, [])

  const reviewTerm = useCallback((termId: string, confidence: 'known' | 'unsure') => {
    setStore((prev) => ({
      ...prev,
      termReviews: {
        ...prev.termReviews,
        [termId]: { confidence, lastSeen: todayJst() },
      },
    }))
  }, [])

  const toggleLater = useCallback((questionId: string) => {
    setLater((prev) =>
      prev.includes(questionId) ? prev.filter((id) => id !== questionId) : [...prev, questionId],
    )
  }, [])

  const setTheme = useCallback((theme: Settings['theme']) => {
    setSettings((prev) => ({ ...prev, theme }))
  }, [])

  const exportJson = useCallback(() => JSON.stringify(store, null, 2), [store])

  const importJson = useCallback((json: string) => {
    try {
      const parsed = storeSchema.parse(JSON.parse(json))
      if (parsed.schemaVersion !== 1) {
        return { ok: false as const, error: '対応していないデータバージョンです。' }
      }
      setStore(parsed)
      return { ok: true as const }
    } catch {
      return { ok: false as const, error: '読み込めないファイルです。形式を確認してください。' }
    }
  }, [])

  const resetData = useCallback(() => {
    setStore(emptyStore())
    setLater([])
  }, [])

  const activityDates = useMemo(() => {
    const dates = new Set<string>()
    for (const s of store.sessions) if (s.total > 0) dates.add(s.date)
    for (const r of Object.values(store.termReviews)) dates.add(r.lastSeen)
    return [...dates]
  }, [store])

  const { streak, todayActive } = useMemo(() => calcStreak(activityDates, today), [activityDates, today])

  const value = useMemo<StoreContextValue>(
    () => ({
      store,
      settings,
      later,
      activityDates,
      streak,
      todayActive,
      recordAttempt,
      reviewTerm,
      toggleLater,
      setTheme,
      exportJson,
      importJson,
      resetData,
    }),
    [
      store,
      settings,
      later,
      activityDates,
      streak,
      todayActive,
      recordAttempt,
      reviewTerm,
      toggleLater,
      setTheme,
      exportJson,
      importJson,
      resetData,
    ],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('StoreProvider の外で useStore は使えません')
  return ctx
}

/** 分野ごとの解答進捗（0..1）を求める。questionIds はその分野の全問題ID */
export function fieldProgress(store: Store, questionIds: readonly string[]): number {
  if (questionIds.length === 0) return 0
  const ids = new Set(questionIds)
  const answered = new Set(
    store.attempts.filter((a) => ids.has(a.questionId)).map((a) => a.questionId),
  ).size
  return Math.min(1, answered / questionIds.length)
}

/** 分野ごとの正答率（sessions から集計） */
export function fieldAccuracy(
  store: Store,
): Record<string, { correct: number; total: number }> {
  const acc: Record<string, { correct: number; total: number }> = {}
  for (const id of FIELD_IDS) acc[id] = { correct: 0, total: 0 }
  for (const s of store.sessions) {
    if (isFieldId(s.fieldId) && acc[s.fieldId]) {
      acc[s.fieldId].correct += s.correct
      acc[s.fieldId].total += s.total
    }
  }
  return acc
}
