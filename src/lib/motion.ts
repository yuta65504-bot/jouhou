/**
 * 解説図解のモーション用フック。
 * - 原則は「控えめ」: 100〜240ms、バウンド・無限ループなし
 * - prefers-reduced-motion では即時表示・自動再生なし
 */
import { useEffect, useRef, useState } from 'react'

const REDUCE_QUERY = '(prefers-reduced-motion: reduce)'

/** OSの「視差効果を減らす」設定。SSR時は false で初期化する */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia(REDUCE_QUERY)
    const update = () => setReduced(mq.matches)
    update()
    mq.addEventListener?.('change', update)
    return () => mq.removeEventListener?.('change', update)
  }, [])

  return reduced
}

export type StepPlayer = {
  step: number
  setStep: (next: number) => void
  next: () => void
  prev: () => void
  reset: () => void
  playing: boolean
  toggle: () => void
}

/**
 * 0始まりのステップを管理する。total はステップ数（step は 0〜total-1）。
 * 自動再生は1ステップずつ setTimeout を張り、最終ステップで自動停止する。
 */
export function useStepPlayer(total: number, interval = 1200): StepPlayer {
  const max = Math.max(0, total - 1)
  const [step, setStepState] = useState(0)
  const [playing, setPlaying] = useState(false)
  const reduced = useReducedMotion()

  useEffect(() => {
    setStepState((current) => Math.min(current, max))
    if (max === 0) setPlaying(false)
  }, [max])

  useEffect(() => {
    if (!playing || reduced) return
    if (step >= max) {
      setPlaying(false)
      return
    }
    const timer = window.setTimeout(() => {
      setStepState((current) => Math.min(max, current + 1))
    }, interval)
    return () => window.clearTimeout(timer)
  }, [playing, reduced, step, max, interval])

  /* タブが隠れたら自動再生を止める */
  useEffect(() => {
    if (!playing) return
    const onVisibility = () => {
      if (document.hidden) setPlaying(false)
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [playing])

  const setStep = (next: number) => {
    setPlaying(false)
    setStepState(Math.max(0, Math.min(max, next)))
  }
  const next = () => setStep(step + 1)
  const prev = () => setStep(step - 1)
  const reset = () => setStep(0)
  const toggle = () => {
    if (reduced) return
    if (playing) {
      setPlaying(false)
      return
    }
    if (step >= max) setStepState(0)
    setPlaying(true)
  }

  return { step, setStep, next, prev, reset, playing, toggle }
}

/**
 * 数値を短くカウントアップ／ダウンさせる。
 * 初回マウント時はアニメーションせず、値が変わったときだけ動かす。
 */
export function useAnimatedNumber(target: number, duration = 220): number {
  const reduced = useReducedMotion()
  const [value, setValue] = useState(target)
  const valueRef = useRef(target)

  useEffect(() => {
    if (reduced || !Number.isFinite(target)) {
      valueRef.current = target
      setValue(target)
      return
    }
    const from = valueRef.current
    if (Math.abs(from - target) < 0.001) return

    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      const next = from + (target - from) * eased
      valueRef.current = next
      setValue(next)
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration, reduced])

  return value
}
