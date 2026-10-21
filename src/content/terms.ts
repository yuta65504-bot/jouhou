import { termsSchema, type Term } from './schema'

/** 用語図鑑（仕様書 §7.4）。図解は Figure レジストリのIDで参照 */
export const terms: Term[] = termsSchema.parse([
  {
    id: 'digital-data',
    fieldId: 'society',
    name: 'デジタルデータ',
    short: '情報を0と1の列で表したもの',
    description:
      '文字・音・画像などの情報を、0と1の並び（ビット列）に置き換えたもの。\n\n画像は小さな点（画素）ごとに色を数値に、音は一定間隔ごとの大きさを数値にして記録する。数値化することで、コンピュータで保存・複製・加工がしやすくなる。',
    figure: 'digital-data',
    related: ['bit', 'packet'],
  },
  {
    id: 'encryption',
    fieldId: 'society',
    name: '暗号化',
    short: '特別な規則で読めなくして守る仕組み',
    description:
      'データをそのままでは意味が分からない形に変換すること。元に戻すには「鍵」が必要で、鍵を持つ人だけが内容を読める。\n\nログインや送金など、大切な情報をやりとりするときに使われている。',
    figure: 'encryption',
    related: ['digital-data'],
  },
  {
    id: 'copyright',
    fieldId: 'society',
    name: '著作権',
    short: '作品を勝手に使われないための作者の権利',
    description:
      '本・音楽・画像・プログラムなど、人が作った著作物を勝手に使われないようにする権利。著作権表示がなくても成立している。\n\nネットで見つけた画像でも、作者の許諾なしに転載・投稿するのは原則として禁止。許諾の条件を満たした「引用」は例外として認められる。',
    figure: 'copyright',
    related: ['digital-data'],
  },
  {
    id: 'bit',
    fieldId: 'network',
    name: 'ビット',
    short: '0か1を表す情報の最小単位',
    description:
      'ビットは0か1のどちらかを表せる、情報の最小の単位。8ビットで256通り（0〜255）の状態を表せる。\n\n画像の色や文字も、このビットの並びで表現されている。',
    figure: 'bit',
    related: ['binary', 'digital-data'],
    demoId: 'bit-ops',
  },
  {
    id: 'binary',
    fieldId: 'network',
    name: '2進数',
    short: '0と1だけで数を表す方法',
    description:
      '2進数は0と1だけの2種類の数字で数を表す方法。1桁上に行くと重みが2倍になる（1, 2, 4, 8…）。\n\nコンピュータの内部では、すべての数が2進数で扱われている。',
    figure: 'binary',
    related: ['bit'],
  },
  {
    id: 'packet',
    fieldId: 'network',
    name: 'パケット',
    short: 'データを小分けにした送信の単位',
    description:
      '大きなデータはそのまま送らず、小さな塊（パケット）に分けて送る。各パケットには宛先や順番の情報が付いている。\n\n分けて送ることで、回線を複数人で共有しやすくなり、途中で途切れても一部分だけを送り直せる。',
    figure: 'packet',
    related: ['ip-address', 'digital-data'],
  },
  {
    id: 'ip-address',
    fieldId: 'network',
    name: 'IPアドレス',
    short: 'ネットワーク上の機器に付けた番号',
    description:
      'ネットワークに接続した機器を区別するための番号（住所のようなもの）。データの送り先を指定するときに使う。\n\nドメイン名（www.example.jp など）とIPアドレスの対応づけは、DNSが行っている。',
    figure: 'network',
    related: ['packet'],
  },
  {
    id: 'variable',
    fieldId: 'programming',
    name: '変数',
    short: '値を入れておいて名前で使える箱',
    description:
      '変数は値を入れておく「箱」。名前を付けておけば、プログラムの中で何度もその値を使える。\n\n代入（←）で箱の中身を入れ替える。同じ名前でも時々刻々と中身が変わるから「変数」。',
    figure: 'variable',
    related: ['condition', 'iteration'],
    demoId: 'dncl-step',
  },
  {
    id: 'condition',
    fieldId: 'programming',
    name: '条件分岐',
    short: '条件によって動きを変える構造',
    description:
      '条件分岐は「もし〜ならばA、そうでなければB」というように、条件の結果で実行する処理を変える構造。\n\n共通テストのDNCLでは if 条件 then … else … end と書く。',
    figure: 'branch',
    related: ['variable', 'iteration'],
    demoId: 'dncl-step',
  },
  {
    id: 'iteration',
    fieldId: 'programming',
    name: '繰り返し',
    short: '同じ処理をまとめて行う構造',
    description:
      '繰り返しは、同じような処理を何度も書かずにすむ構造。「i を 1 から 5 まで 増やしながら 繰り返す」のように回数や範囲を指定する。\n\n条件が真のまま変わらないと、プログラムが止まらなくなる（無限ループ）。',
    figure: 'loop',
    related: ['condition'],
    demoId: 'dncl-step',
  },
  {
    id: 'average',
    fieldId: 'data',
    name: '平均値',
    short: '全部足して個数で割った値',
    description:
      '平均値は、全データを足して個数で割った値。全体の「中心」を1つの数で表す。\n\n1つだけ極端に大きい（小さい）データがあると、平均はその影響を強く受ける。',
    figure: 'average',
    related: ['median', 'graph-display'],
  },
  {
    id: 'median',
    fieldId: 'data',
    name: '中央値',
    short: '大きさ順に並べたときのちょうど真ん中の値',
    description:
      'データを大きさの順に並べたとき、ちょうど中央に来る値が中央値。データ数が偶数のときは、中央の2つの値の平均を取る。\n\n極端に大きなデータや小さなデータが混ざっていても、中央値はあまり影響を受けない。',
    figure: 'median',
    related: ['average'],
  },
  {
    id: 'graph-display',
    fieldId: 'data',
    name: 'グラフの見せ方',
    short: '軸の範囲や種類で印象が変わる',
    description:
      '同じデータでも、縦軸の始まりを0からにするか50からにするか、棒グラフにするか折れ線グラフにするかで、受ける印象が大きく変わる。\n\nグラフを読むときは「縦軸はどこから始まっているか」「増減が誇張されていないか」を確かめる。',
    figure: 'truncated-axis',
    related: ['average', 'median'],
    demoId: 'graph-explore',
  },
])
