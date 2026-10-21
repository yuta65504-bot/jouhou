# jouohu — 情報Ⅰ 共通テスト対策

「読む解説」ではなく「操作して理解する図解」。情報Ⅰの4分野を、インタラクティブデモ・用語図鑑・ミニ問題で学ぶWebサイトです。

## 技術スタック

- **Vite** + **React** + **TypeScript**（SPA。将来SSGを足せる構成）
- **React Router**（URLベース遷移、デモ画面はルート単位で `React.lazy` 遅延読込）
- 状態管理は React 標準 + Context。入力保存は **localStorage**（JSON エクスポート／インポート必須実装）
- スタイルは **CSS カスタムプロパティ + CSS Modules**、図解は **SVG + DOM**（Canvas不使用）
- コンテンツは zod でスキーマ検証（`npm test` / CI で必須項目の欠落を検出）
- ホスティングは **Cloudflare Pages**（PRごとのプレビューURLを監修に利用）。PWA は `manifest.json` のみ、Service Worker は未導入

## セットアップ

```bash
npm install
npm run dev      # 開発サーバー
npm run build    # 型チェック + 本番ビルド (dist/)
npm run preview  # ビルド結果の確認
npm test         # コンテンツの zod 検証 + DNCLエンジンのテスト
```

## ディレクトリ構成

```
src/
  content/        コンテンツデータ（zod スキーマで検証）
    schema.ts     用語・問題・デモ・DNCLプログラムのスキーマ
    terms.ts / questions.ts / demos.ts / dncl.ts
  lib/
    store.tsx     学習記録（Store）とエクスポート/インポート
    dates.ts      JST日付・連続学習日数の計算
    today.ts      「今日の1問」の選択
    fields.ts     4分野の定義
  components/     共通UI（レイアウト・下部タブ/サイドバー・カード・SVG図解レジストリ）
  demos/          4本のデモ
    ui-compare/   情報社会 L1: UI比較（Before/After切替＋差分ハイライト）
    bit-ops/      ネットワーク L1: ビット演算（AND/OR/XOR＋ビットグリッド）
    dncl/         プログラミング L2: DNCLステップ実行（Idle→Running→Paused→Finished/Error）
    graph/        データ活用 L1: グラフ操作（種類切替＋縦軸範囲Slider）
  pages/          画面（ホーム／分野／デモ／演習／用語／記録／設定）
  styles/
    tokens.css    デザイントークン（セマンティック・カラー、ダークモード、タップ領域44px）
    global.css    リセット・フォーカス表示・reduced motion 対応
    ui.module.css 共通パーツ
```

## URL 設計

| URL | 画面 |
|---|---|
| `/` | ホーム（連続日数・4分野カード・今日の1問） |
| `/fields` `/fields/:fieldId` | 分野一覧／詳細 |
| `/fields/:fieldId/demo/:demoId` | デモ（遅延読込） |
| `/quiz` `/quiz/:id` | 演習一覧（分野・難易度フィルタ）／問題 |
| `/terms` `/terms/:termId` | 用語一覧（検索）／詳細（覚えた・あいまい） |
| `/records` | 学習記録（カレンダー・正答率・苦手用語） |
| `/settings` | テーマ・エクスポート／インポート |

## アクセシビリティ

- コントラスト比4.5:1以上（テキスト用の ink バリアントを用意）
- 色だけに依存しない状態表示（必ずアイコン/テキスト併記）
- SVG図解に `role="img"` + `aria-label`（+ `<title>/<desc>`）
- ビット演算セルは `aria-pressed`、演算結果・DNCL状態は `aria-live="polite"`
- `prefers-reduced-motion` 対応、`:focus-visible` の定義、タップ領域44px以上

## 学習記録のデータモデル（localStorage, schemaVersion 1）

- `sessions`: 日別・分野別の解答数（{ date, fieldId, correct, total }）
- `attempts`: 1問ごとの解答履歴
- `termReviews`: 用語ごとの復習状態（known / unsure）
- 「後で解く」フラグ・デモ閲覧回数・テーマは別キーで保存。設定画面からJSONでエクスポート／インポート可能

## コンテンツの執筆・監修フロー

1. `src/content/` にデータを追加（スキーマ検証は `npm test`）
2. PRごとに Cloudflare Pages のプレビューURLで確認
3. 軽微な指摘はGitHubコメント、まとまった監修は共有ドキュメント（用途を固定）
4. 修正履歴は Git、コンテンツにバージョンを付与（package.json の version）
