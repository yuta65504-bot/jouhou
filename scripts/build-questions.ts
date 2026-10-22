/**
 * question.md → src/content/questions.ts の生成スクリプト。
 *   npm run questions:build   （生成）
 *   npm run questions:check   （生成内容が最新かを確認。差分があれば終了コード1）
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseQuestions, renderQuestionsTs } from '../src/content/questionsFromMd'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const mdPath = resolve(root, 'question.md')
const outPath = resolve(root, 'src/content/questions.ts')

const check = process.argv.includes('--check')

const md = readFileSync(mdPath, 'utf8')
const questions = parseQuestions(md)
const output = renderQuestionsTs(questions)

if (check) {
  const current = readFileSync(outPath, 'utf8')
  if (current !== output) {
    console.error(
      'question.md と src/content/questions.ts が一致しません。`npm run questions:build` を実行してください。',
    )
    process.exit(1)
  }
  console.log(`question.md と src/content/questions.ts は一致しています（${questions.length}問）`)
} else {
  writeFileSync(outPath, output)
  console.log(`question.md → src/content/questions.ts を生成しました（${questions.length}問）`)
}
