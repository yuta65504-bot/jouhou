/** 4分野の定義（仕様書 §4 / §8） */

export const FIELD_IDS = ['society', 'network', 'programming', 'data'] as const
export type FieldId = (typeof FIELD_IDS)[number]

export function isFieldId(value: string): value is FieldId {
  return (FIELD_IDS as readonly string[]).includes(value)
}

export type Field = {
  id: FieldId
  name: string
  short: string
  colorVar: string
  tintVar: string
}

export const FIELDS: Field[] = [
  {
    id: 'society',
    name: '情報社会',
    short: 'デジタル化・著作者・セキュリティなど',
    colorVar: 'var(--field-society)',
    tintVar: 'var(--field-society-tint)',
  },
  {
    id: 'network',
    name: 'ネットワーク',
    short: 'ビット・プロトコル・データ通信など',
    colorVar: 'var(--field-network)',
    tintVar: 'var(--field-network-tint)',
  },
  {
    id: 'programming',
    name: 'プログラミング',
    short: '変数・条件分岐・繰り返し・DNCL',
    colorVar: 'var(--field-programming)',
    tintVar: 'var(--field-programming-tint)',
  },
  {
    id: 'data',
    name: 'データ活用',
    short: '集計・可視化・グラフの見せ方など',
    colorVar: 'var(--field-data)',
    tintVar: 'var(--field-data-tint)',
  },
]

export function getField(id: string): Field | undefined {
  return isFieldId(id) ? FIELDS.find((f) => f.id === id) : undefined
}
