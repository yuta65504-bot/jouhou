/**
 * question.md（問題の一次ソース）を解析し、アプリ用のデータへ変換する。
 *
 * 執筆フロー:
 *   1. question.md に問題を追記する（下記の書式）
 *   2. `npm run questions:build` で src/content/questions.ts を再生成する
 *   3. `npm test` で「question.md と questions.ts が一致しているか」を検証する
 *
 * question.md の書式（1問 = 1つの `###` ブロック）:
 *
 * ```md
 * ### q-soc-01
 *
 * - 分野: society
 * - 難易度: 1
 * - テーマ: 情報デザイン・操作のしやすさ
 * - 参考: 配列の添字（問題文・図表は本サイトの独自作成）
 *
 * **問題文**
 *
 * 問題文の本文
 *
 * **選択肢**
 *
 * 1. 選択肢1
 * 2. 選択肢2
 * 3. 選択肢3
 * 4. 選択肢4
 *
 * **正解**: 1
 *
 * **解説**
 *
 * 解説の段落
 * ```
 */
import { FIELD_IDS, isFieldId, type FieldId } from '../lib/fields'

export type ParsedQuestion = {
  id: string
  fieldId: FieldId
  difficulty: 1 | 2 | 3
  topic: string
  source?: string
  text: string
  choices: string[]
  answerIndex: number
  explanation: string
}

/** 1問分のブロック（`###` から次の `###` まで）を解析する */
function parseBlock(id: string, body: string): ParsedQuestion {
  const meta: Record<string, string> = {}
  const sections: Record<string, string[]> = {}
  let current: string | null = null

  /* 関数宣言（明示的な never 戻り値）にして、ガード後の型の絞り込みを効かせる */
  function fail(msg: string): never {
    throw new Error(`question.md: 問題「${id}」の書式が不正です（${msg}）`)
  }

  for (const raw of body.split('\n')) {
    const line = raw.trim()

    // メタ行: `- 分野: society`
    const metaMatch = /^-\s+([^:：]+)[:：]\s*(.*)$/.exec(line)
    if (metaMatch) {
      meta[metaMatch[1].trim()] = metaMatch[2].trim()
      continue
    }

    // セクション見出し: `**問題文**` / `**正解**: 1`
    const secMatch = /^\*\*(.+?)\*\*(?:\s*[:：]\s*(.*))?$/.exec(line)
    if (secMatch) {
      current = secMatch[1].trim()
      sections[current] = secMatch[2] ? [secMatch[2].trim()] : []
      continue
    }

    if (current) sections[current].push(raw)
  }

  const fieldId = meta['分野']
  if (!fieldId || !isFieldId(fieldId)) {
    fail(`分野が不正です: ${fieldId ?? '(未入力)'}（${FIELD_IDS.join(' / ')} のいずれか）`)
  }

  const difficultyRaw = Number(meta['難易度'])
  if (![1, 2, 3].includes(difficultyRaw)) {
    fail(`難易度が不正です: ${meta['難易度'] ?? '(未入力)'}（1 / 2 / 3 のいずれか）`)
  }

  const topic = meta['テーマ']
  if (!topic) fail('テーマが未入力です')

  const text = (sections['問題文'] ?? []).join('\n').trim()
  if (!text) fail('問題文がありません')

  const choices: string[] = []
  for (const line of sections['選択肢'] ?? []) {
    const m = /^\s*(\d+)\.\s+(.+)$/.exec(line)
    if (m) choices.push(m[2].trim())
  }
  if (choices.length !== 4) fail(`選択肢は4つ必要です（${choices.length}個見つかりました）`)

  const answerRaw = Number((sections['正解'] ?? [])[0])
  if (!Number.isInteger(answerRaw) || answerRaw < 1 || answerRaw > 4) {
    fail(`正解が不正です: ${(sections['正解'] ?? [])[0] ?? '(未入力)'}（1〜4 の番号）`)
  }

  const explanation = (sections['解説'] ?? [])
    .join('\n')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .join('\n\n')
  if (!explanation) fail('解説がありません')

  return {
    id,
    fieldId,
    difficulty: difficultyRaw as 1 | 2 | 3,
    topic,
    source: meta['参考'] || undefined,
    text,
    choices,
    answerIndex: answerRaw - 1,
    explanation,
  }
}

/** question.md 全体を解析する */
export function parseQuestions(md: string): ParsedQuestion[] {
  const blocks: { id: string; body: string }[] = []
  let currentId: string | null = null
  let currentBody: string[] = []

  const flush = () => {
    if (currentId) blocks.push({ id: currentId, body: currentBody.join('\n') })
    currentId = null
    currentBody = []
  }

  for (const line of md.split('\n')) {
    const m = /^###\s+(.+?)\s*$/.exec(line)
    if (m) {
      flush()
      currentId = m[1].trim()
      continue
    }
    if (currentId) currentBody.push(line)
  }
  flush()

  if (blocks.length === 0) throw new Error('question.md: 問題（### 見出し）が見つかりません')

  const questions = blocks.map((b) => parseBlock(b.id, b.body))
  const ids = new Set(questions.map((q) => q.id))
  if (ids.size !== questions.length) {
    const dup = questions.map((q) => q.id).find((id, i, arr) => arr.indexOf(id) !== i)
    throw new Error(`question.md: 問題IDが重複しています: ${dup}`)
  }
  return questions
}

const tsString = (s: string): string => {
  const escaped = s
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\r/g, '\\r')
    .replace(/\n/g, '\\n')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
  return `'${escaped}'`
}

/** 解析した問題を src/content/questions.ts のソースへ変換する */
export function renderQuestionsTs(questions: ParsedQuestion[]): string {
  const body = questions
    .map((q) => {
      const lines = [
        `    id: ${tsString(q.id)},`,
        `    fieldId: ${tsString(q.fieldId)},`,
        `    difficulty: ${q.difficulty},`,
        `    topic: ${tsString(q.topic)},`,
      ]
      if (q.source) lines.push(`    source: ${tsString(q.source)},`)
      lines.push(`    text: ${tsString(q.text)},`)
      lines.push(`    choices: [`)
      for (const c of q.choices) lines.push(`      ${tsString(c)},`)
      lines.push(`    ],`)
      lines.push(`    answerIndex: ${q.answerIndex},`)
      lines.push(`    explanation: ${tsString(q.explanation)},`)
      return `  {\n${lines.join('\n')}\n  },`
    })
    .join('\n')

  return `// ============================================================
// このファイルは自動生成です。手で編集しないでください。
// 問題の一次ソースは question.md（リポジトリ直下）です。
//   編集: question.md → \`npm run questions:build\`
// ============================================================
import { questionsSchema, type Question } from './schema'

/** ミニ問題（仕様書 §7.3）。question.md から自動生成 */
export const questions: Question[] = questionsSchema.parse([
${body}
])

export function questionById(id: string): Question | undefined {
  return questions.find((q) => q.id === id)
}

export function questionsByField(fieldId: string): Question[] {
  return questions.filter((q) => q.fieldId === fieldId)
}
`
}
