import Badge from '../../components/ui/Badge'
import { CalendarIcon } from '../../components/ui/Icons'
import { countDays, formatDateRange } from '../../utils/date'
import styles from './CarePlanReview.module.css'

/**
 * 케어플랜 확인 화면 맨 위 요약: 기간 + 병원 메모
 *
 * @param {{ startDate: string|null, finishDate: string|null, note: string|null }} carePlan
 */
function CarePlanSummaryCard({ carePlan }) {
  const period = formatDateRange(carePlan.startDate, carePlan.finishDate)
  const days = period ? countDays(carePlan.startDate, carePlan.finishDate) : null

  return (
    <section className={styles.card} aria-labelledby="care-plan-summary-title">
      <div className={styles.cardHead}>
        <h2 id="care-plan-summary-title" className={styles.cardTitle}>
          나의 케어플랜
        </h2>
        <Badge variant="warning">검토 중</Badge>
      </div>

      {period && (
        <p className={styles.meta}>
          <CalendarIcon className={styles.metaIcon} />
          <span className={styles.srOnly}>케어 기간:</span>
          <span>
            {period} · {days}일
          </span>
        </p>
      )}

      {/* 카드 안 보조 영역은 테두리 없이 배경색만 (ScheduleCard '서비스 내용'과 같은 규칙) */}
      {carePlan.note && (
        <div className={styles.inset}>
          <p className={styles.insetLabel}>병원 메모</p>
          <p className={styles.insetText}>{carePlan.note}</p>
        </div>
      )}
    </section>
  )
}

export default CarePlanSummaryCard
