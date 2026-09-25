import BottomBar from './BottomBar'
import styles from './Navbar.module.css'
import { NAV_ITEMS } from './navItems'

/**
 * 화면 최하단에 고정되는 공통 네브바
 *
 * @param {string} active 현재 선택된 항목의 key (home | schedule | matching | my)
 * @param {(key: string) => void} onChange 항목 클릭 핸들러
 * @param {Array} items 항목 목록 (기본값: NAV_ITEMS)
 */
function Navbar({ active = 'home', onChange, items = NAV_ITEMS, className = '', ...rest }) {
  return (
    <BottomBar className={className} {...rest}>
      <nav className={styles.nav} aria-label="주요 메뉴">
        {items.map(({ key, label, Icon }) => {
          const isActive = key === active
          return (
            <button
              key={key}
              type="button"
              className={[styles.item, isActive ? styles.active : '']
                .filter(Boolean)
                .join(' ')}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => onChange?.(key)}
            >
              <Icon className={styles.icon} />
              <span className={styles.label}>{label}</span>
            </button>
          )
        })}
      </nav>
    </BottomBar>
  )
}

/** 고정 네브바에 본문이 가리지 않도록 넣어주는 여백 */
export function NavbarSpacer() {
  return <div className={styles.spacer} aria-hidden="true" />
}

export default Navbar
