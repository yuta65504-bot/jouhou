import { useRef, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { TopAppBar } from '@/components/TopAppBar'
import { CheckIcon, CrossIcon, CircleIcon, StarIcon } from '@/components/Icons'
import { FIELDS } from '@/lib/fields'
import { useStore } from '@/lib/store'
import { questionById } from '@/content/questions'
import { getDemo } from '@/content/demos'
import { usePageTitle } from '@/lib/usePageTitle'
import ui from '@/styles/ui.module.css'
import s from './QuizQuestionPage.module.css'

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
  const expRef = useRef<HTMLDivElement>(null)

  if (!q) return <Navigate to="/quiz" replace />

  const field = FIELDS.find((f) => f.id === q.fieldId)!
  const isLater = later.includes(q.id)
  const demo = q.demoId ? getDemo(q.demoId) : undefined
  const answered = result != null

  /* 前回の結果（Storeに記録されている最新の解答）を表示用に取得 */
  const prevAttempt = [...store.attempts].reverse().find((a) => a.questionId === q.id)
  const introText = prevAttempt
    ? prevAttempt.correct
      ? '前回は正解しました。仕上げにもう一度確認しましょう。'
      : '前回は不正解でした。解説とデモで確認しましょう。'
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
    requestAnimationFrame(() => scrollToRef(expRef.current))
  }

  return (
    <>
      <TopAppBar
        title="問題"
        backTo="/quiz"
        right={
          <button
            type="button"
            className={`${ui.laterBtn} ${isLater ? ui.laterOn : ''}`}
            aria-pressed={isLater}
            aria-label={isLater ? '「後で解く」を解除' : 'あとで解く'}
            onClick={() => toggleLater(q.id)}
          >
            <StarIcon filled={isLater} />
          </button>
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
                disabled={answered}
                className={cls}
                onClick={() => setSelected(i)}
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
          <div className={`${s.feedback} ${result ? s.feedbackOk : s.feedbackNg}`} aria-live="polite">
            <span className={s.feedbackIcon} aria-hidden="true">
              {result ? <CheckIcon size={22} /> : <CrossIcon size={22} />}
            </span>
            <span className={s.feedbackText}>{result ? '正解！' : '不正解'}</span>
          </div>
        )}

        {/* 解説（「解説を見る」で開く）: 該当デモへの逆リンクつき */}
        {answered && showExp && (
          <section ref={expRef} className={`${ui.card} ${ui.cardPad}`} aria-label="解説">
            <h2 className={ui.sectionTitle}>解説</h2>
            {q.explanation.split('\n').map((para, i) => (
              <p key={i} className={s.expPara}>
                {para}
              </p>
            ))}
            {demo && (
              <Link to={`/fields/${field.id}/demo/${demo.id}`} className={s.demoLink}>
                ▶ デモで確かめる: {demo.title}
              </Link>
            )}
          </section>
        )}

        {/* 下部固定ボタン */}
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
          ) : !showExp ? (
            <button type="button" className={`${ui.subtleBtn} ${ui.fullWidth}`} onClick={showExplanation}>
              解説を見る
            </button>
          ) : (
            <Link
              to={q.demoId ? `/fields/${field.id}/demo/${q.demoId}` : '/quiz'}
              className={`${ui.primaryBtn} ${ui.fullWidth}`}
            >
              {demo ? 'デモで確かめる' : '問題一覧へ'}
            </Link>
          )}
        </div>
      </div>
    </>
  )
}
