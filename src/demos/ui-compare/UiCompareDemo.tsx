/** UI比較デモ（仕様書 §8 情報社会 / L1）
 * SegmentedButtonでBefore/After切替 → 該当カラムの差分をハイライト
 */
import { useState } from 'react'
import type { ReactNode } from 'react'
import { Segmented } from '@/components/Segmented'
import styles from '../demo.module.css'
import s from './UiCompareDemo.module.css'

type Side = 'before' | 'after'

/** 差分として強調する要素。selected が自分の側なら枠と注記を出す */
function Diff({
  active,
  note,
  children,
}: {
  active: boolean
  note: string
  children: ReactNode
}) {
  return (
    <div className={active ? styles.diffOn : undefined}>
      {children}
      {active && (
        <span className={styles.diffBadge}>
          <span className={styles.diffNote}>差分: {note}</span>
        </span>
      )}
    </div>
  )
}

function BeforeMock({ active }: { active: boolean }) {
  return (
    <div className={s.mock}>
      <p className={s.mockTitle}>旧UI（自由記述のみ）</p>
      <div className={s.mockBody}>
        <p className={s.mockLabel}>お問い合わせ</p>
        <Diff active={active} note="入力欄が1つだけで、何を書けばよいか分かりにくい">
          <div className={s.textareaMock}>内容を入力してください…</div>
        </Diff>
        <Diff active={active} note="送信ボタンが小さく、タップしづらい">
          <span className={s.tinyBtn}>送信</span>
        </Diff>
        <Diff active={active} note="エラーを赤い文字だけで伝えている">
          <span className={s.errText}>エラー</span>
        </Diff>
      </div>
    </div>
  )
}

function AfterMock({ active }: { active: boolean }) {
  return (
    <div className={s.mock}>
      <p className={s.mockTitle}>改良UI（選択式）</p>
      <div className={s.mockBody}>
        <p className={s.mockLabel}>お問い合わせ</p>
        <Diff active={active} note="選択肢ボタンで、迷わず入力できる">
          <div className={s.choiceRow}>
            <span className={s.choice}>使い方の質問</span>
            <span className={s.choice}>不具合の報告</span>
          </div>
        </Diff>
        <Diff active={active} note="送信ボタンが大きく、下部に固定">
          <span className={s.bigBtn}>送信する</span>
        </Diff>
        <Diff active={active} note="エラーはアイコン＋文字で伝える">
          <span className={s.errFixed}>⚠ 入力してください</span>
        </Diff>
      </div>
    </div>
  )
}

export default function UiCompareDemo() {
  const [side, setSide] = useState<Side>('before')
  return (
    <div className={styles.demo}>
      <div className={styles.visual} aria-label="2カラムのUIモック">
        <div className={s.columns}>
          <BeforeMock active={side === 'before'} />
          <AfterMock active={side === 'after'} />
        </div>
      </div>
      <div className={styles.panel}>
        <div className={styles.panelRow}>
          <span className={styles.panelTitle} id="ui-compare-mode">
            どちらの画面の違いを見るか
          </span>
          <Segmented
            label="Before / After 切替"
            value={side}
            onChange={setSide}
            options={[
              { value: 'before' as const, label: 'Before（旧UI）' },
              { value: 'after' as const, label: 'After（改良UI）' },
            ]}
          />
        </div>
        <p className={s.hint}>
          切り替えると、その側の画面で変わっている部分に枠と説明が表示されます。両方の画面を比べながら読んでください。
        </p>
      </div>
    </div>
  )
}
