import styles from './EmptyState.module.css'

/**
 * 비어 있거나 불러오지 못한 상태를 안내하는 블록
 *
 * @param {React.ComponentType} icon 위에 표시할 아이콘 컴포넌트
 * @param {string} title 안내 제목
 * @param {string} description 보조 설명
 * @param {React.ReactNode} action 하단 버튼 등
 * @param {'empty'|'error'} tone 오류일 때는 스크린리더가 바로 읽도록 role="alert"
 */
function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  tone = 'empty',
  className = '',
  ...rest
}) {
  return (
    <div
      className={[styles.emptyState, styles[tone], className].filter(Boolean).join(' ')}
      role={tone === 'error' ? 'alert' : undefined}
      {...rest}
    >
      {Icon && (
        <span className={styles.iconWrap} aria-hidden="true">
          <Icon className={styles.icon} />
        </span>
      )}
      <p className={styles.title}>{title}</p>
      {description && <p className={styles.description}>{description}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  )
}

export default EmptyState
