/** DNCLステップ実行デモ（仕様書 §8 プログラミング / L2）
 * 下部固定バー: 戻る／再生・停止／次へ／リセット（各44px以上）
 * コード行＋変数ウォッチ表＋該当行ハイライト。実行状態は aria-live で通知。
 */
import { useEffect, useMemo, useReducer, useState } from 'react'
import { Link } from 'react-router-dom'
import { Segmented } from '@/components/Segmented'
import { PrevIcon, PlayIcon, PauseIcon, NextIcon, ResetIcon } from '@/components/Icons'
import { dnclPrograms } from '@/content/dncl'
import { getDemo } from '@/content/demos'
import {
  STEP_LIMIT,
  computeRun,
  parseProgram,
  varNamesOf,
  type Stmt,
} from './engine'
import styles from '../demo.module.css'
import s from './DnclDemo.module.css'

/* ---------- プログラムの読み込み ---------- */

type ParsedProgram = { ok: true; stmts: Stmt[]; names: string[] } | { ok: false; message: string }

function loadProgram(id: string): ParsedProgram {
  const meta = dnclPrograms.find((p) => p.id === id)
  if (!meta) return { ok: false, message: 'プログラムが見つかりません' }
  try {
    const stmts = parseProgram(meta.lines)
    return { ok: true, stmts, names: varNamesOf(stmts) }
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : '読み取れませんでした' }
  }
}

const PARSED = new Map(dnclPrograms.map((p) => [p.id, loadProgram(p.id)]))

/* ---------- 状態遷移（Idle → Running → Paused → Finished / Error） ---------- */

type Phase = 'idle' | 'running' | 'paused' | 'finished' | 'error'
type State = { programId: string; phase: Phase; stepCount: number }

type Action =
  | { type: 'load'; programId: string }
  | { type: 'play' }
  | { type: 'stop' }
  | { type: 'next' }
  | { type: 'back' }
  | { type: 'reset' }
  | { type: 'tick' }

function programOf(id: string): Stmt[] {
  const p = PARSED.get(id)
  return p && p.ok ? p.stmts : []
}

function runFor(programId: string, count: number) {
  return computeRun(programOf(programId), count)
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'load':
      return { programId: action.programId, phase: 'idle', stepCount: 0 }
    case 'reset':
      return { ...state, phase: 'idle', stepCount: 0 }
    case 'play': {
      if (state.phase !== 'idle' && state.phase !== 'paused') return state
      return { ...state, phase: 'running' }
    }
    case 'stop': {
      if (state.phase !== 'running') return state
      return { ...state, phase: 'paused' }
    }
    case 'next': {
      if (state.phase === 'running' || state.phase === 'finished' || state.phase === 'error') {
        return state
      }
      const next = Math.min(state.stepCount + 1, STEP_LIMIT)
      const r = runFor(state.programId, next)
      const phase: Phase = r.error ? 'error' : r.done ? 'finished' : next >= STEP_LIMIT ? 'error' : 'paused'
      return { ...state, stepCount: next, phase }
    }
    case 'back': {
      if (state.stepCount === 0) return state
      const next = state.stepCount - 1
      if (next === 0) return { ...state, stepCount: 0, phase: 'idle' }
      const r = runFor(state.programId, next)
      const phase: Phase = r.error ? 'error' : r.done ? 'finished' : 'paused'
      return { ...state, stepCount: next, phase }
    }
    case 'tick': {
      if (state.phase !== 'running') return state
      const next = state.stepCount + 1
      if (next > STEP_LIMIT) return { ...state, phase: 'error' }
      const r = runFor(state.programId, next)
      const phase: Phase = r.error ? 'error' : r.done ? 'finished' : next >= STEP_LIMIT ? 'error' : 'running'
      return { ...state, stepCount: next, phase }
    }
  }
}

/* ---------- 速度 ---------- */

type Speed = 'slow' | 'normal' | 'fast'
const SPEED_MS: Record<Speed, number> = { slow: 850, normal: 500, fast: 240 }

const SPEED_OPTIONS = [
  { value: 'slow' as const, label: 'ゆっくり' },
  { value: 'normal' as const, label: 'ふつう' },
  { value: 'fast' as const, label: 'はやい' },
]

const PROGRAM_OPTIONS = dnclPrograms.map((p) => ({ value: p.id, label: p.title }))

function formatNum(v: number): string {
  return Number.isInteger(v) ? String(v) : String(Math.round(v * 1000) / 1000)
}

export default function DnclDemo() {
  const [state, dispatch] = useReducer(reducer, {
    programId: dnclPrograms[0].id,
    phase: 'idle',
    stepCount: 0,
  })
  const [speed, setSpeed] = useState<Speed>('normal')

  const parsed = PARSED.get(state.programId)
  const meta = dnclPrograms.find((p) => p.id === state.programId)!
  const quizId = getDemo('dncl-step')?.quizId ?? 'q-pro-1'

  /* Running 中は一定間隔で自動的に1手進める */
  useEffect(() => {
    if (state.phase !== 'running') return
    const t = setInterval(() => dispatch({ type: 'tick' }), SPEED_MS[speed])
    return () => clearInterval(t)
  }, [state.phase, state.programId, speed])

  const run = useMemo(
    () => runFor(state.programId, state.stepCount),
    [state.programId, state.stepCount],
  )
  const snapshot = run.snapshots[run.snapshots.length - 1] ?? null
  const prevSnapshot = run.snapshots[run.snapshots.length - 2] ?? null
  const currentLine = state.phase === 'idle' || !snapshot ? -1 : snapshot.line
  const changedNames = useMemo(() => {
    if (!snapshot || !prevSnapshot) return new Set<string>()
    const names = new Set<string>()
    for (const [k, v] of Object.entries(snapshot.vars)) {
      if (prevSnapshot.vars[k] !== v) names.add(k)
    }
    return names
  }, [snapshot, prevSnapshot])

  const statusText = (() => {
    switch (state.phase) {
      case 'idle':
        return '待機中。次へ、または再生で開始します。'
      case 'running':
        return `自動実行中（${state.stepCount}手）`
      case 'paused':
        return `一時停止（${state.stepCount}手まで実行）`
      case 'finished':
        return `完了。${state.stepCount}手で終わりました。`
      case 'error':
        return run.error
          ? `${run.error.line + 1}行目でエラー: ${run.error.message}`
          : `${state.stepCount}手で停止。繰り返しが終わらない可能性があります（無限ループ）。`
    }
  })()

  const canStep = state.phase === 'idle' || state.phase === 'paused'
  const names = parsed?.ok ? parsed.names : []

  return (
    <div className={styles.demo}>
      <div className={styles.visual} aria-label="プログラムと変数の様子">
        {!parsed?.ok ? (
          <p className={s.parseError}>{parsed?.message}</p>
        ) : (
          <>
            <ol className={s.code} aria-label="プログラムの各行">
              {meta.lines.map((text, i) => {
                const isCurrent = i === currentLine
                return (
                  <li
                    key={isCurrent ? `${i}-step${state.stepCount}` : i}
                    className={`${s.line} ${isCurrent ? `${s.lineCurrent} ${s.lineFlash}` : ''}`}
                    aria-current={isCurrent || undefined}
                  >
                    <span className={s.lineNo} aria-hidden="true">
                      {i + 1}
                    </span>
                    <span className={s.lineText}>{text}</span>
                  </li>
                )
              })}
            </ol>
            <div className={s.watch}>
              <p className={s.watchTitle} id="dncl-watch">
                変数ウォッチ表
              </p>
              <table className={s.table}>
                <caption className="srOnly" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden' }}>
                  変数と、その現在の値
                </caption>
                <thead>
                  <tr>
                    <th scope="col">変数</th>
                    <th scope="col">値</th>
                  </tr>
                </thead>
                <tbody>
                  {names.length === 0 ? (
                    <tr>
                      <td colSpan={2} className={s.watchEmpty}>
                        変数はありません
                      </td>
                    </tr>
                  ) : (
                    names.map((name) => {
                      const has = snapshot != null && name in snapshot.vars
                      const v = has ? snapshot.vars[name] : undefined
                      const changed = changedNames.has(name)
                      return (
                        <tr key={`${name}-${changed ? state.stepCount : 'stable'}`}>
                          <th scope="row" className={s.varName}>
                            {name}
                          </th>
                          <td className={`${s.varValue} ${changed ? s.cellFlash : ''}`}>
                            {has ? formatNum(v as number) : '—'}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <div className={styles.panel}>
        <div className={styles.panelRow}>
          <span className={styles.panelTitle} id="dncl-program">
            プログラム
          </span>
          <Segmented
            label="サンプルプログラムの選択"
            value={state.programId}
            options={PROGRAM_OPTIONS}
            onChange={(id) => dispatch({ type: 'load', programId: id })}
          />
          <p className={s.programNote}>{meta.note}</p>
        </div>
        <div className={styles.panelRow}>
          <span className={styles.panelTitle} id="dncl-speed">
            自動実行の速さ
          </span>
          <Segmented
            label="自動実行の速さ"
            value={speed}
            options={SPEED_OPTIONS}
            onChange={setSpeed}
          />
        </div>
        <p className={s.hint}>
          {meta.id === 'infinite'
            ? '自動再生を続けると、上限（100手）に達して「エラー（無限ループ）」になります。手動の「次へ」でも確かめられます。'
            : '「次へ」で1手ずつ進め、「1手戻る」で直前の状態に戻れます。自動再生はいつでも一時停止できます。'}
        </p>
      </div>

      {/* デモ専用の下部固定バー */}
      <div className={`${styles.ownBar} ${s.ownBarPad}`}>
        <div className={styles.ownBarInner}>
          <div className={styles.ctrlRow}>
            <button
              type="button"
              className={styles.ctrlBtn}
              onClick={() => dispatch({ type: 'back' })}
              disabled={state.stepCount === 0}
            >
              <PrevIcon />
              1手戻る
            </button>
            <button
              type="button"
              className={`${styles.ctrlBtn} ${state.phase === 'running' ? '' : styles.ctrlPrimary}`}
              onClick={() => dispatch({ type: state.phase === 'running' ? 'stop' : 'play' })}
              disabled={state.phase === 'finished' || state.phase === 'error'}
            >
              {state.phase === 'running' ? <PauseIcon /> : <PlayIcon />}
              {state.phase === 'running' ? '一時停止' : '再生'}
            </button>
            <button
              type="button"
              className={styles.ctrlBtn}
              onClick={() => dispatch({ type: 'next' })}
              disabled={!canStep}
            >
              <NextIcon />
              次へ
            </button>
            <button
              type="button"
              className={styles.ctrlBtn}
              onClick={() => dispatch({ type: 'reset' })}
              disabled={state.phase === 'idle'}
            >
              <ResetIcon />
              リセット
            </button>
          </div>
          <div className={s.ctaRow}>
            <p className={s.status} aria-live="polite">
              {statusText}
            </p>
            <Link to={`/quiz/${quizId}`} className={s.cta}>
              ミニ問題へ
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
