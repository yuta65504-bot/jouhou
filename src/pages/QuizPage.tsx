import { Link, useSearchParams } from 'react-router-dom'
import { TopAppBar } from '@/components/TopAppBar'
import { Segmented } from '@/components/Segmented'
import { StarIcon } from '@/components/Icons'
import { FIELDS, isFieldId } from '@/lib/fields'
import { useStore } from '@/lib/store'
import { questions } from '@/content/questions'
import { usePageTitle } from '@/lib/usePageTitle'
import ui from '@/styles/ui.module.css'
import s from './QuizPage.module.css'

type FieldFilter = 'all' | 'society' | 'network' | 'programming' | 'data'
type DiffFilter = 'all' | '1' | '2' | '3'

const FIELD_OPTIONS: readonly { value: FieldFilter; label: string }[] = [
  { value: 'all', label: 'すべて' },
  ...FIELDS.map((f) => ({ value: f.id as FieldFilter, label: f.name })),
]

const DIFF_OPTIONS: readonly { value: DiffFilter; label: string }[] = [
  { value: 'all', label: 'すべて' },
  { value: '1', label: '★基本' },
  { value: '2', label: '★★標準' },
  { value: '3', label: '★★★やや難' },
]

const DIFF_LABEL: Record<number, string> = { 1: '★', 2: '★★', 3: '★★★' }

export default function QuizPage() {
  usePageTitle('演習')
  const [params, setParams] = useSearchParams()
  const { store, later, toggleLater } = useStore()

  const rawField = params.get('field') ?? 'all'
  const rawDiff = params.get('diff') ?? 'all'
  const field: FieldFilter = isFieldId(rawField) ? (rawField as FieldFilter) : 'all'
  const diff: DiffFilter = ['1', '2', '3'].includes(rawDiff) ? (rawDiff as DiffFilter) : 'all'

  const setFilter = (key: 'field' | 'diff', value: string) => {
    const next = new URLSearchParams(params)
    if (value === 'all') next.delete(key)
    else next.set(key, value)
    setParams(next, { replace: true })
  }

  /* 最新の解答結果 */
  const latest = new Map<string, boolean>()
  for (const a of store.attempts) latest.set(a.questionId, a.correct)

  const filtered = questions.filter(
    (q) => (field === 'all' || q.fieldId === field) && (diff === 'all' || q.difficulty === Number(diff)),
  )
  /* 「後で解く」を先に表示 */
  const sorted = [...filtered].sort((a, b) => {
    const la = later.includes(a.id) ? 0 : 1
    const lb = later.includes(b.id) ? 0 : 1
    return la - lb
  })

  return (
    <>
      <TopAppBar title="演習" />
      <div className={`${ui.page} ${s.page}`}>
        <div className={ui.stack}>
          <span className={ui.panelTitle} id="quiz-field-filter">
            分野で絞り込む
          </span>
          <Segmented
            label="分野フィルタ"
            value={field}
            options={FIELD_OPTIONS}
            onChange={(v) => setFilter('field', v)}
          />
        </div>
        <div className={ui.stack}>
          <span className={ui.panelTitle} id="quiz-diff-filter">
            難易度で絞り込む
          </span>
          <Segmented
            label="難易度フィルタ"
            value={diff}
            options={DIFF_OPTIONS}
            onChange={(v) => setFilter('diff', v)}
          />
        </div>

        <p className={ui.lead} aria-live="polite">
          {sorted.length === 0 ? '条件に合う問題がありません' : `${sorted.length}問あります`}
        </p>

        <div className={ui.stack}>
          {sorted.map((q) => {
            const f = FIELDS.find((x) => x.id === q.fieldId)!
            const isLater = later.includes(q.id)
            const answered = latest.get(q.id)
            return (
              <div key={q.id} className={ui.rowLink}>
                <Link to={`/quiz/${q.id}`} className={s.main}>
                  <span className={s.meta}>
                    <span className={ui.chip} style={{ background: f.tintVar }}>
                      {f.name}
                    </span>
                    <span className={`${ui.chip} ${s.stars}`} aria-label={`難易度${q.difficulty}`}>
                      {DIFF_LABEL[q.difficulty]}
                    </span>
                    {isLater && <span className={ui.chip}>後で解く</span>}
                    {answered != null && (
                      <span className={`${ui.chip} ${answered ? s.correctChip : s.wrongChip}`}>
                        {answered ? '正解ずみ' : '不正解だった'}
                      </span>
                    )}
                  </span>
                  <span className={ui.rowTitle}>{q.text.split('\n')[0]}</span>
                </Link>
                <button
                  type="button"
                  className={`${ui.laterBtn} ${isLater ? ui.laterOn : ''}`}
                  aria-pressed={isLater}
                  aria-label={isLater ? '「後で解く」を解除' : 'あとで解く'}
                  onClick={() => toggleLater(q.id)}
                >
                  <StarIcon filled={isLater} />
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
