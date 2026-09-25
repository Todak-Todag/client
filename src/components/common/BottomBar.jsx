import '../../styles/tokens.css'
import styles from './BottomBar.module.css'

/**
 * 화면 최하단에 고정되는 공통 바.
 * 홈 인디케이터만 필요하면 children 없이 사용하고,
 * 내용이 필요하면 children으로 넣는다. (Navbar도 이 컴포넌트를 사용)
 *
 * @param {React.ReactNode} children 바 내부에 표시할 내용
 * @param {boolean} indicator 하단 홈 인디케이터 표시 여부
 */
function BottomBar({ children, indicator = true, className = '', ...rest }) {
  return (
    <div className={[styles.bottomBar, className].filter(Boolean).join(' ')} {...rest}>
      {children && <div className={styles.content}>{children}</div>}
      {indicator && <div className={styles.indicator} aria-hidden="true" />}
    </div>
  )
}

/** 고정 바에 본문이 가리지 않도록 넣어주는 여백 */
export function BottomBarSpacer() {
  return <div className={styles.spacer} aria-hidden="true" />
}

export default BottomBar
