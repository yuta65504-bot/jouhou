/**
 * DNCL風サブセットのパーサとステップ実行エンジン（仕様書 §8 プログラミング / L2）
 *
 * 状態遷移: Idle → Running → Paused → Finished / Error（無限ループ検出時）
 * - 1「手」= 1つの基本動作（代入・条件評価など）を1ステップと数える
 * - ステップ上限 STEP_LIMIT を超えても終わらない場合、無限ループの可能性として Error にする
 * - 「1手戻る」は履歴を持たず、最初から N-1 手を計算し直す（プログラムは短いため十分）
 *
 * ※DNCL（共通テスト用言語）を参考にしたデモ用の簡易サブセット。
 */

export type Vars = Record<string, number>

export type Expr =
  | { k: 'num'; v: number }
  | { k: 'var'; name: string }
  | { k: 'bin'; op: string; l: Expr; r: Expr }

export type Stmt =
  | { type: 'assign'; line: number; name: string; expr: Expr }
  | { type: 'for'; line: number; varName: string; from: Expr; to: Expr; body: Stmt[] }
  | { type: 'while'; line: number; cond: Expr; body: Stmt[] }
  | { type: 'if'; line: number; cond: Expr; then: Stmt[]; els: Stmt[] | null }

export class DnclParseError extends Error {}

export class DnclRuntimeError extends Error {
  line: number
  constructor(line: number, message: string) {
    super(message)
    this.line = line
  }
}

const CMP_OPS = ['=', '≠', '<', '≤', '>', '≥']

/* ---------- 式パーサ ---------- */

type Ctx = { tokens: string[]; pos: number; line: number }

const peek = (c: Ctx): string | undefined => c.tokens[c.pos]

function isNumToken(t: string): boolean {
  return /^-?\d+(\.\d+)?$/.test(t)
}

function parsePrimary(c: Ctx): Expr {
  const t = peek(c)
  if (t == null) throw new DnclParseError(`${c.line + 1}行目: 式が途中で終わっています`)
  if (t === '(') {
    c.pos++
    const e = parseSum(c)
    if (peek(c) !== ')') throw new DnclParseError(`${c.line + 1}行目: 「)」がありません`)
    c.pos++
    return e
  }
  if (isNumToken(t)) {
    c.pos++
    return { k: 'num', v: Number(t) }
  }
  if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(t)) {
    c.pos++
    return { k: 'var', name: t }
  }
  throw new DnclParseError(`${c.line + 1}行目: 「${t}」は式の要素として読み取れません`)
}

function parseMul(c: Ctx): Expr {
  let left = parsePrimary(c)
  for (;;) {
    const op = peek(c)
    if (op !== '×' && op !== '÷' && op !== '%') break
    c.pos++
    const right = parsePrimary(c)
    left = { k: 'bin', op, l: left, r: right }
  }
  return left
}

function parseSum(c: Ctx): Expr {
  let left = parseMul(c)
  for (;;) {
    const op = peek(c)
    if (op !== '+' && op !== '-') break
    c.pos++
    const right = parseMul(c)
    left = { k: 'bin', op, l: left, r: right }
  }
  return left
}

/** 式トークン列を丸ごと1つの式として解釈する */
function parseExprTokens(tokens: string[], line: number): Expr {
  const c: Ctx = { tokens, pos: 0, line }
  const expr = parseSum(c)
  if (peek(c) != null) {
    throw new DnclParseError(`${line + 1}行目: 「${peek(c)}」の位置が正しくありません`)
  }
  return expr
}

/** 条件式（比較を含む）を解釈する */
function parseCond(tokens: string[], line: number): Expr {
  const c: Ctx = { tokens, pos: 0, line }
  const left = parseSum(c)
  const t = peek(c)
  if (t != null && CMP_OPS.includes(t)) {
    c.pos++
    const right = parseSum(c)
    if (peek(c) != null) throw new DnclParseError(`${line + 1}行目: 条件式が不正です`)
    return { k: 'bin', op: t, l: left, r: right }
  }
  if (peek(c) != null) throw new DnclParseError(`${line + 1}行目: 条件式が不正です`)
  return left
}

/* ---------- 文パーサ（行ベース、ブロックはインデント不問） ---------- */

const FOR_PATTERN = 8

function parseBlock(
  lines: readonly string[],
  start: number,
  stopWords: readonly string[],
): { stmts: Stmt[]; next: number; stop: string | null } {
  const stmts: Stmt[] = []
  let i = start
  while (i < lines.length) {
    const trimmed = lines[i].trim()
    if (trimmed === '') {
      i++
      continue
    }
    if (stopWords.includes(trimmed)) {
      return { stmts, next: i + 1, stop: trimmed }
    }
    const tokens = trimmed.split(/\s+/)
    const line = i

    if (tokens[0] === 'if' && tokens[tokens.length - 1] === 'then') {
      if (tokens.length < 3) throw new DnclParseError(`${line + 1}行目: 条件がありません`)
      const cond = parseCond(tokens.slice(1, -1), line)
      const thenBlock = parseBlock(lines, i + 1, ['else', 'end'])
      if (thenBlock.stop == null) {
        throw new DnclParseError(`${line + 1}行目: if に対応する end がありません`)
      }
      let els: Stmt[] | null = null
      let next: number
      if (thenBlock.stop === 'else') {
        const elseBlock = parseBlock(lines, thenBlock.next, ['end'])
        if (elseBlock.stop !== 'end') {
          throw new DnclParseError(`${line + 1}行目: if に対応する end がありません`)
        }
        els = elseBlock.stmts
        next = elseBlock.next
      } else {
        next = thenBlock.next
      }
      stmts.push({ type: 'if', line, cond, then: thenBlock.stmts, els })
      i = next
      continue
    }

    if (trimmed === 'else' || trimmed === 'end') {
      throw new DnclParseError(`${line + 1}行目: 対応する if がありません`)
    }
    if (trimmed === '繰り返しここまで') {
      throw new DnclParseError(`${line + 1}行目: 対応する繰り返しがありません`)
    }

    if (
      tokens.length === FOR_PATTERN &&
      tokens[1] === 'を' &&
      tokens[3] === 'から' &&
      tokens[5] === 'まで' &&
      tokens[6] === '増やしながら' &&
      tokens[7] === '繰り返す:'
    ) {
      const from = parseCond([tokens[2]], line)
      const to = parseCond([tokens[4]], line)
      const body = parseBlock(lines, i + 1, ['繰り返しここまで'])
      if (body.stop !== '繰り返しここまで') {
        throw new DnclParseError(`${line + 1}行目: 「繰り返しここまで」がありません`)
      }
      stmts.push({ type: 'for', line, varName: tokens[0], from, to, body: body.stmts })
      i = body.next
      continue
    }

    if (tokens.length >= 3 && tokens[tokens.length - 2] === 'の間' && tokens[tokens.length - 1] === '繰り返す:') {
      const cond = parseCond(tokens.slice(0, tokens.length - 2), line)
      const body = parseBlock(lines, i + 1, ['繰り返しここまで'])
      if (body.stop !== '繰り返しここまで') {
        throw new DnclParseError(`${line + 1}行目: 「繰り返しここまで」がありません`)
      }
      stmts.push({ type: 'while', line, cond, body: body.stmts })
      i = body.next
      continue
    }

    if (tokens.length >= 3 && tokens[1] === '←') {
      const expr = parseExprTokens(tokens.slice(2), line)
      stmts.push({ type: 'assign', line, name: tokens[0], expr })
      i++
      continue
    }

    throw new DnclParseError(`${line + 1}行目: 「${trimmed}」は読み取れません`)
  }
  if (stopWords.length > 0) {
    throw new DnclParseError(`「${stopWords[0]}」がありません`)
  }
  return { stmts, next: i, stop: null }
}

export function parseProgram(lines: readonly string[]): Stmt[] {
  return parseBlock(lines, 0, []).stmts
}

/* ---------- 変数名の収集（ウォッチ表の行を決める） ---------- */

function collectVarNames(stmts: readonly Stmt[], out: string[]): void {
  for (const st of stmts) {
    switch (st.type) {
      case 'assign':
        if (!out.includes(st.name)) out.push(st.name)
        break
      case 'for':
        if (!out.includes(st.varName)) out.push(st.varName)
        collectVarNames(st.body, out)
        break
      case 'while':
        collectVarNames(st.body, out)
        break
      case 'if':
        collectVarNames(st.then, out)
        if (st.els) collectVarNames(st.els, out)
        break
    }
  }
}

export function varNamesOf(program: readonly Stmt[]): string[] {
  const names: string[] = []
  collectVarNames(program, names)
  return names
}

/* ---------- 評価 ---------- */

function evalExpr(e: Expr, vars: Vars, line: number): number {
  switch (e.k) {
    case 'num':
      return e.v
    case 'var': {
      if (!(e.name in vars)) {
        throw new DnclRuntimeError(line, `変数 ${e.name} にまだ値が入っていません`)
      }
      return vars[e.name]
    }
    case 'bin': {
      const l = evalExpr(e.l, vars, line)
      const r = evalExpr(e.r, vars, line)
      switch (e.op) {
        case '+':
          return l + r
        case '-':
          return l - r
        case '×':
          return l * r
        case '÷':
          return l / r
        case '%':
          return l % r
        case '=':
          return l === r ? 1 : 0
        case '≠':
          return l !== r ? 1 : 0
        case '<':
          return l < r ? 1 : 0
        case '≤':
          return l <= r ? 1 : 0
        case '>':
          return l > r ? 1 : 0
        case '≥':
          return l >= r ? 1 : 0
        default:
          throw new DnclRuntimeError(line, `演算子 ${e.op} は使えません`)
      }
    }
  }
}

/* ---------- ステップ実行 ---------- */

export type Snapshot = { line: number; vars: Vars }

export type RunResult = {
  /** 実行済みステップのスナップショット（snapshots[n] が n+1 手目の状態） */
  snapshots: Snapshot[]
  /** プログラムが完了した */
  done: boolean
  /** 実行時エラー（未代入変数など） */
  error: { line: number; message: string } | null
}

export const STEP_LIMIT = 100

export function computeRun(program: readonly Stmt[], uptoSteps: number): RunResult {
  const vars: Vars = {}
  const snapshots: Snapshot[] = []
  let done = false
  let error: { line: number; message: string } | null = null
  const limit = Math.max(0, uptoSteps)
  const gen = exec(program, vars)
  for (let n = 0; n < limit; n++) {
    let r: IteratorResult<number, void>
    try {
      r = gen.next()
    } catch (e) {
      if (e instanceof DnclRuntimeError) {
        error = { line: e.line, message: e.message }
      } else {
        error = { line: 0, message: '実行中にエラーが発生しました' }
      }
      break
    }
    if (r.done) {
      done = true
      break
    }
    snapshots.push({ line: r.value, vars: { ...vars } })
  }
  if (!done && !error) {
    // 上限ちょうどで終わっているか（= まだ続くプログラムなのか）を確かめる
    try {
      const r = gen.next()
      if (r.done) done = true
    } catch (e) {
      if (e instanceof DnclRuntimeError) {
        error = { line: e.line, message: e.message }
      } else {
        error = { line: 0, message: '実行中にエラーが発生しました' }
      }
    }
  }
  return { snapshots, done, error }
}

function* exec(stmts: readonly Stmt[], vars: Vars): Generator<number, void, unknown> {
  for (const st of stmts) {
    switch (st.type) {
      case 'assign': {
        vars[st.name] = evalExpr(st.expr, vars, st.line)
        yield st.line
        break
      }
      case 'for': {
        const from = evalExpr(st.from, vars, st.line)
        const to = evalExpr(st.to, vars, st.line)
        yield st.line
        for (let v = from; v <= to; v++) {
          vars[st.varName] = v
          yield* exec(st.body, vars)
        }
        break
      }
      case 'while': {
        yield st.line
        while (evalExpr(st.cond, vars, st.line) !== 0) {
          yield* exec(st.body, vars)
          yield st.line
        }
        break
      }
      case 'if': {
        yield st.line
        if (evalExpr(st.cond, vars, st.line) !== 0) {
          yield* exec(st.then, vars)
        } else if (st.els) {
          yield* exec(st.els, vars)
        }
        break
      }
    }
  }
}
