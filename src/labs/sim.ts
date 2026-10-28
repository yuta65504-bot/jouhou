/**
 * 実験ページの計算部分。乱数は差し替え可能にして、
 * 初回表示（SSR）とテストでは決定的な値を使う。
 */

export type Rng = () => number

/** 線形合同法の決定的な乱数。0以上1未満 */
export function seededRng(seed: number): Rng {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

export type PacketOutcome = {
  id: number
  attempts: number
  delivered: boolean
}

export type PacketRun = {
  packets: PacketOutcome[]
  /** 送信した回数の合計（再送を含む） */
  sent: number
  firstTry: number
  retried: number
  failed: number
}

/**
 * パケットを1つずつ送り、失われたら最大 maxAttempts 回まで再送する。
 * lossPct は 0〜100。rng() が lossPct/100 未満なら「失われた」とみなす。
 */
export function simulatePackets(
  count: number,
  lossPct: number,
  maxAttempts = 3,
  rng: Rng = Math.random,
): PacketRun {
  const loss = Math.min(100, Math.max(0, lossPct)) / 100
  const packets: PacketOutcome[] = Array.from({ length: count }, (_, i) => {
    let attempts = 0
    while (attempts < maxAttempts) {
      attempts += 1
      if (rng() >= loss) return { id: i + 1, attempts, delivered: true }
    }
    return { id: i + 1, attempts, delivered: false }
  })
  return {
    packets,
    sent: packets.reduce((sum, p) => sum + p.attempts, 0),
    firstTry: packets.filter((p) => p.delivered && p.attempts === 1).length,
    retried: packets.filter((p) => p.delivered && p.attempts > 1).length,
    failed: packets.filter((p) => !p.delivered).length,
  }
}

/** 英字A–Zを shift 文字ずらす（負の値・26以上も可）。英字以外はそのまま */
export function caesarShift(text: string, shift: number): string {
  const n = ((shift % 26) + 26) % 26
  return [...text]
    .map((ch) => {
      const code = ch.charCodeAt(0)
      if (code >= 65 && code <= 90) return String.fromCharCode(((code - 65 + n) % 26) + 65)
      if (code >= 97 && code <= 122) return String.fromCharCode(((code - 97 + n) % 26) + 97)
      return ch
    })
    .join('')
}

/**
 * 先頭から探す場合と二分探索の場合の「最大の比較回数」。
 * target は 1 始まりの位置（1〜n）。
 */
export function comparisonCounts(n: number, target: number): { linear: number; binary: number } {
  const t = Math.min(n, Math.max(1, Math.round(target)))
  let lo = 0
  let hi = n - 1
  let binary = 0
  while (lo <= hi) {
    binary += 1
    const mid = Math.floor((lo + hi) / 2)
    if (mid === t - 1) break
    if (mid < t - 1) lo = mid + 1
    else hi = mid - 1
  }
  return { linear: t, binary }
}

export function mean(values: readonly number[]): number {
  return values.length ? values.reduce((sum, v) => sum + v, 0) / values.length : 0
}

export function median(values: readonly number[]): number {
  if (!values.length) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

/* ---------- 追加の実験で使う計算 ---------- */

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex)
  if (!m) return null
  const n = parseInt(m[1], 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

/** WCAG の相対輝度（0〜1） */
export function relativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex)
  if (!rgb) return 0
  const channel = (v: number) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b)
}

/** 2色のコントラスト比（1〜21） */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a)
  const lb = relativeLuminance(b)
  const light = Math.max(la, lb)
  const dark = Math.min(la, lb)
  return (light + 0.05) / (dark + 0.05)
}

export type RleResult = {
  encoded: string
  original: number
  compressed: number
}

/** 同じ文字が続く区間を「回数＋文字」に置き換える */
export function rleEncode(text: string): RleResult {
  if (!text) return { encoded: '', original: 0, compressed: 0 }
  const runs: string[] = []
  let current = text[0]
  let count = 1
  for (let i = 1; i < text.length; i++) {
    if (text[i] === current) count += 1
    else {
      runs.push(`${count}${current}`)
      current = text[i]
      count = 1
    }
  }
  runs.push(`${count}${current}`)
  const encoded = runs.join('')
  return { encoded, original: text.length, compressed: encoded.length }
}

export function soundBytes(rateKhz: number, bits: number, seconds: number): number {
  return (rateKhz * 1000 * bits * seconds) / 8
}

export function passwordCombinations(length: number, charset: number): number {
  return charset > 0 ? charset ** length : 0
}

export function transferSeconds(sizeMB: number, mbps: number): number {
  return mbps > 0 ? (sizeMB * 8) / mbps : Infinity
}

/** 左端を最上位ビットとした2進数 */
export function bitsToValue(bits: readonly (0 | 1)[]): number {
  return bits.reduce<number>((value, bit) => value * 2 + bit, 0)
}

export function bitOp(a: readonly (0 | 1)[], b: readonly (0 | 1)[], op: 'and' | 'or' | 'xor'): (0 | 1)[] {
  return a.map((x, i) => {
    const y = b[i] ?? 0
    const v = op === 'and' ? x & y : op === 'or' ? x | y : x ^ y
    return v as 0 | 1
  })
}

export function sumTo(n: number): number {
  return (n * (n + 1)) / 2
}

/** fib(n) を素朴な再帰で計算したときの呼び出し回数（n=0,1 は1回） */
export function fibCalls(n: number): number {
  const memo = new Map<number, number>()
  const calls = (k: number): number => {
    if (k <= 1) return 1
    const found = memo.get(k)
    if (found != null) return found
    const value = 1 + calls(k - 1) + calls(k - 2)
    memo.set(k, value)
    return value
  }
  return calls(Math.max(0, Math.round(n)))
}

export function grade(score: number): 'A' | 'B' | 'C' | 'D' {
  if (score >= 80) return 'A'
  if (score >= 60) return 'B'
  if (score >= 40) return 'C'
  return 'D'
}

export type DiceRun = {
  counts: number[]
  mean: number
}

/** 1〜6の目を times 回ふる */
export function rollDice(times: number, rng: Rng = Math.random): DiceRun {
  const counts = [0, 0, 0, 0, 0, 0]
  let sum = 0
  for (let i = 0; i < times; i++) {
    const value = Math.floor(rng() * 6) + 1
    counts[value - 1] += 1
    sum += value
  }
  return { counts, mean: times > 0 ? sum / times : 0 }
}

export type HistogramBin = {
  start: number
  count: number
}

/** 値の範囲を width ごとの階級に分ける */
export function histogram(values: readonly number[], width: number): HistogramBin[] {
  if (values.length === 0 || width <= 0) return []
  const start = Math.floor(Math.min(...values) / width) * width
  const lastStart = Math.floor(Math.max(...values) / width) * width
  const bins: HistogramBin[] = []
  for (let s = start; s <= lastStart; s += width) bins.push({ start: s, count: 0 })
  for (const value of values) {
    const index = Math.min(bins.length - 1, Math.floor((value - start) / width))
    bins[index].count += 1
  }
  return bins
}

export function quantile(values: readonly number[], p: number): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const pos = (sorted.length - 1) * Math.min(1, Math.max(0, p))
  const lo = Math.floor(pos)
  const hi = Math.ceil(pos)
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo)
}

export function pearson(points: readonly { x: number; y: number }[]): number {
  if (points.length < 2) return 0
  const mx = mean(points.map((p) => p.x))
  const my = mean(points.map((p) => p.y))
  let numerator = 0
  let dx = 0
  let dy = 0
  for (const p of points) {
    const a = p.x - mx
    const b = p.y - my
    numerator += a * b
    dx += a * a
    dy += b * b
  }
  return dx > 0 && dy > 0 ? numerator / Math.sqrt(dx * dy) : 0
}

/** 直近 window 個の平均。先頭は個数が足りない分だけで平均する */
export function movingAverage(values: readonly number[], window: number): number[] {
  const w = Math.max(1, Math.round(window))
  return values.map((_, i) => mean(values.slice(Math.max(0, i - w + 1), i + 1)))
}

export type MissingMode = 'drop' | 'zero' | 'mean'

/** 欠損値（null）の扱いを変えたデータを作る */
export function fillMissing(values: readonly (number | null)[], mode: MissingMode): number[] {
  const present = values.filter((v): v is number => v != null)
  if (mode === 'drop') return present
  const fill = mode === 'zero' ? 0 : mean(present)
  return values.map((v) => v ?? fill)
}

/* ---------- 追加30本の実験で使う計算 ---------- */

/** 標本化定理: 元の波を再現するには、周波数の2倍を超える標本化周波数が要る */
export function nyquistOk(rateHz: number, signalHz: number): boolean {
  return rateHz > signalHz * 2
}

/** パリティ検査。bits はパリティビットを含む */
export function parityOk(bits: readonly (0 | 1)[], mode: 'even' | 'odd'): boolean {
  const ones = bits.reduce<number>((sum, b) => sum + b, 0)
  return mode === 'even' ? ones % 2 === 0 : ones % 2 === 1
}

/** サブネットで使えるホスト数（ネットワーク・ブロードキャストを除く） */
export function subnetHosts(prefix: number): number {
  return Math.max(0, 2 ** (32 - prefix) - 2)
}

export function subnetMask(prefix: number): string {
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0
  return [24, 16, 8, 0].map((shift) => (mask >>> shift) & 255).join('.')
}

export function networkAddress(ip: string, prefix: number): string {
  const value = ip.split('.').reduce((n, part) => n * 256 + Number(part), 0) >>> 0
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0
  const net = (value & mask) >>> 0
  return [24, 16, 8, 0].map((shift) => (net >>> shift) & 255).join('.')
}

/** 見た目用の短いチェックサム（暗号学的なハッシュではない） */
export function checksum(text: string): string {
  let h = 0
  for (const ch of text) h = (h * 31 + (ch.codePointAt(0) ?? 0)) >>> 0
  return h.toString(16).toUpperCase().padStart(8, '0').slice(0, 4)
}

/** 二分探索で比べた位置（1始まり）。範囲外なら空配列 */
export function binarySearchTrace(n: number, target: number): number[] {
  const t = Math.round(target)
  if (t < 1 || t > n) return []
  const mids: number[] = []
  let lo = 0
  let hi = n - 1
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2)
    mids.push(mid + 1)
    if (mid === t - 1) return mids
    if (mid < t - 1) lo = mid + 1
    else hi = mid - 1
  }
  return mids
}

/** 選択ソートの各パス後の配列と、そのパスで交換した回数 */
export function selectionSortPasses(values: readonly number[]): { passes: number[][]; swaps: number[] } {
  const a = [...values]
  const passes: number[][] = []
  const swaps: number[] = []
  for (let i = 0; i < a.length - 1; i++) {
    let min = i
    for (let j = i + 1; j < a.length; j++) if (a[j] < a[min]) min = j
    let swap = 0
    if (min !== i) {
      ;[a[i], a[min]] = [a[min], a[i]]
      swap = 1
    }
    passes.push([...a])
    swaps.push(swap)
  }
  return { passes, swaps }
}

/** 最頻値（同数なら小さいほう） */
export function mode(values: readonly number[]): number {
  const counts = new Map<number, number>()
  let best = values[0] ?? 0
  let bestCount = 0
  for (const v of values) {
    const count = (counts.get(v) ?? 0) + 1
    counts.set(v, count)
    if (count > bestCount || (count === bestCount && v < best)) {
      best = v
      bestCount = count
    }
  }
  return best
}

/** 母標準偏差 */
export function stddev(values: readonly number[]): number {
  if (!values.length) return 0
  const m = mean(values)
  return Math.sqrt(mean(values.map((v) => (v - m) ** 2)))
}

/** 最小二乗法の直線 y = slope * x + intercept */
export function leastSquares(points: readonly { x: number; y: number }[]): { slope: number; intercept: number } {
  if (points.length < 2) return { slope: 0, intercept: points[0]?.y ?? 0 }
  const mx = mean(points.map((p) => p.x))
  const my = mean(points.map((p) => p.y))
  let numerator = 0
  let denominator = 0
  for (const p of points) {
    numerator += (p.x - mx) * (p.y - my)
    denominator += (p.x - mx) ** 2
  }
  const slope = denominator > 0 ? numerator / denominator : 0
  return { slope, intercept: my - slope * mx }
}

