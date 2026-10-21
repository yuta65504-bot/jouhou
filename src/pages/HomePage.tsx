import { Link } from 'react-router-dom'
import { TopAppBar } from '@/components/TopAppBar'
import { StreakCard } from '@/components/StreakCard'
import { FieldCard } from '@/components/FieldCard'
import { GearIcon } from '@/components/Icons'
import { FIELDS } from '@/lib/fields'
import { useStore, fieldProgress } from '@/lib/store'
import { pickTodaysQuestion, attemptedTodayIds } from '@/lib/today'
import { questionsByField } from '@/content/questions'
import { usePageTitle } from '@/lib/usePageTitle'
import ui from '@/styles/ui.module.css'
import s from './HomePage.module.css'

export default function HomePage() {
  usePageTitle()
  const { store, streak, todayActive } = useStore()
  const todays = pickTodaysQuestion(attemptedTodayIds(store.attempts))

  return (
    <>
      <TopAppBar
        title="jouohu"
        right={
          <Link to="/settings" className={s.gear} aria-label="設定">
            <GearIcon />
          </Link>
        }
      />
      <div className={`${ui.page} ${s.page}`}>
        <StreakCard streak={streak} todayActive={todayActive} ctaTo={`/quiz/${todays.id}`} />

        <section aria-labelledby="home-fields">
          <h2 className={ui.sectionTitle} id="home-fields">
            分野から学ぶ
          </h2>
          <div className={`${ui.stack} ${s.grid}`}>
            {FIELDS.map((f) => (
              <FieldCard
                key={f.id}
                fieldId={f.id}
                ratio={fieldProgress(store, questionsByField(f.id).map((q) => q.id))}
              />
            ))}
          </div>
        </section>

        <section aria-labelledby="home-today">
          <h2 className={ui.sectionTitle} id="home-today">
            今日の1問
          </h2>
          <div className={s.todayCard}>
            <Link to={`/quiz/${todays.id}`} className={s.todayLink}>
              <span className={ui.chip} style={{ background: FIELDS.find((f) => f.id === todays.fieldId)!.tintVar }}>
                {FIELDS.find((f) => f.id === todays.fieldId)!.name}
              </span>
              <span className={s.todayText}>{todays.text.split('\n')[0]}</span>
              <span className={s.todayCta} aria-hidden="true">
                解く →
              </span>
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}
