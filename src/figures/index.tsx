/**
 * 問題ID → インタラクティブ図解 のレジストリ。
 * QuizQuestionPage から lazy import され、解説パネルを開いたときにだけ読み込まれる。
 */
import type { FC } from 'react'
import { SOC_FIGURES } from './society'
import { NET_FIGURES } from './network'
import { PRO_FIGURES } from './programming'
import { DAT_FIGURES } from './data'

/** 図解が存在する問題のID一覧（全72問） */
export const QUESTION_FIGURE_IDS = [
  ...Object.keys(SOC_FIGURES),
  ...Object.keys(NET_FIGURES),
  ...Object.keys(PRO_FIGURES),
  ...Object.keys(DAT_FIGURES),
] as const

export type QuestionFigureId = (typeof QUESTION_FIGURE_IDS)[number]

const ALL_FIGURES: Record<QuestionFigureId, FC> = {
  ...SOC_FIGURES,
  ...NET_FIGURES,
  ...PRO_FIGURES,
  ...DAT_FIGURES,
}

/** 解説内に表示する、問題ごとのインタラクティブ図解 */
export default function QuestionFigure({ id }: { id: string }) {
  const Fig = (ALL_FIGURES as Record<string, FC | undefined>)[id]
  if (!Fig) return null
  return <Fig />
}
