import { TopAppBar } from '@/components/TopAppBar'
import { FieldCard } from '@/components/FieldCard'
import { FIELDS } from '@/lib/fields'
import { useStore, fieldProgress } from '@/lib/store'
import { questionsByField } from '@/content/questions'
import { demosByField } from '@/content/demos'
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
          情報Ⅰの4分野。各分野のデモで操作しながら理解を深めましょう。
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
        <p className={ui.lead}>
          デモは{demosByField('society').length + demosByField('network').length + demosByField('programming').length + demosByField('data').length}
          本。分野を選ぶと一覧から開けます。
        </p>
      </div>
    </>
  )
}
