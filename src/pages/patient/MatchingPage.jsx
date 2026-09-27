import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { getErrorMessage } from '../../api/client'
import { retryMatchingAttempt } from '../../api/endpoints/schedule'
import EmptyState from '../../components/common/EmptyState'
import Button from '../../components/ui/Button'
import { AlertIcon, CalendarIcon, DocumentIcon, MatchingIcon } from '../../components/ui/Icons'
import { useCurrentCarePlan } from '../../features/care-plan/useCarePlan'
import FailedAttemptCard from '../../features/matching/FailedAttemptCard'
import MatchedAttemptList from '../../features/matching/MatchedAttemptList'
import RetryMatchingSheet from '../../features/matching/RetryMatchingSheet'
import SocialWorkerCard from '../../features/matching/SocialWorkerCard'
import { isSocialWorkerInProgress } from '../../features/matching/matchingStatus'
import { MATCHING_ERROR, getMatchingErrorMessage, isMatchingError } from '../../features/matching/matchingErrors'
import { readRequestedRetries, saveRequestedRetry } from '../../features/matching/matchingStorage'
import { useMatchingAttempts } from '../../features/matching/useMatchingAttempts'
import { useSocialWorkerMatching } from '../../features/matching/useSocialWorkerMatching'
import { ScheduleCardSkeleton } from '../../features/schedule/ScheduleCard'
import { PATHS, toPath } from '../../constants/paths'
import { CARE_PLAN_STATUS } from '../../constants/status'
import { addDays, toLocalDateString } from '../../utils/date'
import styles from './MatchingPage.module.css'

/**
 * 퇴원 예정자 매칭 현황.
 * - 서비스 매칭: Care Plan이 CONFIRMED일 때만 서버가 기록을 준다 (그 외 상태는 안내만)
 * - 사회복지사 매칭: Care Plan과 무관하게 언제든 요청할 수 있다
 */
function MatchingPage() {
  const carePlan = useCurrentCarePlan()
  const socialWorker = useSocialWorkerMatching()

  // 재발급까지 실패한 세션 만료
  if (carePlan.status === 'error' && carePlan.error?.status === 401) {
    return <Navigate to={PATHS.login} replace />
  }

  const plan = carePlan.status === 'success' ? carePlan.data : null
  const confirmed = plan?.status === CARE_PLAN_STATUS.CONFIRMED

  // 결과를 기다리는 중·연결된 사회복지사는 매칭 완료보다 먼저, 요청 전이면 맨 아래에 둔다
  const socialWorkerSection = (
    <Section id="social-worker-title" title="사회복지사">
      <SocialWorkerCard matching={socialWorker} />
    </Section>
  )
  const socialWorkerFirst = isSocialWorkerInProgress(socialWorker)

  return (
    <div className={styles.page}>
      {confirmed ? (
        <ServiceMatching
          carePlan={plan}
          socialWorkerSection={socialWorkerFirst ? socialWorkerSection : null}
        />
      ) : (
        <>
          <CarePlanNotice carePlan={carePlan} />
          {socialWorkerFirst && socialWorkerSection}
        </>
      )}

      {!socialWorkerFirst && socialWorkerSection}
    </div>
  )
}

function Section({ id, title, count, children }) {
  return (
    <section className={styles.section} aria-labelledby={id}>
      <div className={styles.sectionHead}>
        <h2 id={id} className={styles.sectionTitle}>
          {title}
        </h2>
        {count != null && <p className={styles.sectionCount}>{count}건</p>}
      </div>
      {children}
    </section>
  )
}

/** Care Plan이 CONFIRMED가 아닐 때: 서비스 매칭 기록 대신 상태별 안내 */
function CarePlanNotice({ carePlan }) {
  const navigate = useNavigate()

  if (carePlan.status === 'loading') {
    return (
      <div className={styles.list} aria-busy="true">
        <p className={styles.srOnly} role="status">
          매칭 현황을 불러오는 중이에요
        </p>
        <ScheduleCardSkeleton />
        <ScheduleCardSkeleton />
      </div>
    )
  }

  if (carePlan.status === 'error') {
    return <LoadError error={carePlan.error} onRetry={carePlan.reload} />
  }

  const plan = carePlan.data

  if (!plan) {
    return (
      <EmptyState
        icon={DocumentIcon}
        title="아직 준비된 케어플랜이 없어요"
        description="병원 담당자가 케어플랜을 등록하면 확정 후 매칭이 시작돼요."
      />
    )
  }

  if (plan.status === CARE_PLAN_STATUS.UNDER_REVIEW) {
    return (
      <EmptyState
        icon={MatchingIcon}
        title="케어플랜을 확정하면 매칭이 시작돼요"
        description="케어플랜을 확인하고 확정해 주세요."
        action={
          <Button
            size="md"
            block={false}
            onClick={() => navigate(toPath(PATHS.carePlan, { carePlanId: plan.carePlanId }))}
          >
            케어플랜 확인하기
          </Button>
        }
      />
    )
  }

  // IN_PROGRESS는 서버가 매칭 기록을 빈 목록으로 준다. 확정된 일정은 일정 화면에서 본다
  if (plan.status === CARE_PLAN_STATUS.IN_PROGRESS) {
    return (
      <EmptyState
        icon={CalendarIcon}
        title="케어가 진행 중이에요"
        description="매칭된 서비스 일정은 일정 화면에서 확인할 수 있어요."
        action={
          <Button variant="outline" size="md" block={false} onClick={() => navigate(PATHS.schedule)}>
            일정 보기
          </Button>
        }
      />
    )
  }

  return (
    <EmptyState
      icon={DocumentIcon}
      title="케어가 종료됐어요"
      description="서비스 매칭 현황은 케어가 확정된 동안에만 볼 수 있어요."
    />
  )
}

/**
 * 오늘 이후(내일부터) · 케어 시작일 이후 · 케어 종료일까지.
 * 서버는 케어 기간만 확인하고 지난 날짜는 막지 않지만, 지난 날짜로는 서비스를 받을 수 없어 화면에서 막는다
 */
function getRetryRange(carePlan) {
  const tomorrow = addDays(toLocalDateString(), 1)
  const min = carePlan.startDate && carePlan.startDate > tomorrow ? carePlan.startDate : tomorrow
  return { min, max: carePlan.finishDate }
}

/** CONFIRMED: 다시 요청이 필요한 실패 건 → (진행 중인 사회복지사) → 매칭 완료 */
function ServiceMatching({ carePlan, socialWorkerSection }) {
  const attempts = useMatchingAttempts()
  const [requested, setRequested] = useState(readRequestedRetries)
  const [retrying, setRetrying] = useState(null) // 다시 요청 시트를 연 실패 기록

  if (attempts.status === 'error' && attempts.error?.status === 401) {
    return <Navigate to={PATHS.login} replace />
  }

  const submitRetry = async (value) => {
    const { matchingAttemptId } = retrying
    let requestedSchedule = null
    try {
      const accepted = await retryMatchingAttempt(matchingAttemptId, value)
      requestedSchedule = { date: accepted.date, preferredTimeSlot: accepted.preferredTimeSlot }
    } catch (caught) {
      // 다른 탭·기기에서 이미 요청했으면 결과를 기다리는 상태로 맞춘다 (그때 고른 일정은 알 수 없음)
      if (!isMatchingError(caught, MATCHING_ERROR.RETRY_ALREADY_REQUESTED)) throw caught
    }
    setRequested(new Map(saveRequestedRetry(matchingAttemptId, requestedSchedule)))
    setRetrying(null)
  }

  if (attempts.status === 'loading') {
    return (
      <>
        <div className={styles.list} aria-busy="true">
          <p className={styles.srOnly} role="status">
            매칭 현황을 불러오는 중이에요
          </p>
          <ScheduleCardSkeleton description />
          <ScheduleCardSkeleton />
        </div>
        {socialWorkerSection}
      </>
    )
  }

  if (attempts.status === 'error') {
    return (
      <>
        <LoadError
          error={attempts.error}
          message={getMatchingErrorMessage(attempts.error)}
          onRetry={attempts.reload}
        />
        {socialWorkerSection}
      </>
    )
  }

  const { failed, matched } = attempts.data

  return (
    <>
      <p className={styles.lead}>케어플랜 확정 후 희망 일정별 서비스 제공자 매칭 결과를 보여드려요.</p>

      {failed.length > 0 && (
        <Section id="failed-title" title="다시 요청이 필요해요" count={failed.length}>
          <ul className={styles.list}>
            {failed.map((attempt) => (
              <li key={attempt.matchingAttemptId}>
                <FailedAttemptCard
                  attempt={attempt}
                  requested={requested.has(attempt.matchingAttemptId)}
                  requestedSchedule={requested.get(attempt.matchingAttemptId)}
                  onRetry={() => setRetrying(attempt)}
                  onRefresh={attempts.reload}
                />
              </li>
            ))}
          </ul>
        </Section>
      )}

      {socialWorkerSection}

      <Section id="matched-title" title="매칭 완료" count={matched.length}>
        {matched.length > 0 ? (
          <MatchedAttemptList attempts={matched} />
        ) : (
          <EmptyState
            icon={CalendarIcon}
            title={failed.length > 0 ? '아직 매칭된 일정이 없어요' : '매칭 결과를 기다리고 있어요'}
            description={
              failed.length > 0
                ? '다시 요청한 일정이 매칭되면 이곳에 표시돼요.'
                : '희망 일정별로 서비스 제공자를 찾고 있어요. 잠시 후 다시 확인해 주세요.'
            }
            action={
              <Button variant="outline" size="md" block={false} onClick={attempts.reload}>
                새로고침
              </Button>
            }
          />
        )}
      </Section>

      {retrying && (
        <RetryMatchingSheet
          key={retrying.matchingAttemptId}
          attempt={retrying}
          {...getRetryRange(carePlan)}
          onSubmit={submitRetry}
          onClose={() => setRetrying(null)}
        />
      )}
    </>
  )
}

/** 네트워크·서버 오류 공통 안내 */
function LoadError({ error, message, onRetry }) {
  return (
    <EmptyState
      tone="error"
      icon={AlertIcon}
      title="매칭 현황을 불러오지 못했어요"
      description={message ?? getErrorMessage(error)}
      action={
        <Button variant="outline" size="md" block={false} onClick={onRetry}>
          다시 시도
        </Button>
      }
    />
  )
}

export default MatchingPage
