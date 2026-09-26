import Badge from '../../components/ui/Badge'
import { ChevronRightIcon, ClockIcon } from '../../components/ui/Icons'
import styles from './ScheduleCard.module.css'

/**
 * 서비스 일정 카드
 *
 * @param {string} title 서비스 이름 (예: 방문간호)
 * @param {string} time 표시용 시간 범위 (예: 11:00 ~ 12:00)
 * @param {{ label: string, variant: string }} badge 상태 배지
 * @param {string} description 서비스 내용 (없으면 숨김)
 * @param {() => void} onDetail 있으면 시간 줄 오른쪽에 '상세 보기'를 표시 (홈처럼 요약만 보여줄 때)
 */
function ScheduleCard({ title, time, badge, description, onDetail, className = '', ...rest }) {
  return (
    <article className={[styles.card, className].filter(Boolean).join(' ')} {...rest}>
      <div className={styles.head}>
        <h3 className={styles.title}>{title}</h3>
        {badge && <Badge variant={badge.variant}>{badge.label}</Badge>}
      </div>

      {description && (
        <div className={styles.description}>
          <p className={styles.descriptionLabel}>서비스 내용</p>
          <p className={styles.descriptionText}>{description}</p>
        </div>
      )}

      <div className={styles.foot}>
        <p className={styles.row}>
          <ClockIcon className={styles.icon} />
          {/* 요약 카드는 시계 아이콘만으로 시간임을 알 수 있어 라벨을 스크린리더용으로만 남긴다 */}
          <span className={onDetail ? styles.srOnly : undefined}>서비스 시간:</span>
          <span className={styles.value}>{time}</span>
        </p>

        {onDetail && (
          <button
            type="button"
            className={styles.detail}
            onClick={onDetail}
            aria-label={`${title} 상세 보기`}
          >
            상세 보기
            <ChevronRightIcon className={styles.detailIcon} />
          </button>
        )}
      </div>
    </article>
  )
}

/**
 * 일정 카드 로딩 자리표시
 * @param {boolean} description 서비스 내용 자리까지 표시할지
 */
export function ScheduleCardSkeleton({ description = false }) {
  return (
    <div className={`${styles.card} ${styles.skeleton}`} aria-hidden="true">
      <div className={styles.head}>
        <span className={`${styles.block} ${styles.blockTitle}`} />
        <span className={`${styles.block} ${styles.blockBadge}`} />
      </div>
      {description && <span className={`${styles.block} ${styles.blockDescription}`} />}
      <span className={`${styles.block} ${styles.blockRow}`} />
    </div>
  )
}

export default ScheduleCard
