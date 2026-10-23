import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { TopAppBar } from '@/components/TopAppBar'
import { CheckIcon, CrossIcon, CircleIcon, StarIcon, FlagIcon } from '@/components/Icons'
import { ReportDialog } from '@/components/ReportDialog'
import { FIELDS } from '@/lib/fields'
import { useReducedMotion } from '@/lib/motion'
import { nextQuestionId } from '@/lib/nextQuestion'
import { useStore } from '@/lib/store'
import { questionById } from '@/content/questions'
import { usePageTitle } from '@/lib/usePageTitle'
import ui from '@/styles/ui.module.css'
import s from './QuizQuestionPage.module.css'

/** 問題ごとのインタラクティブ図解（解説を開いたときにだけ読み込む） */
const QuestionFigure = lazy(() => import('@/figures'))

/** reduced motion 環境では即時スクロールにする */
function scrollToRef(el: HTMLElement | null) {
  if (!el) return
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
}

export default function QuizQuestionPage() {
  const { id } = useParams()
  const q = id ? questionById(id) : undefined
  usePageTitle(q ? '問題' : undefined)

  const { store, later, toggleLater, recordAttempt } = useStore()
  const [selected, setSelected] = useState<number | null>(null)
  const [result, setResult] = useState<boolean | null>(null)
  const [showExp, setShowExp] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const expRef = useRef<HTMLElement>(null)
  const feedbackRef = useRef<HTMLDivElement>(null)
  const expBtnRef = useRef<HTMLButtonElement>(null)
  const reduceMotion = useReducedMotion()

  /* 「すぐに次の問題を解く」で同じ画面コンポーネントのまま問題を切り替えるので、
     選択・結果・解説・報告フォームを初期化し、ページ先頭へ戻す */
  useEffect(() => {
    setSelected(null)
    setResult(null)
    setShowExp(false)
    setReportOpen(false)
    window.scrollTo(0, 0)
  }, [id])

  /* 回答後はフィードバックへフォーカスを移し、読み上げとキーボード操作の起点にする */
  useEffect(() => {
    if (result != null) feedbackRef.current?.focus({ preventScroll: true })
  }, [result])

  if (!q) return <Navigate to="/quiz" replace />

  const field = FIELDS.find((f) => f.id === q.fieldId)!
  const isLater = later.includes(q.id)
  const answered = result != null
  const expId = `exp-${q.id}`

  /* 前回の結果（Storeに記録されている最新の解答）を表示用に取得 */
  const prevAttempt = [...store.attempts].reverse().find((a) => a.questionId === q.id)
  const introText = prevAttempt
    ? prevAttempt.correct
      ? '前回は正解しました。仕上げにもう一度確認しましょう。'
      : '前回は不正解でした。解説と図解で確認しましょう。'
    : null

  const answer = () => {
    if (selected == null || answered) return
    const correct = selected === q.answerIndex
    recordAttempt(q.fieldId, q.id, correct)
    setResult(correct)
    setShowExp(false)
  }
  const showExplanation = () => {
    setShowExp(true)
    /* パネルの展開（220ms）と図解の読み込み後に位置を合わせる */
    window.setTimeout(() => scrollToRef(expRef.current), reduceMotion ? 0 : 240)
  }
  const hideExplanation = () => {
    setShowExp(false)
    requestAnimationFrame(() => expBtnRef.current?.focus({ preventScroll: true }))
  }

  /* 「すぐに次の問題を解く」用: コンテンツ登録順の次の問題（最後の次は先頭に戻る） */
  const nextId = nextQuestionId(q.id)

  return (
    <>
      <TopAppBar
        title="問題"
        backTo="/quiz"
        right={
          <>
            <button
              type="button"
              className={`${ui.laterBtn} ${isLater ? ui.laterOn : ''}`}
              aria-pressed={isLater}
              aria-label={isLater ? '「後で解く」を解除' : 'あとで解く'}
              onClick={() => toggleLater(q.id)}
            >
              <StarIcon filled={isLater} />
            </button>
            <button
              type="button"
              className={ui.laterBtn}
              aria-label="この問題を報告"
              onClick={() => setReportOpen(true)}
            >
              <FlagIcon />
            </button>
          </>
        }
      />
      <div className={`${ui.page} ${s.page}`}>
        <div className={s.meta}>
          <span className={ui.chip} style={{ background: field.tintVar }}>
            {field.name}
          </span>
          <span className={ui.chip} aria-label={`難易度${q.difficulty}`}>
            {'★'.repeat(q.difficulty)}
          </span>
          {q.topic && <span className={ui.chip}>{q.topic}</span>}
        </div>

        <p className={s.text}>{q.text}</p>
        {introText && (
          <p className={ui.lead} aria-live="polite">
            {introText}
          </p>
        )}

        {/* 選択肢: 行全体がタップ可能（44px以上） */}
        <div role="radiogroup" aria-label="選択肢" className={ui.stack}>
          {q.choices.map((choice, i) => {
            const isSelected = selected === i
            const isAnswer = i === q.answerIndex
            const cls = [
              s.choice,
              !answered && isSelected ? s.choiceSelected : '',
              answered && isAnswer ? s.choiceCorrect : '',
              answered && isSelected && !isAnswer ? s.choiceWrong : '',
            ]
              .filter(Boolean)
              .join(' ')
            return (
              <button
                key={i}
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-disabled={answered}
                aria-label={
                  answered && isAnswer
                    ? `${choice}（正解）`
                    : answered && isSelected
                      ? `${choice}（不正解の解答）`
                      : undefined
                }
                className={cls}
                onClick={() => {
                  if (!answered) setSelected(i)
                }}
              >
                <span className={s.choiceMark} aria-hidden="true">
                  {answered && isAnswer ? (
                    <CheckIcon />
                  ) : answered && isSelected && !isAnswer ? (
                    <CrossIcon />
                  ) : (
                    <CircleIcon />
                  )}
                </span>
                <span className={s.choiceText}>{choice}</span>
              </button>
            )
          })}
        </div>

        {/* 正誤フィードバック（色＋アイコン＋テキスト） */}
        {answered && (
          <div
            ref={feedbackRef}
            className={`${s.feedback} ${result ? s.feedbackOk : s.feedbackNg}`}
            role="status"
            tabIndex={-1}
          >
            <span className={s.feedbackIcon} aria-hidden="true">
              {result ? <CheckIcon size={22} /> : <CrossIcon size={22} />}
            </span>
            <span className={s.feedbackText}>{result ? '正解！' : '不正解'}</span>
          </div>
        )}

        {/* 解説（「解説を見る」で開く）: 問題ごとのインタラクティブ図解つき */}
        {answered && (
          <section
            ref={expRef}
            id={expId}
            className={`${ui.card} ${s.exp} ${showExp ? s.expOpen : ''}`}
            aria-label="解説"
            aria-hidden={!showExp}
          >
            <div className={s.expInner}>
              <h2 className={ui.sectionTitle}>解説</h2>
              {q.explanation
                .split(/\n{2,}/)
                .filter((para) => para.trim())
                .map((para, i) => (
                  <p key={i} className={s.expPara}>
                    {para}
                  </p>
                ))}
              {showExp && (
                <div className={s.figure}>
                  <Suspense
                    fallback={
                      <div className={s.figSkeleton} role="status">
                        図解を準備中…
                      </div>
                    }
                  >
                    <QuestionFigure id={q.id} />
                  </Suspense>
                </div>
              )}
              {q.source && <p className={s.source}>出典: {q.source}</p>}
            </div>
          </section>
        )}

        {/* 下部固定ボタン: 回答後は「すぐに次の問題を解く」で連続解答できる（README「問題・演習の仕様」） */}
        <div className={ui.bottomBar}>
          {!answered ? (
            <button
              type="button"
              className={`${ui.primaryBtn} ${ui.fullWidth}`}
              onClick={answer}
              disabled={selected == null}
            >
              解答する
            </button>
          ) : (
            <div className={s.barCol}>
              <Link
                to={nextId ? `/quiz/${nextId}` : '/quiz'}
                className={`${ui.primaryBtn} ${ui.fullWidth}`}
              >
                {nextId ? 'すぐに次の問題を解く' : '問題一覧へ'}
              </Link>
              <button
                ref={expBtnRef}
                type="button"
                className={`${ui.subtleBtn} ${ui.fullWidth}`}
                aria-expanded={showExp}
                aria-controls={expId}
                onClick={showExp ? hideExplanation : showExplanation}
              >
                {showExp ? '解説を隠す' : '解説を見る'}
              </button>
            </div>
          )}
        </div>
        <ReportDialog questionId={q.id} open={reportOpen} onClose={() => setReportOpen(false)} />
      </div>
    </>
  )
}
