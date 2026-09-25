import Badge from '../../components/ui/Badge'
import { ClockIcon } from '../../components/ui/Icons'
import styles from './ScheduleCard.module.css'

/**
 * 서비스 일정 카드
 *
 * @param {string} title 서비스 이름 (예: 방문간호)
 * @param {string} time 표시용 시간 범위 (예: 11:00 ~ 12:00)
 * @param {{ label: string, variant: string }} badge 상태 배지
 */
function ScheduleCard({ title, time, badge, className = '', ...rest }) {
  return (
    <article className={[styles.card, className].filter(Boolean).join(' ')} {...rest}>
      <div className={styles.head}>
        <h3 className={styles.title}>{title}</h3>
        {badge && <Badge variant={badge.variant}>{badge.label}</Badge>}
      </div>

      <p className={styles.row}>
        <ClockIcon className={styles.icon} />
        <span>서비스 시간:</span>
        <span className={styles.value}>{time}</span>
      </p>
    </article>
  )
}

/** 일정 카드 로딩 자리표시 */
export function ScheduleCardSkeleton() {
  return (
    <div className={`${styles.card} ${styles.skeleton}`} aria-hidden="true">
      <div className={styles.head}>
        <span className={`${styles.block} ${styles.blockTitle}`} />
        <span className={`${styles.block} ${styles.blockBadge}`} />
      </div>
      <span className={`${styles.block} ${styles.blockRow}`} />
    </div>
  )
}

export default ScheduleCard
