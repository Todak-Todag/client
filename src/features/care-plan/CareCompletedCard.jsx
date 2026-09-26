import Button from '../../components/ui/Button'
import styles from './CarePlanCard.module.css'

/**
 * 케어 종료(COMPLETED) 안내 카드
 *
 * @param {string|null} period 케어 기간 (예: 8월 1일 – 8월 30일). 없으면 기간 없이 안내
 * @param {() => void} onViewResults 서비스 수행 결과 보기 핸들러
 */
function CareCompletedCard({ period, onViewResults }) {
  return (
    <section className={styles.card} aria-labelledby="care-completed-title">
      <h2 id="care-completed-title" className={styles.title}>
        케어가 종료되었어요
      </h2>
      <p className={styles.description}>
        {period ? `${period} 동안의 케어 일정이 모두 끝났어요.` : '케어 일정이 모두 끝났어요.'}
      </p>
      <Button variant="soft" className={styles.action} onClick={onViewResults}>
        서비스 수행 결과 보기
      </Button>
    </section>
  )
}

export default CareCompletedCard
