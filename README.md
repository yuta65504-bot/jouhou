# jouhou — 情報Ⅰ 共通テスト対策

「読む解説」ではなく「操作して理解する図解」。情報Ⅰの4分野を、インタラクティブ図解・用語図鑑・ミニ問題で学ぶWebサイトです。

## 技術スタック

- **Vite** + **React** + **TypeScript**（SPA。将来SSGを足せる構成）
- **React Router**（URLベース遷移。問題ごとの図解は解説パネル内で `React.lazy` により遅延読込）
- 状態管理は React 標準 + Context。入力保存は **localStorage**（JSON エクスポート／インポート必須実装）
- スタイルは **CSS カスタムプロパティ + CSS Modules**、図解は **SVG + DOM**（Canvas不使用）
- コンテンツは zod でスキーマ検証（`npm test` / CI で必須項目の欠落を検出）
- ホスティングは **Cloudflare Pages**（PRごとのプレビューURLを監修に利用）と **GitHub Pages**（暫定公開。通報機能なし）。PWA は `manifest.json` のみ、Service Worker は未導入
- 報告機能は **Pages Functions + D1**（Cloudflare Pages のみ。ボット対策に **hCaptcha**。詳細は「報告APIの仕様」）

## セットアップ

```bash
npm install
npm run dev            # 開発サーバー
npm run build          # 型チェック + 本番ビルド (dist/)
npm run preview        # ビルド結果の確認
npm test               # questions.ts の一致 + コンテンツ検証 + 図解の静的/SSRチェック + DNCLエンジンのテスト
npm run check:figures  # 図解のSVG構造チェック（移行中の文字サイズ・インラインstyle警告も表示）
npm run questions:build # question.md → src/content/questions.ts を再生成
npm run questions:check # question.md と questions.ts の一致を確認（差分あれば終了コード1）
npm run check:functions # Pages Functions の型チェック
```

### 報告機能・管理者ページのセットアップ（D1 + Secrets + hCaptcha）

報告API（`/api/*`）の動作には Cloudflare 側の設定が必要です（サイト自体は設定なしでも動く）。

```bash
npx wrangler d1 create jouhou-reports                                 # D1 データベースを作成
npx wrangler d1 execute jouhou-reports --remote --file=d1/schema.sql  # reports テーブルを作成
```

そのうえで、Cloudflare Pages プロジェクトの設定で以下を行います（`functions/` は自動検出されます）。

- **D1 バインディング** `DB` → 上で作成したデータベース（設定 → Functions → D1 バインド）
- **Secrets** `HCAPTCHA_SECRET`（hCaptcha のシークレットキー）と `ADMIN_TOKEN`（管理者ページ用トークン。32文字以上のランダム値）。ダッシュボードまたは `npx wrangler pages secret put HCAPTCHA_SECRET` で設定
- **任意の Secrets** `HCAPTCHA_HOSTNAME`（本番ドメイン。設定すると siteverify の hostname も検証し、他ドメインで発行されたトークンを拒否する）
- **ビルド変数** `VITE_HCAPTCHA_SITEKEY`（hCaptcha のサイトキー。公開情報）。未設定でもサイトは動作し、報告フォームは「送信できない」旨を表示する

ローカルでの動作確認は Vite 単体（`npm run dev`）では `/api` が動かないため、ビルド結果に対して Wrangler を使います。

```bash
VITE_HCAPTCHA_SITEKEY=0x<hCaptchaのサイトキー> npm run build   # クライアントにサイトキーを組み込む（.env.local でも可）
npx wrangler pages dev dist                                    # Functions + 静的アセットをローカル実行
```

- Function 側のシークレットは `.dev.vars` に書く（`.dev.vars.example` 参照・Gitにコミットしない）
- `public/_routes.json` により Functions の起動範囲を `/api/*` に限定している（静的ページのリクエストでFunctionsを消費しない）
- 管理者ページは `/admin` をURL直打ちで開き、`ADMIN_TOKEN` と一致するトークンを入力すると報告一覧を取得・更新できる。トークン値は端末の sessionStorage に保存する（タブを閉じると消える。報告データ自体はD1のみ）

## GitHub Pages での公開（通報機能なし）

`main` への push で GitHub Actions が静的ビルドを GitHub Pages に公開します（`.github/workflows/deploy-pages.yml`）。

- 公開URL: `https://yuta65504-bot.github.io/jouhou/`（プロジェクトページ。base は `/jouhou/`）
- 初回のみ **Settings → Pages → Build and deployment → Source** を **GitHub Actions** に設定する
- GitHub Pages ビルドでは `VITE_REPORTS_ENABLED=false` を指定する。問題画面の報告ボタンは残るが、開くと「この公開版では通報機能を利用できません。」と表示され、`/admin` の報告一覧も同じ案内になる
- `/api/*`（Pages Functions）・D1・hCaptcha は GitHub Pages では動かない。報告機能を使う場合は Cloudflare Pages のデプロイを使う
- `_headers` は GitHub Pages では適用されないため、CSP などのセキュリティヘッダは付かない
- SPA の直リンクは `dist/404.html` 経由で表示される（HTTPステータスは404）。独自ドメインを使う場合も `actions/configure-pages` の `base_path` に追従する
- Cloudflare Pages と GitHub Pages は別オリジンなので、localStorage の学習記録は引き継がれない。設定画面のエクスポート／インポートで移行する
- ローカル確認: `PAGES_BASE_PATH=/jouhou/ VITE_REPORTS_ENABLED=false npm run build` のあと `cp dist/index.html dist/404.html` し、`PAGES_BASE_PATH=/jouhou/ npm run preview` で `/jouhou/` を開く

## ディレクトリ構成

```
src/
  content/        コンテンツデータ（zod スキーマで検証）
    schema.ts     用語・問題・DNCLプログラムのスキーマ
    terms.ts / questions.ts / dncl.ts
    questionsFromMd.ts  question.md のパーサ（questions.ts の生成に利用）
  lib/
    store.tsx     学習記録（Store）とエクスポート/インポート
    dates.ts      JST日付・連続学習日数の計算
    today.ts      「今日の1問」の選択
    nextQuestion.ts  「すぐに次の問題を解く」の翌問題ID（末尾は先頭へ戻る）
    report.ts     報告の種別・APIクライアント（Functionsと共通の型/ガード）
    features.ts   ビルド時の機能フラグ（GitHub Pages では通報を無効化）
    fields.ts     4分野の定義
    dncl-engine.ts  DNCL風サンプルのステップ実行エンジン（図解で利用）
  components/     共通UI（レイアウト・下部タブ/サイドバー・カード・SVG図解レジストリ）
  figures/        問題ごとのインタラクティブ図解（72本）
    index.tsx     問題ID → 図解のレジストリ（解説パネルで遅延読込）
    parts.tsx     共通パーツ（FigShell / Btn / Slider / SVG部品）
    society.tsx / network.tsx / programming.tsx / data.tsx  分野ごとの18本
  pages/          画面（ホーム／分野／演習／用語／記録／設定／管理者）
  styles/
    tokens.css    デザイントークン（セマンティック・カラー、ダークモード、タップ領域44px）
    global.css    リセット・フォーカス表示・reduced motion 対応
    ui.module.css 共通パーツ
functions/
  api/reports.ts  報告API（hCaptcha検証・D1への保存、一覧取得・ステータス更新）
  api/reports/[id].ts  報告1件の status 更新（PATCH）
  api/_lib.ts     報告API共通（認証・CAPTCHA検証・レート制限、共通型/ガードの再エクスポート）
scripts/
  build-questions.ts  question.md → src/content/questions.ts の生成/一致確認
d1/schema.sql      報告テーブル（reports）のDDL
.github/workflows/deploy-pages.yml  GitHub Pages へのデプロイ（通報機能なし）
public/_headers    セキュリティヘッダ（CSP など。Cloudflare Pages が dist/ 直下へ反映）
question.md        問題の一次ソース（問題バンク。下記「問題バンクの編集」参照）
```

## URL 設計

| URL | 画面 |
|---|---|
| `/` | ホーム（連続日数・4分野カード・今日の1問） |
| `/fields` `/fields/:fieldId` | 分野一覧／詳細 |
| `/quiz` `/quiz/:id` | 演習一覧（分野・難易度フィルタ）／問題 |
| `/terms` `/terms/:termId` | 用語一覧（検索）／詳細（覚えた・あいまい） |
| `/records` | 学習記録（カレンダー・正答率・苦手用語） |
| `/settings` | テーマ・エクスポート／インポート |
| `/admin` | 管理者用（問題・解答の一覧と報告の一覧） |

## 問題・演習の仕様

- プログラミング分野の問題はDNCLメインではなく、共通テストの過去問を参考にした形式で作成する（DNCLのステップ実行は問題の図解で補助的に扱う）
- 各問題の解説パネルには、問題IDに対応したインタラクティブ図解を表示する（操作ボタン・スライダー・セグメントで動かせる）
- 問題画面では回答後に「すぐに次の問題を解く」ボタンを表示し、余分な画面遷移を挟まず連続で解答できるようにして、効率的な学習を支援する
- 問題と解答を表示するユーザー画面（`/quiz/:id`）に「報告」ボタンを設置する。送信された報告は管理者ページ（`/admin`）に追加される
- 問題と解答の一覧を表示する管理者ページ（`/admin`）を用意する。メインページなどからの遷移ボタンは必要としない（URL入力で直接アクセスする）

## 問題バンク（question.md）

問題の一次ソースはリポジトリ直下の `question.md`。`src/content/questions.ts` はここから自動生成し、`npm test` で一致を検証する。

- **1問 = 1つの `###` ブロック**。見出しは `### q-<field>-<番号>`（`q-soc` / `q-net` / `q-pro` / `q-dat`）。IDは全ファイル内で一意にする
- メタ行: `- 分野:`（society / network / programming / data）、`- 難易度:`（1〜3）、`- テーマ:`（学習テーマ）、`- 出典:`（共通テストの出題との対応）
- セクション: `**問題文**` → `**選択肢**`（4つ）→ `**正解**`（1〜4の番号）→ `**解説**`
- 解説パネルには、問題IDに対応したインタラクティブ図解（`src/figures/`）が自動で表示される。question.md に図解用の記述は不要
- 編集手順: `question.md` に追記 → `npm run questions:build` → `npm test`（差分があれば `questions:check` が失敗する）

### 収録範囲

共通テスト（令和7年度本試・試作問題）の出題傾向に沿って、情報Ⅰの全範囲を4分野に分けて収録する。現在の収録数とテーマ:

| 分野 | 問数 | 主なテーマ |
|---|---|---|
| 情報社会 | 18 | 著作権・引用・特許権・肖像権／個人情報保護／情報モラルと信ぴょう性／情報システム／問題解決／アンケート／標本化・量子化・解像度・圧縮・データ量／情報デザイン |
| ネットワーク | 18 | ビットと基数変換／誤り訂正（パリティ）／データ量と転送時間／プロトコル／IPアドレスとサブネットマスク／パケット／暗号方式・デジタル署名・認証／攻撃と防御／無線LAN |
| プログラミング | 18 | 変数と代入／条件分岐／繰り返し／配列と二次元配列／逐次探索・二分探索／選択ソート・挿入ソート／計算量／五大装置と論理回路／関数／モデル化とシミュレーション |
| データ活用 | 18 | 最頻値と値域／箱ひげ図／標準偏差／相関と回帰直線／外れ値と欠損値／尺度水準／データベース（主キー・SQL）／ヒストグラム／分析の進め方／グラフの選び方／移動平均と時系列 |

## 報告APIの仕様（Pages Functions + D1 + hCaptcha）

- 報告の保存先は **D1** に決定する（KVは使用しない）。一覧取得・対応状況の更新をSQLで行え、書き込みは低頻度でD1の無料枠に収まる
- Pages Function は D1 バインディング（`DB`）を介してD1にアクセスする
- 報告の送信は `POST /api/reports`（Pages Function）。報告フォームに hCaptcha ウィジェットを表示し、トークンを合わせて送信、Function 内で hCaptcha の siteverify API を呼び出して検証する。検証に失敗した送信は保存しない
  - `HCAPTCHA_SECRET` は Secrets で管理し、クライアントには参照させない
  - CAPTCHA は hCaptcha で固定。Turnstile などへの差し替えは siteverify 部分のみの変更で済む構成にする
- `reports` テーブル: `id`（UUID）、`questionId`、`category`（D1には英文キー `typo` / `answer` / `layout` / `other` で保存し、UIでは「誤字・脱字／解答・解説の誤り／表示崩れ／その他」の日本語ラベルで表示する）、`message`、`status`（`open` / `resolved`）、`createdAt`
- 管理者ページ（`/admin`）は `GET /api/reports`（管理トークン `ADMIN_TOKEN` を Secrets で管理し、Bearer 認証で要求する）で報告一覧を取得し、問題・解答と並べて表示する。対応済みの報告は `PATCH /api/reports/:id` で `status` を `resolved` に更新する
- 報告は localStorage には保存せず、D1 のみに保存する

## セキュリティ

- **セキュリティヘッダ**: `public/_headers` で CSP（`script-src`/`frame-src` は hCaptcha のみ許可）・`X-Content-Type-Options`・`X-Frame-Options`・`Referrer-Policy`・`Permissions-Policy` を付与する
- **管理APIの保護**: `ADMIN_TOKEN` は 32文字以上のランダム値を Secrets に設定する。照合は内容によらず一定回数比較する（早期リターンしない）。`GET/PATCH /api/reports` は同一IPあたり1分30回、`POST /api/reports` は10分10回に制限する
  - レート制限は Workers isolate 内のメモリで保持するベストエフォート実装（isolate 入れ替わりでリセットされる）。大規模な攻撃が想定される場合は Cloudflare WAF のレート制限ルールを併用する
- **CAPTCHA**: `POST /api/reports` は siteverify 成功時のみ保存する。`HCAPTCHA_HOSTNAME` を設定すると hostname も検証する
- **保存するのはトークンではなくセッション**: 管理トークンは sessionStorage に保存し、旧バージョンが localStorage に残した値を起動時に削除する
- **インジェクション対策**: D1 へのアクセスはすべてプレースホルダ束縛、UI は React のエスケープに依存（`dangerouslySetInnerHTML` は不使用）、`question.md` からのコード生成は `\`・`'`・改行・CR・U+2028/2029 をエスケープする
- **依存関係**: 実行時依存は `npm audit --omit=dev` で 0 件。開発用ツール（vitest/vite 系）の指摘はビルド成果物には含まれない

## アクセシビリティ

- コントラスト比4.5:1以上（テキスト用の ink バリアントを用意）
- 色だけに依存しない状態表示（必ずアイコン/テキスト併記）
- SVG図解に `role="img"` + `aria-label`（+ `<title>/<desc>`）
- ビット演算セルは `aria-pressed`、演算結果・DNCL状態は `aria-live="polite"`
- `prefers-reduced-motion` 対応、`:focus-visible` の定義、タップ領域44px以上
- 図解の動作確認は `npm run dev` で `/dev/figures`（開発時のみ）。320/375/768pxを切り替えて、文字サイズ・折返し・操作部品の大きさを確認できる
- 図解のモーションは100〜240ms（バウンド・無限ループなし）。自動再生は初期状態で停止し、`prefers-reduced-motion` では再生ボタンを出さず即時表示にする

## 学習記録のデータモデル（localStorage, schemaVersion 1）

- `sessions`: 日別・分野別の解答数（{ date, fieldId, correct, total }）
- `attempts`: 1問ごとの解答履歴
- `termReviews`: 用語ごとの復習状態（known / unsure）
- 「後で解く」フラグ・テーマは別キーで保存。設定画面からJSONでエクスポート／インポート可能

## コンテンツの執筆・監修フロー

問題の監修はオーナー本人が行う。

1. 問題は `question.md` に追記し、`npm run questions:build` で `src/content/questions.ts` を再生成する（他のコンテンツは `src/content/` に直接追加、スキーマ検証は `npm test`）
2. PRごとに Cloudflare Pages のプレビューURLで確認
3. 軽微な指摘はGitHubコメント、まとまった監修は共有ドキュメント（用途を固定）
4. 修正履歴は Git、コンテンツにバージョンを付与（package.json の version）
