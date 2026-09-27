import { getErrorMessage } from '../../api/client'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { MatchingIcon } from '../../components/ui/Icons'
import { SOCIAL_WORKER_MATCHING_STATUS } from '../../constants/status'
import { formatMonthDay, toLocalDateString } from '../../utils/date'
import { ScheduleCardSkeleton } from '../schedule/ScheduleCard'
import { getSocialWorkerBadge } from './matchingStatus'
import cardStyles from '../care-plan/CarePlanReview.module.css'
import styles from './Matching.module.css'

/** 요청 전·실패·종료: 다시 요청할 수 있는 상태의 문구 */
function getRequestCopy(phase, resultStatus) {
  if (phase === 'taskFailed' || resultStatus === SOCIAL_WORKER_MATCHING_STATUS.FAILED) {
    return {
      title: '사회복지사를 찾지 못했어요',
      description: '지금은 연결할 수 있는 사회복지사가 없어요. 잠시 후 다시 요청해 주세요.',
      badge: getSocialWorkerBadge(SOCIAL_WORKER_MATCHING_STATUS.FAILED),
      action: '다시 요청하기',
    }
  }
  if (resultStatus === SOCIAL_WORKER_MATCHING_STATUS.ENDED) {
    return {
      title: '사회복지사 연결이 종료됐어요',
      description: '도움이 더 필요하면 다시 매칭을 요청할 수 있어요.',
      badge: getSocialWorkerBadge(SOCIAL_WORKER_MATCHING_STATUS.ENDED),
      action: '다시 요청하기',
    }
  }
  return {
    title: '사회복지사 매칭',
    description: '케어플랜과 일정 관리를 도와드려요.',
    badge: null,
    action: '사회복지사 매칭 요청하기',
  }
}

/** assignedAt은 UTC Instant라 기기 시간대의 날짜로 바꿔 보여준다 */
const formatInstantDate = (instant) => formatMonthDay(toLocalDateString(new Date(instant)))

/**
 * 사회복지사 매칭 카드. 상태(useSocialWorkerMatching)에 따라 요청 · 찾는 중 · 배정됨으로 바뀐다.
 * 사회복지사 이름·연락처는 서버가 주지 않아 표시하지 않는다.
 *
 * @param {ReturnType<import('./useSocialWorkerMatching').useSocialWorkerMatching>} matching
 */
function SocialWorkerCard({ matching }) {
  if (matching.status === 'loading') {
    return (
      <>
        <p className={styles.srOnly} role="status">
          사회복지사 매칭 상태를 불러오는 중이에요
        </p>
        <ScheduleCardSkeleton />
      </>
    )
  }

  if (matching.status === 'error') {
    return (
      <article className={cardStyles.card}>
        <Person title="상태를 불러오지 못했어요">
          <p className={styles.description} role="alert">
            {getErrorMessage(matching.error)}
          </p>
        </Person>
        <Button variant="secondary" size="md" onClick={matching.refresh}>
          다시 시도
        </Button>
      </article>
    )
  }

  const { phase, result } = matching.data

  if (phase === 'searching' || result?.status === SOCIAL_WORKER_MATCHING_STATUS.REQUESTED) {
    return (
      <article className={cardStyles.card}>
        <Person
          title="사회복지사를 찾고 있어요"
          badge={getSocialWorkerBadge(SOCIAL_WORKER_MATCHING_STATUS.REQUESTED)}
        >
          <p className={styles.description}>
            요청이 접수됐어요. 잠시 후 새로고침해 결과를 확인해 주세요.
          </p>
        </Person>
        <Button variant="secondary" size="md" onClick={matching.refresh}>
          상태 새로고침
        </Button>
      </article>
    )
  }

  if (result?.status === SOCIAL_WORKER_MATCHING_STATUS.ACTIVE) {
    return (
      <article className={cardStyles.card}>
        <Person
          title="사회복지사가 배정되었어요"
          badge={getSocialWorkerBadge(SOCIAL_WORKER_MATCHING_STATUS.ACTIVE)}
        />
        {result.assignedAt && (
          <p className={styles.field}>
            <span className={styles.fieldLabel}>배정일</span>
            <span className={styles.fieldValue}>{formatInstantDate(result.assignedAt)}</span>
          </p>
        )}
      </article>
    )
  }

  const copy = getRequestCopy(phase, result?.status)

  return (
    <article className={cardStyles.card}>
      <Person title={copy.title} badge={copy.badge}>
        <p className={styles.description}>{copy.description}</p>
      </Person>
      <Button variant="soft" size="md" onClick={matching.request} loading={matching.requesting}>
        {copy.action}
      </Button>
      {matching.requestError && (
        <p className={cardStyles.formError} role="alert">
          {matching.requestError}
        </p>
      )}
    </article>
  )
}

/** 아이콘 + 제목(+ 배지) + 설명 */
function Person({ title, badge, children }) {
  return (
    <div className={styles.person}>
      <span className={styles.avatar} aria-hidden="true">
        <MatchingIcon className={styles.avatarIcon} />
      </span>
      <div className={styles.personBody}>
        <h3 className={cardStyles.cardTitle}>{title}</h3>
        {badge && <Badge variant={badge.variant}>{badge.label}</Badge>}
        {children}
      </div>
    </div>
  )
}

export default SocialWorkerCard
