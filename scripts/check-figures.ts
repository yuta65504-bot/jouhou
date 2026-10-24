/**
 * 図解の静的チェック。
 *
 * 失敗にするもの:
 *   - <svg> の中に <Calc> / <div> / <table> / <button> / <p> / <span> を置く
 *     （SVG内では描画されない・読み上げも壊れる）
 *
 * 移行中は警告だけにするもの:
 *   - fontSize が 11 未満の直書き
 *   - インライン style の数
 *
 * 残り64本は Phase 3 で移行するため、ここでは件数を出して可視化する。
 */
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const FIGURE_DIR = path.resolve('src/figures')
const FILES = ['society.tsx', 'network.tsx', 'programming.tsx', 'data.tsx', 'parts.tsx']
const HTML_IN_SVG = /<(Calc|div|table|button|p|span)\b/

type Warning = { file: string; line: number; text: string }

const invalid: Warning[] = []
const smallFonts: Warning[] = []
const inlineStyles: Warning[] = []

for (const file of FILES) {
  const full = path.join(FIGURE_DIR, file)
  const lines = fs.readFileSync(full, 'utf8').split(/\r?\n/)
  let svgDepth = 0

  lines.forEach((text, index) => {
    const line = index + 1
    const openCount = (text.match(/<svg\b/g) ?? []).length
    const closeCount = (text.match(/<\/svg>/g) ?? []).length

    if (svgDepth > 0 && HTML_IN_SVG.test(text)) {
      invalid.push({ file, line, text: text.trim() })
    }

    svgDepth += openCount - closeCount
    if (svgDepth < 0) svgDepth = 0

    const font = text.match(/fontSize=\{([0-9.]+)\}/)
    if (font && Number(font[1]) < 11) {
      smallFonts.push({ file, line, text: `fontSize=${font[1]}` })
    }

    if (/style=\{\{/.test(text)) {
      inlineStyles.push({ file, line, text: text.trim() })
    }
  })
}

const print = (label: string, items: Warning[], limit = 8) => {
  if (items.length === 0) {
    console.log(`  ${label}: 0`)
    return
  }
  console.log(`  ${label}: ${items.length}`)
  const shown = printAll ? items : items.slice(0, limit)
  for (const item of shown) {
    console.log(`    ${item.file}:${item.line}  ${item.text}`)
  }
  if (!printAll && items.length > limit) console.log(`    … ほか ${items.length - limit} 件`)
}

/* 移行作業用: --file=society.tsx で対象を絞り、--all で全件表示する */
const fileArg = process.argv.find((a) => a.startsWith('--file='))?.slice('--file='.length)
const printAll = process.argv.includes('--all')
const normalize = (f: string) => (f.endsWith('.tsx') ? f : `${f}.tsx`)
const scoped = fileArg ? (items: Warning[]) => items.filter((i) => i.file === normalize(fileArg)) : (items: Warning[]) => items

console.log('図解チェック')
print('SVG内のHTML（失敗）', scoped(invalid))
print('fontSize < 11（移行中の警告）', scoped(smallFonts))
print('インラインstyle（移行中の警告）', scoped(inlineStyles))

if (invalid.length > 0) {
  console.error('\nSVG内のHTMLを修正してください。')
  process.exit(1)
}

console.log('\nOK: SVGの構造に問題はありません。')
