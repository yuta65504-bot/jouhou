import { Suspense, lazy, useEffect, useRef } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { TopAppBar } from '@/components/TopAppBar'
import { getField } from '@/lib/fields'
import { getDemo } from '@/content/demos'
import { useStore } from '@/lib/store'
import { usePageTitle } from '@/lib/usePageTitle'
import ui from '@/styles/ui.module.css'
import s from './DemoPage.module.css'

/* 各デモの本体をデモIDごとに遅延読込（仕様書 §4） */
const DEMO_COMPONENTS = {
  'ui-compare': lazy(() => import('@/demos/ui-compare/UiCompareDemo')),
  'bit-ops': lazy(() => import('@/demos/bit-ops/BitOpsDemo')),
  'dncl-step': lazy(() => import('@/demos/dncl/DnclDemo')),
  'graph-explore': lazy(() => import('@/demos/graph/GraphDemo')),
} as const

export default function DemoPage() {
  const { fieldId, demoId } = useParams()
  const demo = demoId ? getDemo(demoId) : undefined
  const field = fieldId ? getField(fieldId) : undefined
  usePageTitle(demo ? `${field?.name}｜${demo.title}` : undefined)

  const { recordDemoVisit } = useStore()
  /* StrictMode での二重実行や、同じデモ内の再描画で重複カウントしない */
  const visitedRef = useRef<string | null>(null)
  useEffect(() => {
    if (demoId && visitedRef.current !== demoId) {
      visitedRef.current = demoId
      recordDemoVisit(demoId)
    }
  }, [demoId, recordDemoVisit])

  if (!demo || !field || demo.fieldId !== fieldId) return <Navigate to="/fields" replace />

  const DemoBody = DEMO_COMPONENTS[demo.id as keyof typeof DEMO_COMPONENTS]
  /** DNCLはデモ自身が下部固定バー（操作4ボタン）を持つため、共通バーは省略 */
  const hasOwnBar = demo.id === 'dncl-step'

  return (
    <>
      <TopAppBar title={`${field.name}・${demo.title}`} backTo={`/fields/${fieldId}`} />
      <div className={`${ui.page} ${s.page}`}>
        <p className={ui.lead}>
          {demo.summary}
          <span className={s.levelBadge}>{demo.level}</span>
        </p>
        <Suspense fallback={<p className={s.loading}>読み込み中…</p>}>
          <DemoBody />
        </Suspense>
        {!hasOwnBar && (
          <div className={ui.bottomBar}>
            <Link to={`/quiz/${demo.quizId}`} className={`${ui.primaryBtn} ${ui.fullWidth}`}>
              ミニ問題へ
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
