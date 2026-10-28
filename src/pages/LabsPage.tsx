import { TopAppBar } from '@/components/TopAppBar'
import { LabCard } from '@/components/LabCard'
import { FIELDS } from '@/lib/fields'
import { LABS, labsByField, pickTodaysLab } from '@/labs'
import { usePageTitle } from '@/lib/usePageTitle'
import ui from '@/styles/ui.module.css'
import s from './LabsPage.module.css'

export default function LabsPage() {
  usePageTitle('実験')
  const todays = pickTodaysLab()

  return (
    <>
      <TopAppBar title="実験" />
      <div className={`${ui.page} ${s.page}`}>
        <p className={ui.lead}>
          スライダーやボタンを動かして、結果が変わるのを確かめる。問題を解く前に仕組みを触っておくと、解説が読みやすくなります。
        </p>
        {FIELDS.map((field) => {
          const labs = labsByField(field.id)
          if (labs.length === 0) return null
          return (
            <section key={field.id} aria-labelledby={`labs-${field.id}`}>
              <h2 className={ui.sectionTitle} id={`labs-${field.id}`}>
                {field.name}
              </h2>
              <div className={s.grid}>
                {labs.map((lab) => (
                  <LabCard key={lab.id} lab={lab} today={lab.id === todays.id} />
                ))}
              </div>
            </section>
          )
        })}
        <p className={ui.lead}>全{LABS.length}本。4分野から、気になる実験を選んでください。</p>
      </div>
    </>
  )
}
