import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import QuestionFigure, { QUESTION_FIGURE_IDS } from '../src/figures'

/**
 * 全72本の図解をSSRで描画するスモークテスト。
 * - 参照エラーやフック順序の破壊を早期に検出する
 * - SVG内にHTML（div/table/button/p/span/Calc）が入っていないことを確認する
 */
describe('question figures', () => {
  it('全72本がSSRで例外なく描画される', () => {
    expect(QUESTION_FIGURE_IDS.length).toBe(72)
    for (const id of QUESTION_FIGURE_IDS) {
      const html = renderToStaticMarkup(createElement(QuestionFigure, { id }))
      expect(html.length, `${id} が空`).toBeGreaterThan(0)
      expect(html, `${id} に図解タイトルがない`).toContain('<h3')
    }
  })

  it('SVGの中にHTML要素を置いていない', () => {
    for (const id of QUESTION_FIGURE_IDS) {
      const html = renderToStaticMarkup(createElement(QuestionFigure, { id }))
      const svgs = html.match(/<svg\b[\s\S]*?<\/svg>/g) ?? []
      for (const svg of svgs) {
        expect(svg, `${id} のSVG内にHTMLがある`).not.toMatch(/<(div|table|button|p|span|Calc)\b/)
      }
    }
  })
})
