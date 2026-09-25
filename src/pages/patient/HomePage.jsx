import { Navigate, useNavigate } from 'react-router-dom'
import { getErrorMessage } from '../../api/client'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/common/EmptyState'
import { AlertIcon, CalendarIcon, PlusIcon } from '../../components/ui/Icons'
import ProfileCard, { ProfileCardSkeleton } from '../../features/auth/ProfileCard'
import ScheduleCard, { ScheduleCardSkeleton } from '../../features/schedule/ScheduleCard'
import { ROLE_LABEL } from '../../constants/roles'
import { useAuth } from '../../features/auth/useAuth'
import { useCurrentCarePlan } from '../../features/care-plan/useCarePlan'
import { useNow } from '../../hooks/useNow'
import { useTodaySchedules } from '../../features/schedule/useSchedules'
import { PATHS } from '../../constants/paths'
import { formatTimeRange } from '../../utils/date'
import { CARE_PLAN_STATUS } from '../../constants/status'
import { getCarePlanMessage } from '../../features/care-plan/carePlanStatus'
import { getScheduleBadge } from '../../features/schedule/scheduleStatus'
import styles from './HomePage.module.css'

const ADD_SERVICE_HINT_ID = 'add-service-hint'

/** 퇴원 예정자 메인 화면 */
function HomePage() {
  const navigate = useNavigate()
  const me = useAuth()
  const carePlan = useCurrentCarePlan()
  const schedules = useTodaySchedules()
  const now = useNow()

  // 인증 상태는 /users/me 결과로 먼저 판단한다.
  // 약관 동의 전 퇴원 예정자(임시 토큰)는 /users/me가 404 USER_NOT_FOUND, 다른 서비스는 본문 없는 401을 준다.
  // 다른 API의 401을 먼저 보고 로그인으로 보내면 동의 전 사용자가 로그인 ↔ 홈을 반복하게 된다.
  const isStatus = (result, status) =>
    result.status === 'error' && result.error?.status === status

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
  if (me.status === 'success' && (isStatus(carePlan, 401) || isStatus(schedules, 401))) {
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

  const renderProfile = () => {
    if (me.status === 'loading') return <ProfileCardSkeleton />

    if (me.status === 'error') {
      return (
        <EmptyState
          tone="error"
          icon={AlertIcon}
          title="내 정보를 불러오지 못했어요"
          description={getErrorMessage(me.error)}
          action={
            <Button variant="outline" size="md" block={false} onClick={me.reload}>
              다시 시도
            </Button>
          }
        />
      )
    }

    // 안내 문구는 Care Plan을 불러온 뒤에만 보여준다 (실패해도 이름은 표시)
    const message =
      carePlan.status === 'success' ? getCarePlanMessage(carePlan.data?.status) : null

    return <ProfileCard name={me.data.name} message={message} />
  }

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
          description="다른 날의 일정은 일정 탭에서 볼 수 있어요."
          action={
            <Button
              variant="outline"
              size="md"
              block={false}
              onClick={() => navigate(PATHS.schedule)}
            >
              일정 보기
            </Button>
          }
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
            />
          </li>
        ))}
      </ul>
    )
  }

  // 서버 규칙: 서비스 추가는 Care Plan이 UNDER_REVIEW일 때만 가능
  const canAddService =
    carePlan.status === 'success' && carePlan.data?.status === CARE_PLAN_STATUS.UNDER_REVIEW

  const getAddServiceHint = () => {
    if (carePlan.status === 'loading' || canAddService) return null
    if (carePlan.status === 'error') return '케어 플랜 정보를 불러오지 못했어요.'
    if (!carePlan.data) return '케어 플랜이 만들어지면 서비스를 신청할 수 있어요.'
    return '케어 플랜 검토 중에만 서비스를 추가할 수 있어요.'
  }
  const addServiceHint = getAddServiceHint()

  return (
    <div className={styles.page}>
      <h1 className={styles.srOnly}>홈</h1>

      {renderProfile()}

      <section
        className={styles.section}
        aria-labelledby="today-services-title"
        aria-busy={schedules.status === 'loading'}
      >
        <h2 id="today-services-title" className={styles.sectionTitle}>
          오늘 받을 케어 서비스
        </h2>
        {renderSchedules()}
      </section>

      <div className={styles.addService}>
        <Button
          variant="dashed"
          disabled={!canAddService}
          aria-describedby={addServiceHint ? ADD_SERVICE_HINT_ID : undefined}
          // TODO: 서비스 추가 신청 화면이 생기면 해당 경로로 교체 (현재 임시로 매칭 화면)
          onClick={() => navigate(PATHS.matching)}
        >
          <PlusIcon className={styles.plusIcon} />
          서비스 추가 신청하기
        </Button>

        {addServiceHint && (
          <div className={styles.hintRow}>
            <p id={ADD_SERVICE_HINT_ID} className={styles.hint}>
              {addServiceHint}
            </p>
            {carePlan.status === 'error' && (
              <Button variant="ghost" size="sm" block={false} onClick={carePlan.reload}>
                다시 시도
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default HomePage
