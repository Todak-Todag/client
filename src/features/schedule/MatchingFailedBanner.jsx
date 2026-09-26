import { AlertIcon, ChevronRightIcon } from '../../components/ui/Icons'
import styles from './MatchingFailedBanner.module.css'

/**
 * 다시 요청해야 하는 매칭 실패 안내. 누르면 매칭 화면으로 이동한다.
 *
 * @param {number} count 매칭되지 않은 희망 일정 건수
 * @param {() => void} onClick
 */
function MatchingFailedBanner({ count, onClick }) {
  return (
    <button type="button" className={styles.banner} onClick={onClick}>
      <AlertIcon className={styles.icon} />
      <span className={styles.text}>
        <span className={styles.title}>매칭되지 않은 희망 일정이 {count}건 있어요</span>
        <span className={styles.description}>
          다시 요청하지 않으면 해당 일정은 진행되지 않아요.
        </span>
      </span>
      <ChevronRightIcon className={styles.chevron} />
    </button>
  )
}

export default MatchingFailedBanner
