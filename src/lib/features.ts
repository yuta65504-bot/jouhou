/** 通報機能の有効/無効。GitHub Pages ビルドでは VITE_REPORTS_ENABLED=false を指定する */
export const REPORTS_ENABLED = import.meta.env.VITE_REPORTS_ENABLED !== 'false'
