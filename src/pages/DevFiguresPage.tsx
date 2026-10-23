import { useState } from 'react'
import QuestionFigure, { QUESTION_FIGURE_IDS } from '@/figures'
import { questions } from '@/content/questions'
import { usePageTitle } from '@/lib/usePageTitle'
import { TopAppBar } from '@/components/TopAppBar'
import ui from '@/styles/ui.module.css'
import s from './DevFiguresPage.module.css'

const WIDTHS = [320, 375, 768] as const

/**
 * 開発用の図解ギャラリー。/dev/figures でだけ表示する。
 * 320/375/768px の幅で、文字サイズ・折返し・44px操作部品を目視確認する。
 */
export default function DevFiguresPage() {
  usePageTitle('図解ギャラリー（開発用）')
  const [width, setWidth] = useState<(typeof WIDTHS)[number]>(375)
  const byId = new Map(questions.map((q) => [q.id, q]))

  return (
    <>
      <TopAppBar title="図解ギャラリー" backTo="/settings" />
      <div className={s.page}>
        <h2 className={ui.srOnly}>全{QUESTION_FIGURE_IDS.length}問の図解一覧</h2>
        <p className={s.lead}>
          全{QUESTION_FIGURE_IDS.length}問の図解を、320/375/768pxを目安にしたカード幅で確認する開発用ページ。
          OSの「視差効果を減らす」をオンにすると、アニメーションなしの最終状態になる。
        </p>

        <div className={s.controls}>
          <span className={s.controlLabel} id="figure-width-label">
            表示幅
          </span>
          <div className={s.segmented} role="radiogroup" aria-labelledby="figure-width-label">
            {WIDTHS.map((w) => (
              <button
                key={w}
                type="button"
                role="radio"
                aria-checked={width === w}
                className={`${s.segment} ${width === w ? s.segmentOn : ''}`}
                onClick={() => setWidth(w)}
              >
                {w}px
              </button>
            ))}
          </div>
        </div>

        <div className={s.grid}>
          {QUESTION_FIGURE_IDS.map((id) => {
            const q = byId.get(id)
            return (
              <section key={id} className={s.card} style={{ maxWidth: width }} aria-label={`${id} の図解`}>
                <header className={s.cardHead}>
                  <span className={s.id}>{id}</span>
                  <span className={s.field}>{q?.fieldId ?? '—'}</span>
                </header>
                <QuestionFigure id={id} />
              </section>
            )
          })}
        </div>
      </div>
    </>
  )
}
