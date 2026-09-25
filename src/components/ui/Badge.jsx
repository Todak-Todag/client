import styles from './Badge.module.css'

/**
 * 상태 표시용 배지
 *
 * @param {'primary'|'info'|'neutral'|'danger'} variant 배지 색
 */
function Badge({ children, variant = 'neutral', className = '', ...rest }) {
  return (
    <span
      className={[styles.badge, styles[variant], className].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </span>
  )
}

export default Badge
