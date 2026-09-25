import '../../styles/tokens.css'
import styles from './Header.module.css'
import defaultLogo from '../../../images/logo2.webp'

/**
 * 화면 최상단에 고정되는 공통 헤더바
 *
 * @param {string} title 가운데 표시될 제목
 * @param {string|null} logo 왼쪽 로고 이미지 경로 (null이면 숨김)
 * @param {boolean} showBack 로고 대신 뒤로가기 버튼 표시
 * @param {() => void} onBack 뒤로가기 클릭 핸들러
 * @param {() => void} onLogoClick 로고 클릭 핸들러 (있으면 로고가 버튼이 됨)
 * @param {React.ReactNode} left 왼쪽 영역 커스텀 요소 (로고/뒤로가기보다 우선)
 * @param {React.ReactNode} right 오른쪽 영역 요소
 */
function Header({
  title = '',
  logo = defaultLogo,
  showBack = false,
  onBack,
  onLogoClick,
  left,
  right,
  className = '',
  ...rest
}) {
  const renderLeft = () => {
    if (left) return left
    if (showBack) {
      return (
        <button
          type="button"
          className={styles.backButton}
          onClick={onBack}
          aria-label="뒤로 가기"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      )
    }
    if (!logo) return null

    const image = <img src={logo} alt="토닥토닥" className={styles.logo} />

    if (!onLogoClick) return image

    return (
      <button
        type="button"
        className={styles.logoButton}
        onClick={onLogoClick}
        aria-label="홈으로 가기"
      >
        {image}
      </button>
    )
  }

  return (
    <header className={[styles.header, className].filter(Boolean).join(' ')} {...rest}>
      <div className={styles.side}>{renderLeft()}</div>
      <div className={styles.center}>
        <h1 className={styles.title}>{title}</h1>
      </div>
      <div className={`${styles.side} ${styles.right}`}>{right}</div>
    </header>
  )
}

/** 고정 헤더에 본문이 가리지 않도록 넣어주는 여백 */
export function HeaderSpacer() {
  return <div className={styles.spacer} aria-hidden="true" />
}

export default Header
