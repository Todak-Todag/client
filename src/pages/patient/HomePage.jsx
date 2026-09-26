import { Navigate, useNavigate } from 'react-router-dom'
import { getErrorMessage } from '../../api/client'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/common/EmptyState'
import { AlertIcon, CalendarIcon, DocumentIcon } from '../../components/ui/Icons'
import ProfileCard, { ProfileCardSkeleton } from '../../features/auth/ProfileCard'
import ScheduleCard, { ScheduleCardSkeleton } from '../../features/schedule/ScheduleCard'
import CarePlanReviewCard from '../../features/care-plan/CarePlanReviewCard'
import CareCompletedCard from '../../features/care-plan/CareCompletedCard'
import MatchingFailedBanner from '../../features/schedule/MatchingFailedBanner'
import { ROLE_LABEL } from '../../constants/roles'
import { useAuth } from '../../features/auth/useAuth'
import {
  useCarePlanServiceCount,
  useCurrentCarePlan,
} from '../../features/care-plan/useCarePlan'
import { useMatchingFailureCount } from '../../features/schedule/useMatchingFailures'
import { useNow } from '../../hooks/useNow'
import { useSchedulesByDate } from '../../features/schedule/useSchedules'
import { PATHS } from '../../constants/paths'
import { formatDateRange, formatMonthDay, formatTimeRange, toLocalDateString } from '../../utils/date'
import { CARE_PLAN_STATUS } from '../../constants/status'
import { getCarePlanBadge, getUpcomingFinishDate } from '../../features/care-plan/carePlanStatus'
import { getScheduleBadge } from '../../features/schedule/scheduleStatus'
import styles from './HomePage.module.css'

const isStatus = (result, status) => result.status === 'error' && result.error?.status === status

const isActiveCare = (carePlan) =>
  carePlan?.status === CARE_PLAN_STATUS.CONFIRMED ||
  carePlan?.status === CARE_PLAN_STATUS.IN_PROGRESS

/** 퇴원 예정자 메인 화면. Care Plan 상태(검토 중 · 진행 중 · 종료 · 없음)에 따라 본문이 바뀐다 */
function HomePage() {
  const navigate = useNavigate()
  const me = useAuth()
  const carePlan = useCurrentCarePlan()
  const now = useNow()
  const today = toLocalDateString(now)

  // 인증 상태는 /users/me 결과로 먼저 판단한다.
  // 약관 동의 전 퇴원 예정자(임시 토큰)는 /users/me가 404 USER_NOT_FOUND, 다른 서비스는 본문 없는 401을 준다.
  // 다른 API의 401을 먼저 보고 로그인으로 보내면 동의 전 사용자가 로그인 ↔ 홈을 반복하게 된다.
  if (isStatus(me, 401)) return <Navigate to={PATHS.login} replace />

  if (isStatus(me, 404) && me.error.code === 'USER_NOT_FOUND') {
    return (
      <EmptyState
        icon={AlertIcon}
        title="약관 동의가 필요해요"
        description="필수 약관에 동의한 뒤 다시 로그인해 주세요."
        action={
          <Button
            variant="outline"
            size="md"
            block={false}
            onClick={() => navigate(PATHS.login, { replace: true })}
          >
            로그인 화면으로
          </Button>
        }
      />
    )
  }

  // 내 정보는 정상인데 다른 API가 401이면 (재발급까지 실패한) 세션 만료로 본다
  if (me.status === 'success' && isStatus(carePlan, 401)) {
    return <Navigate to={PATHS.login} replace />
  }

  if (me.status === 'success' && me.data.role !== ROLE_LABEL.PATIENT) {
    return (
      <EmptyState
        icon={AlertIcon}
        title="퇴원 예정자 전용 화면이에요"
        description="다른 역할의 홈 화면은 준비 중이에요."
      />
    )
  }

  if (me.status === 'error') {
    // 같은 장애로 Care Plan도 실패했거나 그 사이 받은 결과가 오래됐을 수 있어 함께 다시 조회한다
    const retryAll = () => {
      me.reload()
      carePlan.reload()
    }

    return (
      <div className={styles.page}>
        <h1 className={styles.srOnly}>홈</h1>
        <LoadError error={me.error} onRetry={retryAll} />
      </div>
    )
  }

  // 배지·본문이 Care Plan에 따라 정해지므로 둘 다 받을 때까지 화면 전체를 자리표시로 둔다
  if (me.status === 'loading' || carePlan.status === 'loading') {
    return (
      <div className={styles.page} aria-busy="true">
        <h1 className={styles.srOnly}>홈</h1>
        <ProfileCardSkeleton />
        <div className={styles.list}>
          <ScheduleCardSkeleton />
          <ScheduleCardSkeleton />
        </div>
        <p className={styles.loadingText} role="status">
          정보를 불러오는 중이에요…
        </p>
      </div>
    )
  }

  // Care Plan을 못 불러와도 이름은 보여준다
  const plan = carePlan.status === 'success' ? carePlan.data : null
  const finishDate = isActiveCare(plan) ? getUpcomingFinishDate(plan, today) : null

  const renderBody = () => {
    if (carePlan.status === 'error') {
      return <LoadError error={carePlan.error} onRetry={carePlan.reload} />
    }

    if (!plan) {
      return (
        <EmptyState
          icon={DocumentIcon}
          title="아직 준비된 케어플랜이 없어요"
          description="병원 담당자가 케어플랜을 등록하면 이곳에서 확인할 수 있어요."
        />
      )
    }

    if (plan.status === CARE_PLAN_STATUS.UNDER_REVIEW) {
      return (
        <ReviewSection
          carePlan={plan}
          // TODO: 케어플랜 확인(03) 화면이 생기면 해당 경로로 교체 (현재 임시로 매칭 화면)
          onConfirm={() => navigate(PATHS.matching)}
          // TODO: 서비스 추가 신청 화면이 생기면 해당 경로로 교체 (현재 임시로 매칭 화면)
          onAddService={() => navigate(PATHS.matching)}
        />
      )
    }

    if (plan.status === CARE_PLAN_STATUS.COMPLETED) {
      return (
        <CareCompletedCard
          period={formatDateRange(plan.startDate, plan.finishDate, { weekday: false })}
          // TODO: 서비스 수행 결과 화면이 생기면 해당 경로로 교체 (현재 임시로 일정 화면)
          onViewResults={() => navigate(PATHS.schedule)}
        />
      )
    }

    return (
      <>
        {/* 서버가 CONFIRMED에서만 매칭 실패 내역을 주므로 그때만 조회한다 */}
        {plan.status === CARE_PLAN_STATUS.CONFIRMED && (
          <MatchingFailureNotice onClick={() => navigate(PATHS.matching)} />
        )}
        <TodayServices now={now} today={today} />
      </>
    )
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.srOnly}>홈</h1>

      <ProfileCard
        name={me.data.name}
        badge={getCarePlanBadge(plan?.status)}
        meta={finishDate ? `${formatMonthDay(finishDate)} 종료 예정` : null}
      />

      {renderBody()}
    </div>
  )
}

/** 네트워크·서버 오류 공통 안내 */
function LoadError({ error, onRetry }) {
  return (
    <EmptyState
      tone="error"
      icon={AlertIcon}
      title="정보를 불러오지 못했어요"
      description={getErrorMessage(error)}
      action={
        <Button variant="outline" size="md" block={false} onClick={onRetry}>
          다시 시도
        </Button>
      }
    />
  )
}

/** 검토 중: 케어플랜 도착 카드 (서비스 개수는 보조 정보라 실패하면 줄만 숨긴다) */
function ReviewSection({ carePlan, onConfirm, onAddService }) {
  const serviceCount = useCarePlanServiceCount(carePlan.carePlanId)

  return (
    <CarePlanReviewCard
      period={formatDateRange(carePlan.startDate, carePlan.finishDate)}
      serviceCount={serviceCount.status === 'success' ? serviceCount.data : null}
      onConfirm={onConfirm}
      onAddService={onAddService}
    />
  )
}

/** 매칭 실패 배너. 실패 내역이 있을 때만 보이고, 불러오지 못하면 조용히 숨긴다 */
function MatchingFailureNotice({ onClick }) {
  const failures = useMatchingFailureCount()

  if (failures.status !== 'success' || failures.data === 0) return null

  return <MatchingFailedBanner count={failures.data} onClick={onClick} />
}

/** 진행 중: 오늘 받을 케어 서비스 */
function TodayServices({ now, today }) {
  const navigate = useNavigate()
  // 날짜를 인자로 넘겨 자정이 지나면 새 날짜로 다시 조회한다 (섹션 날짜 표시와 목록이 어긋나지 않도록)
  const schedules = useSchedulesByDate(today)

  // 재발급까지 실패한 세션 만료
  if (isStatus(schedules, 401)) return <Navigate to={PATHS.login} replace />

  const renderSchedules = () => {
    if (schedules.status === 'loading') {
      return (
        <div className={styles.list}>
          <p className={styles.srOnly} role="status">
            오늘 일정을 불러오는 중이에요
          </p>
          <ScheduleCardSkeleton />
          <ScheduleCardSkeleton />
        </div>
      )
    }

    if (schedules.status === 'error') {
      return (
        <EmptyState
          tone="error"
          icon={AlertIcon}
          title="일정을 불러오지 못했어요"
          description={getErrorMessage(schedules.error)}
          action={
            <Button variant="outline" size="md" block={false} onClick={schedules.reload}>
              다시 시도
            </Button>
          }
        />
      )
    }

    if (schedules.data.length === 0) {
      return (
        <EmptyState
          icon={CalendarIcon}
          title="오늘 예정된 서비스가 없어요"
          description="다른 날의 일정은 전체 일정에서 볼 수 있어요."
        />
      )
    }

    return (
      <ul className={styles.list}>
        {schedules.data.map((schedule) => (
          <li key={schedule.serviceScheduleId}>
            <ScheduleCard
              title={schedule.serviceName ?? '케어 서비스'}
              time={formatTimeRange(schedule.startedAt, schedule.finishedAt)}
              badge={getScheduleBadge(schedule, now)}
              onDetail={() => navigate(PATHS.schedule)}
            />
          </li>
        ))}
      </ul>
    )
  }

  return (
    <section
      className={styles.section}
      aria-labelledby="today-services-title"
      aria-busy={schedules.status === 'loading'}
    >
      <div className={styles.sectionHead}>
        <h2 id="today-services-title" className={styles.sectionTitle}>
          오늘 받을 케어 서비스
        </h2>
        <p className={styles.sectionDate}>{formatMonthDay(today)}</p>
      </div>

      {renderSchedules()}

      <Button variant="secondary" size="md" onClick={() => navigate(PATHS.schedule)}>
        전체 일정 보기
      </Button>
    </section>
  )
}

export default HomePage
