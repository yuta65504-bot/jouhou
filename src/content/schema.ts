/** コンテンツの zod スキーマ（仕様書 §11: ビルド時検証） */
import { z } from 'zod'
import { FIELD_IDS } from '../lib/fields'

export const fieldIdSchema = z.enum(FIELD_IDS)

export const termSchema = z.object({
  id: z.string().min(1),
  fieldId: fieldIdSchema,
  name: z.string().min(1),
  short: z.string().min(1),
  description: z.string().min(1),
  /** 図解ID（figures レジストリに存在すること） */
  figure: z.string().min(1),
  related: z.array(z.string()),
})

export const questionSchema = z.object({
  id: z.string().min(1),
  fieldId: fieldIdSchema,
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  /** 学習テーマ（question.md の「テーマ」欄。演習一覧の絞り込み，表示用） */
  topic: z.string().min(1).optional(),
  /** 共通テストのどの出題に対応するか（question.md の「出典」欄） */
  source: z.string().min(1).optional(),
  text: z.string().min(1),
  choices: z.array(z.string()).length(4),
  answerIndex: z.number().int().min(0).max(3),
  explanation: z.string().min(1),
})

export const dnclProgramSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  note: z.string().min(1),
  /** DNCL風サブセットの行リスト */
  lines: z.array(z.string()),
})

export type Term = z.infer<typeof termSchema>
export type Question = z.infer<typeof questionSchema>
export type DnclProgram = z.infer<typeof dnclProgramSchema>

export const termsSchema = z.array(termSchema)
export const questionsSchema = z.array(questionSchema)
export const dnclProgramsSchema = z.array(dnclProgramSchema)
