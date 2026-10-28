import { TopAppBar } from '@/components/TopAppBar'
import { FieldCard } from '@/components/FieldCard'
import { FIELDS } from '@/lib/fields'
import { useStore, fieldProgress } from '@/lib/store'
import { questionsByField } from '@/content/questions'
import { usePageTitle } from '@/lib/usePageTitle'
import ui from '@/styles/ui.module.css'
import s from './HomePage.module.css'

export default function FieldsPage() {
  usePageTitle('分野')
  const { store } = useStore()
  return (
    <>
      <TopAppBar title="分野" />
      <div className={`${ui.page} ${s.page}`}>
        <p className={ui.lead}>
          情報Ⅰの4分野。実験で仕組みを動かして確かめ、問題の解説と用語で定着させましょう。
        </p>
        <div className={`${ui.stack} ${s.grid}`}>
          {FIELDS.map((f) => (
            <FieldCard
              key={f.id}
              fieldId={f.id}
              ratio={fieldProgress(store, questionsByField(f.id).map((q) => q.id))}
            />
          ))}
        </div>
        <p className={ui.lead}>全72問。分野を選ぶと、用語とミニ問題の一覧へ進めます。</p>
      </div>
    </>
  )
}
