/**
 * 報告フォーム（仕様書「問題・演習の仕様」/「報告APIの仕様」）
 * - 問題・解答を表示するユーザー画面から開く
 * - hCaptcha ウィジェットでボット判定をしてから POST /api/reports に送信する
 * - テーマ（ライト／ダーク）に合わせて CAPTCHA の見た目を切り替える
 */
import { useEffect, useRef, useState } from 'react'
import { REPORT_CATEGORIES, submitReport, type ReportCategory } from '@/lib/report'
import ui from '@/styles/ui.module.css'
import s from './ReportDialog.module.css'

/** ビルド変数のサイトキー（未設定なら報告は送信不可の旨を表示する） */
const SITEKEY = import.meta.env.VITE_HCAPTCHA_SITEKEY

/* スクリプトの読込は1回だけ（ダイアログを何度開いても再読込しない） */
let loadPromise: Promise<void> | null = null
function loadHcaptcha(): Promise<void> {
  if (window.hcaptcha) return Promise.resolve()
  if (loadPromise) return loadPromise
  loadPromise = new Promise((resolve, reject) => {
    const el = document.createElement('script')
    el.src = 'https://js.hcaptcha.com/1/api.js?render=explicit'
    el.async = true
    el.onload = () =>
      window.hcaptcha ? resolve() : reject(new Error('hCaptchaを読み込めませんでした'))
    el.onerror = () => reject(new Error('hCaptchaを読み込めませんでした'))
    document.head.appendChild(el)
  })
  return loadPromise
}

type Props = {
  questionId: string
  open: boolean
  onClose: () => void
}

export function ReportDialog({ questionId, open, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const captchaBoxRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [category, setCategory] = useState<ReportCategory>('typo')
  const [message, setMessage] = useState('')
  const [token, setToken] = useState('')
  const [sending, setSending] = useState(false)
  const [captchaError, setCaptchaError] = useState(false)
  const [result, setResult] = useState<{ type: 'done' } | { type: 'error'; message: string } | null>(
    null,
  )

  /* ネイティブ <dialog> で開き、閉じたら onClose に伝える（Esc も 'close' になる） */
  useEffect(() => {
    const el = dialogRef.current
    if (!el) return
    if (open && !el.open) el.showModal()
    if (!open && el.open) el.close()
  }, [open])

  useEffect(() => {
    const el = dialogRef.current
    if (!el) return
    const handle = () => onCloseRef.current()
    el.addEventListener('close', handle)
    return () => el.removeEventListener('close', handle)
  }, [])

  /* ダイアログを開くたびに現在テーマへ合わせる */
  useEffect(() => {
    if (!open) return
    const dark =
      document.documentElement.dataset.theme === 'dark' ||
      (document.documentElement.dataset.theme === undefined &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    setTheme(dark ? 'dark' : 'light')
  }, [open])

  /* 開いたときに hCaptcha ウィジェットを遅延読込して表示 */
  useEffect(() => {
    if (!open || !SITEKEY) return
    let cancelled = false
    loadHcaptcha()
      .then(() => {
        if (cancelled || !boxReady(captchaBoxRef.current) || widgetIdRef.current != null) return
        const api = window.hcaptcha
        if (!api) return setCaptchaError(true)
        widgetIdRef.current = api.render(captchaBoxRef.current!, {
          sitekey: SITEKEY,
          theme,
          callback: () => setToken(api.getResponse(widgetIdRef.current ?? '')),
          'expired-callback': () => setToken(''),
          'error-callback': () => setCaptchaError(true),
        })
      })
      .catch(() => setCaptchaError(true))
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, theme])

  /* 閉じたらトークンを破棄して再挑戦できるように戻す */
  useEffect(() => {
    if (open) return
    if (window.hcaptcha && widgetIdRef.current != null) {
      window.hcaptcha.reset(widgetIdRef.current)
      setToken('')
    }
  }, [open])

  const resetCaptcha = () => {
    if (window.hcaptcha && widgetIdRef.current != null) {
      window.hcaptcha.reset(widgetIdRef.current)
    }
    setToken('')
  }

  const send = async () => {
    if (sending || !token || !message.trim()) return
    setSending(true)
    setResult(null)
    try {
      await submitReport({ questionId, category, message: message.trim(), captchaToken: token })
      setResult({ type: 'done' })
      setMessage('')
      resetCaptcha()
    } catch (e) {
      setResult({ type: 'error', message: e instanceof Error ? e.message : '送信に失敗しました。' })
      resetCaptcha()
    } finally {
      setSending(false)
    }
  }

  const canSend = SITEKEY != null && !captchaError && token !== '' && !!message.trim() && !sending && result?.type !== 'done'

  return (
    <dialog ref={dialogRef} className={s.dialog} aria-label="この問題を報告する">
      <div className={s.inner}>
        <p className={s.title}>この問題を報告する</p>
        <p className={ui.lead}>
          誤字・解答の誤り・表示の崩れなどを報告できます。送信した報告は管理者ページに追加されます。
        </p>

        <div role="radiogroup" aria-label="報告の種類" className={s.cats}>
          {REPORT_CATEGORIES.map((c) => (
            <button
              key={c.value}
              type="button"
              role="radio"
              aria-checked={category === c.value}
              className={`${s.cat} ${category === c.value ? s.catOn : ''}`}
              onClick={() => setCategory(c.value)}
            >
              {c.label}
            </button>
          ))}
        </div>

        <label className={s.label} htmlFor="report-message">
          内容（必須・2000文字まで）
        </label>
        <textarea
          id="report-message"
          className={s.textarea}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          maxLength={2000}
          placeholder="誤字がある行や、正しいと思う選択肢などを書いてください。"
        />

        {!SITEKEY ? (
          <p className={ui.note} aria-live="polite">
            hCaptchaが未設定のため送信できません（VITE_HCAPTCHA_SITEKEY を設定してください）。
          </p>
        ) : captchaError ? (
          <p className={ui.note} aria-live="polite">
            hCaptchaを読み込めませんでした。ページを再読込してお試しください。
          </p>
        ) : (
          <div ref={captchaBoxRef} className={s.captchaBox} />
        )}

        {result?.type === 'done' && (
          <p className={s.done} aria-live="polite">
            報告を送信しました。ありがとうございます。
          </p>
        )}
        {result?.type === 'error' && (
          <p className={s.errorText} aria-live="polite">
            {result.message}
          </p>
        )}

        <div className={s.btnRow}>
          <button type="button" className={`${ui.subtleBtn} ${s.btn}`} onClick={onClose}>
            閉じる
          </button>
          <button type="button" className={`${ui.primaryBtn} ${s.btn}`} disabled={!canSend} onClick={() => void send()}>
            {sending ? '送信中…' : '送信する'}
          </button>
        </div>
      </div>
    </dialog>
  )
}

/** ウィジェットをまだ描いていないとき初回だけ実際のDOMコンテナを待つ */
function boxReady(el: HTMLElement | null): el is HTMLElement {
  return el != null && el.childElementCount === 0
}
