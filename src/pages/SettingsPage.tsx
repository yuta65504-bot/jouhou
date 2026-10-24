import { useRef, useState, type ChangeEvent } from 'react'
import { TopAppBar } from '@/components/TopAppBar'
import { Segmented } from '@/components/Segmented'
import { useStore } from '@/lib/store'
import { usePageTitle } from '@/lib/usePageTitle'
import ui from '@/styles/ui.module.css'
import s from './SettingsPage.module.css'

type Theme = 'system' | 'light' | 'dark'

const THEME_OPTIONS: readonly { value: Theme; label: string }[] = [
  { value: 'system', label: 'システムに合わせる' },
  { value: 'light', label: 'ライト' },
  { value: 'dark', label: 'ダーク' },
]

export default function SettingsPage() {
  usePageTitle('設定')
  const { store, settings, setTheme, exportJson, importJson, resetData } = useStore()
  const [message, setMessage] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  /* iOS Safari のストレージ削除対策として、JSONでの持ち出しを必須実装している（仕様書 §9/§13） */
  const exportData = () => {
    const blob = new Blob([exportJson()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `jouhou-records-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    setMessage('記録をエクスポートしました。')
  }

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const r = importJson(text)
      setMessage(r.ok ? '記録を読み込みました。' : r.error)
    } catch {
      setMessage('ファイルを読み込めませんでした。')
    } finally {
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const onReset = () => {
    if (window.confirm('学習記録・用語の記録・「後で解く」をすべて消します。よろしいですか？（元に戻せません）')) {
      resetData()
      setMessage('記録を消去しました。')
    }
  }

  return (
    <>
      <TopAppBar title="設定" backTo="/" />
      <div className={`${ui.page} ${s.page}`}>
        <section className={`${ui.card} ${ui.cardPad}`} aria-labelledby="set-theme">
          <h2 className={ui.sectionTitle} id="set-theme">
            表示（テーマ）
          </h2>
          <Segmented label="テーマ" value={settings.theme} options={THEME_OPTIONS} onChange={setTheme} />
        </section>

        <section className={`${ui.card} ${ui.cardPad}`} aria-labelledby="set-data">
          <h2 className={ui.sectionTitle} id="set-data">
            学習記録の持ち出し
          </h2>
          <p className={ui.lead}>
            記録は端末内（localStorage）にだけ保存されます。ブラウザのデータ消去に備えて、バックアップをおすすめします。
          </p>
          <p className={s.stats} aria-label="記録の件数">
            演習の記録 {store.attempts.length}件／用語の記録 {Object.keys(store.termReviews).length}件
          </p>
          <div className={s.btnCol}>
            <button type="button" className={ui.subtleBtn} onClick={exportData}>
              エクスポート（JSONを保存）
            </button>
            <button type="button" className={ui.subtleBtn} onClick={() => fileRef.current?.click()}>
              インポート（JSONを読み込む）
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              onChange={onFile}
              className={s.fileInput}
              aria-label="インポートするJSONファイル"
            />
          </div>
          <button type="button" className={`${ui.subtleBtn} ${s.danger}`} onClick={onReset}>
            記録をすべて消去
          </button>
          <p className={s.message} aria-live="polite">
            {message}
          </p>
        </section>

        <section className={`${ui.card} ${ui.cardPad}`} aria-labelledby="set-about">
          <h2 className={ui.sectionTitle} id="set-about">
            このサイトについて
          </h2>
          <p className={ui.lead}>
            jouhou は、情報Ⅰの共通テスト対策を「操作して理解する図解」で学べる学習サイトです。
            図表はすべて自作で、過去問の図表は転載していません。
          </p>
          <p className={s.version}>Version 0.1.0（初期リリース目標: 2027年1月の共通テスト）</p>
        </section>
      </div>
    </>
  )
}
