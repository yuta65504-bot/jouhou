# 引き継ぎメモ: 図解UI・モーション改善（Plan A）

最終更新: 2026-10-23

## このファイルの目的

情報Ⅰクイズアプリの「雑に見える」図解UIと解説アニメーションを改善する Plan A の、
現時点の成果物・検証結果・残作業をまとめた引き継ぎ資料。

実装は「共通モーション基盤＋代表8図解」まで完了している。
残り64図解の移行と、実ブラウザでの最終確認が未完了。

---

## 現在の状態

### 完了

- 共通モーション基盤
  - `src/styles/tokens.css`
  - `src/lib/motion.ts`
  - `src/figures/parts.tsx`
  - `src/figures/figures.module.css`
- 代表8図解の新デザイン移行
  - `SocFig1`, `SocFig3`
  - `NetFig2`, `NetFig6`
  - `ProFig1`, `DnclStepper`（`ProFig3` / `ProFig4` で使用）
  - `DatFig1`, `DatFig5`
- 解説・回答まわりの改善
  - `src/pages/QuizQuestionPage.tsx`
  - `src/pages/QuizQuestionPage.module.css`
- 品質チェックの追加
  - `scripts/check-figures.ts`
  - `tests/figures.test.ts`
- 開発用ギャラリー
  - `src/pages/DevFiguresPage.tsx`
  - `src/pages/DevFiguresPage.module.css`
  - `/dev/figures`（`import.meta.env.DEV` のときだけ有効）
- README 更新

### 検証済み（2026-10-23 時点）

以下はすべて成功。

```bash
npx tsc --noEmit
npm test
npm run build
git diff --check
```

- `npm test`: 4ファイル / 27テスト成功
- `check:figures`: SVG内HTML 0件
- `check:figures` の警告
  - `fontSize < 11`: 105件
  - インラインstyle: 41件
  - これらは主に未移行のレガシー図解。失敗ではなく「移行中の目安」
- production build 成功

### 未コミット

現時点の変更はすべて未コミット。

- 変更済み: 13ファイル
- 新規: `scripts/check-figures.ts`, `src/lib/motion.ts`,
  `src/pages/DevFiguresPage.module.css`, `src/pages/DevFiguresPage.tsx`,
  `tests/figures.test.ts`（＋この `HANDOFF.md`）

コミットする場合は、例えば以下のように分割できる。

1. 共通モーション基盤・共通パーツ
2. 代表8図解の移行
3. 解説・回答UIのアクセシビリティ改善
4. 静的チェック・SSRテスト・開発ギャラリー

---

## 実装方針（変更しない前提）

- モーションは 100〜240ms の控えめな動き
- バウンド・オーバーシュート・無限ループなし
- 1回の動きは合計300ms以内
- 自動再生は存在するが、初期状態は停止
- `prefers-reduced-motion: reduce` では
  - アニメーションを即時最終状態にする
  - 自動再生を無効化する
  - 再生ボタンを表示しない
- 44px以上の操作領域
- キーボード操作可能
- `aria-pressed` / `aria-live` / `role="status"` を適切に使う
- 色だけに依存しない状態表示
- 既存64図解を壊さない
- 新しいアニメーション依存ライブラリは追加しない

### モーショントークン

| 用途 | 値 |
|---|---|
| press | 100ms |
| fade / step | 180ms |
| highlight / bar / scale | 220ms |
| draw | 240ms |
| 標準イージング | `cubic-bezier(.2, 0, 0, 1)` |
| 強調イージング | `cubic-bezier(.2, .8, .2, 1)` |

### レイアウト上限

- 図解全体: 最大 560px
- セル列 / Readout / ビット行: 最大 440px
- デスクトップで間延びしないように中央寄せ

---

## 代表8の変更点

| 図解 | 主な変更 |
|---|---|
| `SocFig1` | 44px基準線をSVG内に描画。スライダーに `aria-valuetext`。サイズ変更を 220ms の scale で表現。 |
| `SocFig3` | 条件トグル、進捗バー、Readout。✓/✗ と `aria-pressed` で色に依存しない状態表示。 |
| `NetFig2` | DNS問い合わせ→応答のレイアウトを再構成。ドメインボックスと矢印の交差を解消。応答矢印はIPボックスへ向ける。 |
| `NetFig6` | 8データビット＋パリティの9ビット送信列。受信誤り行、`aria-pressed`、誤りセルの「誤」マーク。ビット行は `auto-fill` で折返し、全行の列を揃える。 |
| `ProFig1` | 調査済みセルに✓。未達セルは破線＋muted。status の off-by-one を修正。 |
| `DnclStepper` | `displayLines` / `lineMap` を維持。現在行の自動スクロール、status短縮、reduced-motion対応。 |
| `DatFig1` | 重複する3を横方向にオフセット。平均・中央値・外れ値ラベルを整理。 |
| `DatFig5` | バーを20ms stagger（合計300ms以内）。平均ラベル位置を修正。σを数値アニメーション。 |

### 共通パーツの互換API

残り64図解を壊さないため、以下は意図的に残している。

- `FigShell` = `FigureFrame` の互換ラッパー
- `View` = `Canvas` の互換エイリアス
- `Calc` = `Readout` の互換エイリアス

消さないこと。

---

## 残作業（優先順）

### 1. 実ブラウザ・実機での確認（最優先／現在ブロック中）

ブラウザまたはヘッドレスChromeが未インストールのため、以下は未確認。

```bash
npm run dev
# http://localhost:5173/dev/figures
```

確認すること:

- 320 / 375 / 768px 幅
- 320pxで横スクロールが出ない
- 操作部品が44px以上
- 9ビット行の折返しと列の揃い
- ステータス行の高さが変わらず、レイアウトがガタつかない
- テキストと図形の重なりがない
- デスクトップで図解が560px以上に間延びしない
- キーボード
  - Tab順
  - スライダー
  - セグメント（radio）
  - ステップ操作
  - トグル
  - 回答後のフィードバックへのフォーカス
  - 解説の開閉とフォーカス復帰
- `prefers-reduced-motion: reduce`
  - アニメーションなし
  - 自動再生なし
  - 再生ボタン非表示
  - 最終状態が即時表示
- スクリーンリーダー（可能なら）
  - status の読み上げ
  - 自動再生中に status が連続読み上げされない
  - 正解・不正解の選択肢が分かる
  - ビットの `aria-pressed`
- 360px前後・200%ズームなどの追加確認

ブラウザ確認のための Playwright 等は、明示的な依頼がない限り追加しない方針。

### 2. 残り64図解の段階的移行

`npm run check:figures` の警告件数（現時点）:

| ファイル | fontSize < 11 | インラインstyle |
|---|---:|---:|
| `programming.tsx` | 27 | 4 |
| `data.tsx` | 27 | 27 |
| `society.tsx` | 24 | 6 |
| `network.tsx` | 23 | 4 |
| `parts.tsx` | 4 | 0 |
| 合計 | 105 | 41 |

注意:

- この件数には代表8の動的style（幅・transform・stagger）も含む
- `check:figures` はヒューリスティックな警告。数字を0にすること自体が目的ではない
- まずは未移行の図解で、SVG内の文字が小さすぎるもの・インラインstyleが多用されているものから直す

移行の進め方:

1. 1ファイルずつ、または問題グループ単位で進める
2. `FigShell` のままでもフレームは新しくなっているため、内部を優先して直す
3. 必要に応じて `Canvas`, `CellTrack`, `Readout`, `FigureFrame` のステップAPIへ置き換える
4. SVGの `fontSize` は 11 以上を目安にする
5. 動的な値以外のインラインstyleはCSSクラスへ移す
6. 各バッチで以下を実行する

```bash
npm run check:figures
npm test
npm run build
```

7. `/dev/figures` で320 / 375pxを確認する
8. 既存の挙動・文言・図の意味を変えない
9. 新しいアニメーション依存を追加しない

推奨する着手順:

- `data.tsx` または `programming.tsx` の未移行図（警告数が多い）
- `society.tsx`
- `network.tsx`
- 最後に `parts.tsx` のレガシー部品の整理

ただし、実際の見た目が悪い図を優先してよい。
`/dev/figures` で目視して、崩れ・重なり・小さすぎる文字があるものを先に直す。

### 3. `DatFig4` のキーボード操作（Phase 3）

`DatFig4` の箱ひげ図ドットはクリック可能だが、キーボード操作には未対応。
Phase 3 で以下を検討する。

- ドットを `<button>` 化する、またはキーボード操作用の代替UIを用意する
- `aria-label` / `aria-pressed` / フォーカスリング
- 44px相当のヒット領域
- 色だけに依存しない選択状態

### 4. 最終QAとコミット

- 実ブラウザ確認
- 残り64図解の移行状況確認
- `README.md` の記述と実装の一致確認
- `git diff` レビュー
- コミット

---

## 既知の注意点・制約

### `DevFiguresPage` の本番チャンク

`/dev/figures` は `import.meta.env.DEV` のときだけルート登録されるが、
本番ビルドでも `DevFiguresPage` の小さなチャンクは出力される。

- 目安: 約1.7kB JS + 1.4kB CSS
- 本番ではルートが無効なので到達不能
- バンドルサイズを厳密に削りたい場合は、開発専用の読み込み方法を再検討する

### `SocFig1` の44px基準線

SVGはコンテナ幅に合わせて拡大縮小されるため、
「点線が44pxの目安」は図中での概念的な基準。

- 320px幅では画面上の点線は44 CSS pxより小さくなる
- スライダーの値・statusは44pxを数値基準として扱う
- 物理的に44pxを一致させたい場合は、HTMLオーバーレイか固定幅SVGが必要

### ブラウザ確認は未実施

型チェック・テスト・ビルドは通っているが、
ピクセル単位の見た目、実際のキーボード操作、reduced-motionの実機確認は未実施。

### レガシー図解の互換API

`FigShell` / `View` / `Calc` は残り64図解のために残している。
一括削除・一括置換はしない。

---

## 再開時に見るファイル

- `src/figures/parts.tsx`
  - `FigureFrame`, `StatusLine`, `StepControls`, `Canvas`
  - `CellTrack`, `BitGrid`, `Readout`, `Slider`, `Segmented`
- `src/figures/figures.module.css`
  - 44px操作部品、状態行の高さ、モーション、reduced-motion
- `src/lib/motion.ts`
  - `useReducedMotion`, `useStepPlayer`, `useAnimatedNumber`
- `src/figures/society.tsx`
- `src/figures/network.tsx`
- `src/figures/programming.tsx`
- `src/figures/data.tsx`
- `src/pages/QuizQuestionPage.tsx`
- `src/pages/QuizQuestionPage.module.css`
- `src/pages/DevFiguresPage.tsx`
- `scripts/check-figures.ts`
- `tests/figures.test.ts`
- `README.md`

---

## 受け入れチェックリスト

### 共通

- [ ] 操作部品が44px以上
- [ ] Tabで全操作に到達できる
- [ ] フォーカスリングが見える
- [ ] `prefers-reduced-motion` で即時最終状態
- [ ] 自動再生は初期停止
- [ ] 自動再生中に status が連続読み上げされない
- [ ] 300msを超える動きがない
- [ ] 無限ループ・バウンド・オーバーシュートがない
- [ ] 色だけに依存しない状態表示
- [ ] 320pxで横スクロールが出ない
- [ ] デスクトップで図解が560pxを超えて間延びしない

### 代表8

- [ ] `SocFig1`: スライダー、44px基準、誤タップ表示
- [ ] `SocFig3`: 3条件トグル、進捗、✓/✗
- [ ] `NetFig2`: 問い合わせ→応答の矢印が交差しない
- [ ] `NetFig6`: 9ビット、パリティ、誤り検出、ビット行の折返し
- [ ] `ProFig1`: 調査済み✓、未達の破線、statusの番号
- [ ] `DnclStepper`: 現在行、変数表、自動スクロール
- [ ] `DatFig1`: 平均・中央値・外れ値の位置
- [ ] `DatFig5`: バーのstagger、σ、平均ラベル

### 残り64

- [ ] `npm run check:figures` のSVG内HTMLが0
- [ ] 各バッチで `npm test` / `npm run build`
- [ ] `/dev/figures` で320 / 375px確認
- [ ] 既存の文言・挙動を壊していない

---

## 直近の次アクション

1. ブラウザが使える環境で `/dev/figures` を開く
2. 代表8を320 / 375 / 768px、キーボード、reduced-motionで確認する
3. 問題があれば代表8を修正する
4. 現状をコミットする
5. 残り64図解を1ファイルずつ移行する
6. `DatFig4` のキーボード操作をPhase 3で対応する
