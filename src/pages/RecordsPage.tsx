import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { TopAppBar } from '@/components/TopAppBar'
import { StreakCard } from '@/components/StreakCard'
import { pickTodaysQuestion, attemptedTodayIds } from '@/lib/today'
import { FIELDS } from '@/lib/fields'
import { useStore, fieldAccuracy } from '@/lib/store'
import { terms } from '@/content/terms'
import { usePageTitle } from '@/lib/usePageTitle'
import ui from '@/styles/ui.module.css'
import s from './RecordsPage.module.css'

const WEEKS = 13

export default function RecordsPage() {
  usePageTitle('学習記録')
  const { store, streak, todayActive } = useStore()
  const todays = pickTodaysQuestion(attemptedTodayIds(store.attempts))

  /* 日ごとの学習量（演習の解答、用語の復習） */
  const counts = useMemo(() => {
    const m = new Map<string, number>()
    const fmt = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Tokyo' })
    const add = (d: string, n = 1) => m.set(d, (m.get(d) ?? 0) + n)
    for (const a of store.attempts) add(fmt.format(new Date(a.at)))
    for (const r of Object.values(store.termReviews)) add(r.lastSeen)
    return m
  }, [store.attempts, store.termReviews])

  const days = useMemo(() => {
    const today = new Date(`${new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Tokyo' }).format(new Date())}T12:00:00Z`)
    const out: { date: string; count: number }[] = []
    for (let i = WEEKS * 7 - 1; i >= 0; i--) {
      const d = new Date(today)
      d.setUTCDate(d.getUTCDate() - i)
      const date = d.toISOString().slice(0, 10)
      out.push({ date, count: counts.get(date) ?? 0 })
    }
    return out
  }, [counts])

  const activeDays = days.filter((d) => d.count > 0).length

  const acc = fieldAccuracy(store)

  const unsureTerms = Object.entries(store.termReviews)
    .filter(([, r]) => r.confidence === 'unsure')
    .map(([id, r]) => ({ term: terms.find((t) => t.id === id), lastSeen: r.lastSeen }))
    .filter((x): x is { term: (typeof terms)[number]; lastSeen: string } => x.term != null)
    .sort((a, b) => (a.lastSeen < b.lastSeen ? 1 : -1))

  return (
    <>
      <TopAppBar title="学習記録" />
      <div className={`${ui.page} ${s.page}`}>
        <StreakCard streak={streak} todayActive={todayActive} ctaTo={`/quiz/${todays.id}`} ctaLabel="今日の1問へ" />

        <section className={`${ui.card} ${ui.cardPad}`} aria-labelledby="rec-heatmap">
          <h2 className={ui.sectionTitle} id="rec-heatmap">
            学習カレンダー（過去{WEEKS}週間）
          </h2>
          <Heatmap days={days} activeDays={activeDays} />
        </section>

        <section className={`${ui.card} ${ui.cardPad}`} aria-labelledby="rec-accuracy">
          <h2 className={ui.sectionTitle} id="rec-accuracy">
            分野別 正答率
          </h2>
          <div className={ui.stack}>
            {FIELDS.map((f) => {
              const a = acc[f.id]
              const pct = a.total > 0 ? Math.round((a.correct / a.total) * 100) : 0
              return (
                <div key={f.id} className={s.barRow}>
                  <span className={s.barLabel}>{f.name}</span>
                  <span
                    className={s.track}
                    role="img"
                    aria-label={`${f.name}の正答率は${a.total > 0 ? `${pct}%（${a.correct}問中${a.correct}問正答）` : 'データなし'}`}
                  >
                    <span className={s.fill} style={{ width: `${a.total > 0 ? pct : 0}%`, background: f.colorVar }} />
                  </span>
                  <span className={s.barValue}>{a.total > 0 ? `${pct}%` : '—'}</span>
                </div>
              )
            })}
          </div>
          {Object.values(acc).every((a) => a.total === 0) && (
            <p className={ui.lead}>まだ記録がありません。演習を解くとここに表示されます。</p>
          )}
        </section>

        <section className={`${ui.card} ${ui.cardPad}`} aria-labelledby="rec-unsure">
          <h2 className={ui.sectionTitle} id="rec-unsure">
            苦手用語
          </h2>
          {unsureTerms.length === 0 ? (
            <p className={ui.lead}>「あいまい」と記録した用語はまだありません。</p>
          ) : (
            <div className={ui.chipRow}>
              {unsureTerms.map(({ term }) => (
                <Link key={term.id} to={`/terms/${term.id}`} className={`${ui.chip} ${s.unsureChip}`}>
                  ? {term.name}
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  )
}

/* ---------- ヒートマップ ---------- */

function levelClass(count: number): string {
  if (count <= 0) return s.h0
  if (count <= 2) return s.h1
  if (count <= 4) return s.h2
  return s.h3
}

function Heatmap({ days, activeDays }: { days: { date: string; count: number }[]; activeDays: number }) {
  const cell = 12
  const gap = 2
  const pitch = cell + gap
  const cols = WEEKS
  const rows = 7
  const svgW = cols * pitch + 4
  const svgH = rows * pitch + 4
  return (
    <div className={s.heatmapWrap}>
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        className={s.heatmap}
        role="img"
        aria-label={`過去${WEEKS}週間の学習カレンダー。${activeDays}日学習しました。`}
      >
        <title>学習カレンダー</title>
        {days.map((d, i) => {
          const col = Math.floor(i / rows)
          const row = i % rows
          return (
            <rect
              key={d.date}
              x={2 + col * pitch}
              y={2 + row * pitch}
              width={cell}
              height={cell}
              rx={3}
              className={levelClass(d.count)}
            >
              <title>{`${d.date}: ${d.count > 0 ? `${d.count}件の学習` : '学習なし'}`}</title>
            </rect>
          )
        })}
      </svg>
      <div className={s.legend} aria-hidden="true">
        <span className={s.legendItem}>
          <span className={`${s.sw} ${s.h0}`} /> 0回
        </span>
        <span className={s.legendItem}>
          <span className={`${s.sw} ${s.h1}`} /> 1〜2回
        </span>
        <span className={s.legendItem}>
          <span className={`${s.sw} ${s.h2}`} /> 3〜4回
        </span>
        <span className={s.legendItem}>
          <span className={`${s.sw} ${s.h3}`} /> 5回以上
        </span>
      </div>
    </div>
  )
}
