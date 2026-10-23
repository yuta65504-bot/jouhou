import { NavLink, Outlet } from 'react-router-dom'
import { FIELDS, FIELD_IDS } from '@/lib/fields'
import { GridIcon, BookIcon, PencilIcon, ChartIcon, HomeIcon, GearIcon } from './Icons'
import styles from './AppLayout.module.css'

const tabs = [
  { to: '/', label: 'ホーム', Icon: HomeIcon },
  { to: '/fields', label: '分野', Icon: GridIcon },
  { to: '/quiz', label: '演習', Icon: PencilIcon },
  { to: '/terms', label: '用語', Icon: BookIcon },
  { to: '/records', label: '記録', Icon: ChartIcon },
] as const

const tabCls = ({ isActive }: { isActive: boolean }) =>
  `${styles.tab} ${isActive ? styles.tabActive : ''}`

const sideCls = ({ isActive }: { isActive: boolean }) =>
  `${styles.sideLink} ${isActive ? styles.sideActive : ''}`

/**
 * アプリ共通レイアウト（仕様書 §5）
 * - モバイル: 下部タブバー5項目（常時表示）
 * - 768px以上: 左サイドバーに分野ツリー。両者は同時には表示しない
 */
export function AppLayout() {
  return (
    <div className={styles.app}>
      <nav className={styles.sidebar} aria-label="サイトナビゲーション">
        <NavLink to="/" className={styles.brand}>
          jouhou
        </NavLink>
        <div className={styles.sideGroup}>
          <NavLink to="/" end className={sideCls}>
            ホーム
          </NavLink>
        </div>
        <div className={styles.sideGroup}>
          <p className={styles.sideHeading} id="side-fields">
            分野
          </p>
          <ul aria-labelledby="side-fields">
            {FIELD_IDS.map((id) => {
              const field = FIELDS.find((f) => f.id === id)!
              return (
                <li key={id}>
                  <NavLink to={`/fields/${id}`} className={sideCls}>
                    <span className={styles.dot} style={{ background: field.colorVar }} aria-hidden="true" />
                    {field.name}
                  </NavLink>
                </li>
              )
            })}
          </ul>
        </div>
        <div className={styles.sideGroup}>
          <NavLink to="/quiz" className={sideCls}>
            演習
          </NavLink>
          <NavLink to="/terms" className={sideCls}>
            用語
          </NavLink>
          <NavLink to="/records" className={sideCls}>
            記録
          </NavLink>
          <NavLink to="/settings" className={sideCls}>
            <GearIcon size={16} />
            設定
          </NavLink>
        </div>
      </nav>

      <div className={styles.main}>
        <main className={styles.content} id="content">
          <Outlet />
        </main>
      </div>

      <nav className={styles.tabbar} aria-label="メインナビゲーション">
        {tabs.map(({ to, label, Icon }) => (
          <NavLink key={to} to={to} end={to === '/'} className={tabCls}>
            <Icon />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
