# 引き継ぎメモ: 図解UI・モーション改善（Plan A）

最終更新: 2026-10-24

## このファイルの目的

情報Ⅰクイズアプリの「雑に見える」図解UIと解説アニメーションを改善する Plan A の、
現時点の成果物・検証結果・残課題をまとめた引き継ぎ資料。

**実装・実ブラウザ確認・残り64図解の移行まで完了している。** 残りは既知の負債の解消のみ。

---

## 現在の状態

### 完了

- 共通モーション基盤
  - `src/styles/tokens.css`
  - `src/lib/motion.ts`
  - `src/figures/parts.tsx`
  - `src/figures/figures.module.css`
- 代表8図解の新デザイン移行（`SocFig1`, `SocFig3`, `NetFig2`, `NetFig6`,
  `ProFig1`, `DnclStepper`, `DatFig1`, `DatFig5`）
- 残り64図解の移行（society / network / programming / data の全72本）
  - SVGテキストを 11px 以上に統一
  - 文字拡大で生じた重なり・見切れを座標調整と viewBox 拡張で解消
  - 静的 `cursor: pointer` を `styles.clickableDot` に集約
- 狭幅レイアウトの修正
  - ステップ操作を 2×2 グリッド化（`@container`）
  - アイコンボタンに `min-width: var(--tap-min)`
  - DNCLコードの折返し（`white-space: pre-wrap` / `overflow-wrap: anywhere`）
  - 尺度水準の選択行を2段に、箱ひげ図に44pxの選択ボタンを追加
- キーボード操作
  - SVG内クリック要素を `svgButton`（`parts.tsx`）で操作可能に
  - 対象: q-net-1 / q-net-3 / q-net-5 / q-pro-7 / q-pro-13
  - `role="button"` / Space・Enter / `aria-pressed` / フォーカスリング
- 解説・回答まわりの改善（フォーカス移動、解説開閉のフォーカス復帰）
- 品質チェック・開発用ギャラリー・README 更新

### 検証済み（2026-10-24）

以下はすべて成功。

```bash
npx tsc --noEmit
npm test          # 4ファイル / 27テスト
npm run build
git diff --check
```

- `check:figures`
  - SVG内HTML: 0件
  - `fontSize < 11`: 0件
  - インラインstyle: 29件（すべて動的な幅・transform・条件分岐）
- ヘッドレスChromium（CDP）で `/dev/figures` を確認
  - 320 / 375 / 768px: ページ横スクロールなし、44px未満のボタン・radio・slider なし
  - SVGテキスト・図形の viewBox 外 0件、テキストの重なり 0件
  - 768pxで図解本体は560px以内（ギャラリーのカードヘッダのみ562px）
  - Tab移動で全操作に到達、フォーカスリング表示
  - スライダー: 矢印キーで値・`aria-valuetext`・status が更新
  - 自動再生: 開始で `aria-live="off"`、停止で `polite` に戻る
  - `prefers-reduced-motion`: 再生ボタン非表示、アニメーション即時最終状態
  - クイズ画面: 回答後フィードバックへフォーカス、解説を隠すとボタンへ復帰

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

### 共通パーツの互換API

- `FigShell` = `FigureFrame` の互換ラッパー
- `View` = `Canvas` の互換エイリアス
- `Calc` = `Readout` の互換エイリアス

消さないこと。

---

## 既知の負債（次にやるなら）

1. **SVG内クリック要素のタッチ領域が44px未満**
   - 対象: q-net-1 / q-net-3 / q-net-5（ビット18px）、q-pro-7（セル40x18）、
     q-pro-13（装置30x30）、q-soc-9、q-dat-10
   - キーボード操作は q-net-1/3/5・q-pro-7/13 のみ対応済み
   - q-soc-9 / q-dat-10 は代替の Segmented / Btn で同じ操作ができる
   - 構造上、隣接要素と重ねずに44pxを確保できないため意図的に残している
   - 解消するなら「SVGの下に44pxのHTMLボタン行を置く」（q-dat-4 と同じ方式）
2. **q-net-15 のセグメントラベル**
   - `${desc.slice(0, 8)}…` で省略表示している。名称だけにすると意味が伝わりにくいため保留
3. **q-dat-13 の箱内テキストが密**
   - 4ステップを2行表示にして 11px を確保済み。これ以上は図の分割が必要
4. **インラインstyle 29件**
   - すべて動的な値（幅%、transform、条件付き色）。静的指定は移行済み

---

## 既知の注意点・制約

### `DevFiguresPage` の本番チャンク

`/dev/figures` は `import.meta.env.DEV` のときだけルート登録されるが、
本番ビルドでも `DevFiguresPage` の小さなチャンクは出力される（約1.7kB JS + 1.4kB CSS）。
本番ではルートが無効なので到達不能。

### `SocFig1` の44px基準線

SVGはコンテナ幅に合わせて拡大縮小されるため、
「点線が44pxの目安」は図中での概念的な基準。
320px幅では画面上の点線は44 CSS pxより小さくなる。
スライダーの値・statusは44pxを数値基準として扱う。

---

## 再開時に見るファイル

- `src/figures/parts.tsx` — `FigureFrame`, `Canvas`, `CellTrack`, `BitGrid`, `Readout`, `svgButton`
- `src/figures/figures.module.css` — 44px、ステップ2×2、モーション、reduced-motion、`clickableDot`
- `src/lib/motion.ts` — `useReducedMotion`, `useStepPlayer`, `useAnimatedNumber`
- `src/figures/{society,network,programming,data}.tsx`
- `src/pages/QuizQuestionPage.tsx`
- `src/pages/DevFiguresPage.tsx`
- `scripts/check-figures.ts` — `--file=` / `--all` で移行作業向けに絞れる
- `tests/figures.test.ts`

---

## 受け入れチェックリスト

### 共通（確認済み）

- [x] 操作部品が44px以上（SVG内クリックを除く）
- [x] Tabで全操作に到達できる
- [x] フォーカスリングが見える
- [x] `prefers-reduced-motion` で即時最終状態
- [x] 自動再生は初期停止
- [x] 自動再生中に status が連続読み上げされない
- [x] 300msを超える動きがない
- [x] 無限ループ・バウンド・オーバーシュートがない
- [x] 色だけに依存しない状態表示
- [x] 320pxで横スクロールが出ない
- [x] デスクトップで図解が560pxを超えて間延びしない
- [x] `npm run check:figures` のSVG内HTMLが0、fontSize<11が0

### 未対応

- [ ] SVG内クリック要素のタッチ領域44px（上記「既知の負債」）
