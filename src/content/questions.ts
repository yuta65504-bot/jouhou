import { questionsSchema, type Question } from './schema'

/** ミニ問題（仕様書 §7.3）。解説には該当デモへの逆リンクを設置できる */
export const questions: Question[] = questionsSchema.parse([
  {
    id: 'q-soc-1',
    fieldId: 'society',
    difficulty: 1,
    text: 'スマートフォンアプリのボタン設計で、誤タップを減らすために適切なものはどれか。',
    choices: [
      'タップ領域を44px以上確保する',
      '文字を小さくしてボタンを詰め込む',
      'エラーの表示は色だけで伝える',
      'ボタンを画面の端ぎりぎりに置く',
    ],
    answerIndex: 0,
    explanation:
      'タップのしやすさは操作の正確さに直結する。目安として44px以上の領域を確保し、状態は色だけでなく文字やアイコンでも伝えるのが良い設計とされている。\n\n「UIの違いを比べる」デモで、入力画面の作り方による使いやすさの違いを確かめられる。',
    demoId: 'ui-compare',
  },
  {
    id: 'q-soc-2',
    fieldId: 'society',
    difficulty: 2,
    text: 'インターネット上の著作物の利用について、最も適切なものはどれか。',
    choices: [
      'URLさえ書けば、誰の作品でも自由に使ってよい',
      '作者の許諾がなくても、引用の条件を満たせば利用できる場合がある',
      '検索で見つかった画像は、すべて自由に使ってよい',
      '公開されている作品なら、改変して投稿してもよい',
    ],
    answerIndex: 1,
    explanation:
      '著作物は著作権表示がなくても保護の対象になる。ただし、出所を明示し、公正な慣行に合致し、その目的上正当な範囲内であるなどの条件を満たした「引用」は、許諾なしで利用できる例外として認められている。',
  },
  {
    id: 'q-net-1',
    fieldId: 'network',
    difficulty: 1,
    text: '8ビットで表すことができる状態の数はいくらか。',
    choices: ['16通り', '128通り', '256通り', '512通り'],
    answerIndex: 2,
    explanation:
      '1ビットは0か1の2通り。nビットで2のn乗通りを表せるので、8ビットでは2の8乗 = 256通り。\n\n「ビット演算を試す」デモで、ビット列が組み合わさって画像が変わる様子を確かめられる。',
    demoId: 'bit-ops',
  },
  {
    id: 'q-net-2',
    fieldId: 'network',
    difficulty: 2,
    text: 'ドメイン名とIPアドレスの対応づけを行う仕組みはどれか。',
    choices: ['DNS', 'DHCP', 'FTP', 'SMTP'],
    answerIndex: 0,
    explanation:
      'DNS（ドメインネームシステム）は、人間が覚えやすいドメイン名をIPアドレスに変換する仕組み。\n\nDHCPはIPアドレスの自動割り当て、FTPはファイル転送、SMTPはメール送信のプロトコルである。',
  },
  {
    id: 'q-pro-1',
    fieldId: 'programming',
    difficulty: 1,
    text: '「x ← 3」を実行したあと、「x ← x + 2」を実行したときの x の値はいくらか。',
    choices: ['3', '2', '5', '6'],
    answerIndex: 2,
    explanation:
      '代入（←）は右辺の値を左辺の変数に入れる操作。2行目では「今の x の値（3）」に2を加えた5が、あらためて x に入る。\n\n「DNCLステップ実行」デモで、1手ずつ値がどう変わるか確かめられる。',
    demoId: 'dncl-step',
  },
  {
    id: 'q-pro-2',
    fieldId: 'programming',
    difficulty: 2,
    text: '次のDNCL風プログラムを実行したときの s の値はいくらか。\ns ← 0\ni を 1 から 4 まで 増やしながら 繰り返す:\n　s ← s + i\n繰り返しここまで',
    choices: ['4', '6', '10', '24'],
    answerIndex: 2,
    explanation:
      'i が 1, 2, 3, 4 と変わり、そのたびに s ← s + i が実行される。s は 1 → 3 → 6 → 10 と変わるので、最終値は10。\n\n「DNCLステップ実行」デモで同じ流れを1手ずつ追える。',
    demoId: 'dncl-step',
  },
  {
    id: 'q-dat-1',
    fieldId: 'data',
    difficulty: 1,
    text: 'データ 2, 3, 3, 10 について、平均値と中央値の組合せとして正しいものはどれか。',
    choices: [
      '平均値 4.5、中央値 3',
      '平均値 3、中央値 4.5',
      '平均値 4.5、中央値 10',
      '平均値 10、中央値 4.5',
    ],
    answerIndex: 0,
    explanation:
      '平均値 = (2 + 3 + 3 + 10) ÷ 4 = 4.5。中央値は大きさ順に並べた 2, 3, 3, 10 の中央2つ（3と3）の平均 = 3。\n\n1つだけ大きな値（10）があるため、平均値は中央値より大きくなる。',
  },
  {
    id: 'q-dat-2',
    fieldId: 'data',
    difficulty: 2,
    text: '縦軸が50点から100点の範囲で描かれたテスト得点の折れ線グラフについて、正しいものはどれか。',
    choices: [
      '縦軸が0点から始まるグラフより、変化が大きく見えやすい',
      '縦軸の始まりの点によらず、見え方は同じになる',
      'データの個数が増える',
      'データの中央値が変わる',
    ],
    answerIndex: 0,
    explanation:
      '縦軸の始まりを0以外にすると、上下の幅が狭くなるため、同じ変化でも大きく見えやすい。データそのもの（個数や中央値）は変わらない。\n\n「グラフの見せ方を比べる」デモで、同じデータの見え方がどう変わるか確かめられる。',
    demoId: 'graph-explore',
  },
])

export function questionById(id: string): Question | undefined {
  return questions.find((q) => q.id === id)
}

export function questionsByField(fieldId: string): Question[] {
  return questions.filter((q) => q.fieldId === fieldId)
}
