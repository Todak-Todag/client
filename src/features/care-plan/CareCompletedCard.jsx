import Button from '../../components/ui/Button'
import styles from './CarePlanCard.module.css'

/**
 * 케어 종료(COMPLETED) 안내 카드
 *
 * 서버가 COMPLETED로 바꾸는 경우는 두 가지다.
 * - 케어를 마침: IN_PROGRESS → COMPLETED. 서비스가 남아 있어 수행 결과를 볼 수 있다
 * - 검토 중에 마지막 서비스를 뺌: 서비스가 모두 빠진 채 종료. 수행 결과가 없다
 *
 * @param {string|null} period 케어 기간 (예: 8월 1일 – 8월 30일). 없으면 기간 없이 안내
 * @param {boolean} withoutService 서비스를 모두 빼서 종료된 케어플랜
 * @param {() => void} onViewResults 서비스 수행 결과 보기 핸들러 (withoutService면 쓰지 않음)
 */
function CareCompletedCard({ period, withoutService = false, onViewResults }) {
  if (withoutService) {
    return (
      <section className={styles.card} aria-labelledby="care-completed-title">
        <h2 id="care-completed-title" className={styles.title}>
          케어플랜이 종료되었어요
        </h2>
        <p className={styles.description}>
          케어플랜에 남은 서비스가 없어 케어를 시작하지 않고 종료됐어요.
        </p>
      </section>
    )
  }

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
