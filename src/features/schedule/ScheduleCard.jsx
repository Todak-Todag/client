import { Link } from 'react-router-dom'
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
 * @param {string} to 있으면 카드 전체가 이 경로로 가는 링크가 된다 (일정 목록)
 * @param {boolean} dimmed 취소된 일정처럼 지나간 정보는 글자를 한 단계 낮춘다
 */
function ScheduleCard({
  title,
  time,
  badge,
  description,
  onDetail,
  to,
  dimmed = false,
  className = '',
  ...rest
}) {
  return (
    <article
      className={[styles.card, to ? styles.linked : '', dimmed ? styles.dimmed : '', className]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      <div className={styles.head}>
        <h3 className={styles.title}>
          {/* 제목 링크의 누름 영역을 카드 전체로 넓힌다 (제목 구조는 그대로 둠) */}
          {to ? (
            <Link to={to} className={styles.link}>
              {title}
            </Link>
          ) : (
            title
          )}
        </h3>
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
          {/* 요약·목록 카드는 시계 아이콘만으로 시간임을 알 수 있어 라벨을 스크린리더용으로만 남긴다 */}
          <span className={onDetail || to ? styles.srOnly : undefined}>서비스 시간:</span>
          <span className={styles.value}>{time}</span>
        </p>

        {to && <ChevronRightIcon className={styles.chevron} />}

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
