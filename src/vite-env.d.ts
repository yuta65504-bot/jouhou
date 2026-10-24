/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** hCaptcha のサイトキー（クライアント側・公開情報）。ビルド時にPagesの環境変数から注入。未設定なら報告フォームは送信不可の表示になる */
  readonly VITE_HCAPTCHA_SITEKEY?: string
  /** 報告機能の有効/無効。'false' のとき通報フォームを利用不可表示にする（GitHub Pages 用） */
  readonly VITE_REPORTS_ENABLED?: string
}

/** hCaptcha のJavaScript API（https://js.hcaptcha.com/1/api.js）。宣言はこのファイルに一元化する */
interface HcaptchaApi {
  render: (
    el: HTMLElement,
    opts: {
      sitekey: string
      theme?: 'light' | 'dark'
      callback?: () => void
      'expired-callback'?: () => void
      'error-callback'?: () => void
    },
  ) => string
  getResponse: (id?: string) => string
  reset: (id?: string) => void
}

interface Window {
  hcaptcha?: HcaptchaApi
}
