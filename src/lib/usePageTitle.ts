import { useEffect } from 'react'

/** ページタイトルを設定する */
export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title}｜jouhou` : 'jouhou｜情報Ⅰ 共通テスト対策'
  }, [title])
}
