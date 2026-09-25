import styles from './Button.module.css'

/**
 * 공통 버튼
 *
 * @param {'primary'|'outline'|'ghost'|'dashed'} variant 버튼 스타일
 * @param {'sm'|'md'|'lg'} size 버튼 크기
 * @param {boolean} block 가로 전체 너비 사용 여부
 * @param {boolean} loading 로딩 상태(스피너 표시 + 비활성화)
 */
function Button({
  children,
  variant = 'primary',
  size = 'lg',
  block = true,
  loading = false,
  disabled = false,
  type = 'button',
  className = '',
  ...rest
}) {
  const classNames = [
    styles.button,
    styles[variant],
    styles[size],
    block ? styles.block : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      type={type}
      className={classNames}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <span className={styles.spinner} aria-hidden="true" />}
      {children}
    </button>
  )
}

export default Button
