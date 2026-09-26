import { AlertIcon, CalendarIcon, ChevronRightIcon } from '../../components/ui/Icons'
import styles from './CarePlanReview.module.css'

/**
 * 선택한 서비스 한 줄. 카드 전체가 서비스 상세로 가는 버튼이다.
 * 희망 일정이 없으면 매칭되지 않으므로 경고로 바꿔 보여준다 (색 + 아이콘 + 문구).
 *
 * @param {string} name 서비스 이름
 * @param {number} preferenceCount 희망 일정 수
 * @param {() => void} onClick
 */
function PlanServiceItem({ name, preferenceCount, onClick }) {
  const empty = preferenceCount === 0

  return (
    <button type="button" className={`${styles.card} ${styles.serviceItem}`} onClick={onClick}>
      <span className={styles.serviceBody}>
        <span className={styles.cardTitle}>{name}</span>
        {empty ? (
          <span className={`${styles.meta} ${styles.metaWarning}`}>
            <AlertIcon className={styles.metaIcon} />
            희망 일정을 추가해 주세요
          </span>
        ) : (
          <span className={styles.meta}>
            <CalendarIcon className={styles.metaIcon} />
            희망 일정 {preferenceCount}건
          </span>
        )}
      </span>
      <ChevronRightIcon className={styles.chevron} />
    </button>
  )
}

export default PlanServiceItem
