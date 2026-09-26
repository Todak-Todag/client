import { Navigate, useSearchParams } from 'react-router-dom'
import { getErrorMessage } from '../../api/client'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/common/EmptyState'
import { AlertIcon, CalendarIcon } from '../../components/ui/Icons'
import CareEndNotice from '../../features/care-plan/CareEndNotice'
import ScheduleCard, { ScheduleCardSkeleton } from '../../features/schedule/ScheduleCard'
import WeekStrip from '../../features/schedule/WeekStrip'
import { useCurrentCarePlan } from '../../features/care-plan/useCarePlan'
import { useNow } from '../../hooks/useNow'
import { useSchedulesByDate } from '../../features/schedule/useSchedules'
import { PATHS } from '../../constants/paths'
import {
  formatDateLabel,
  formatTimeRange,
  isDateString,
  toLocalDateString,
} from '../../utils/date'
import { getUpcomingFinishDate } from '../../features/care-plan/carePlanStatus'
import { getScheduleBadge } from '../../features/schedule/scheduleStatus'
import styles from './SchedulePage.module.css'

/** 퇴원 예정자 일정 상세 화면 (선택한 날짜의 서비스 일정) */
function SchedulePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const now = useNow()
  const today = toLocalDateString(now)

  // 새로고침해도 보던 날짜가 유지되도록 ?date=YYYY-MM-DD로 관리한다. 없거나 잘못되면 오늘
  const dateParam = searchParams.get('date')
  const selectedDate = isDateString(dateParam) ? dateParam : today

  const schedules = useSchedulesByDate(selectedDate)
  const carePlan = useCurrentCarePlan()

  // 날짜를 바꿀 때마다 방문 기록이 쌓이지 않도록 replace (뒤로 가기는 이전 화면으로)
  const selectDate = (date) => {
    setSearchParams(date === today ? {} : { date }, { replace: true })
  }

  // 재발급까지 실패한 세션 만료
  if (schedules.status === 'error' && schedules.error?.status === 401) {
    return <Navigate to={PATHS.login} replace />
  }

  // 케어 종료 안내는 보조 정보라 불러오지 못하면 띠를 숨기기만 한다
  const finishDate =
    carePlan.status === 'success' ? getUpcomingFinishDate(carePlan.data, today) : null

  const renderSchedules = () => {
    if (schedules.status === 'loading') {
      return (
        <div className={styles.list}>
          <p className={styles.srOnly} role="status">
            일정을 불러오는 중이에요
          </p>
          <ScheduleCardSkeleton description />
          <ScheduleCardSkeleton description />
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
      const isToday = selectedDate === today
      return (
        <EmptyState
          icon={CalendarIcon}
          title={isToday ? '오늘 예정된 서비스가 없어요' : '이 날은 예정된 서비스가 없어요'}
          description="다른 날짜를 눌러 일정을 확인해 보세요."
          action={
            isToday ? null : (
              <Button
                variant="outline"
                size="md"
                block={false}
                onClick={() => selectDate(today)}
              >
                오늘 일정 보기
              </Button>
            )
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
              description={schedule.serviceContent}
              time={formatTimeRange(schedule.startedAt, schedule.finishedAt)}
              badge={getScheduleBadge(schedule, now)}
            />
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.top}>
        {finishDate && <CareEndNotice finishDate={finishDate} today={today} />}
        <WeekStrip selectedDate={selectedDate} today={today} onSelect={selectDate} />
      </div>

      <section
        aria-labelledby="schedule-date-title"
        aria-busy={schedules.status === 'loading'}
      >
        <h2 id="schedule-date-title" className={styles.srOnly}>
          {formatDateLabel(selectedDate)} 일정
        </h2>
        {renderSchedules()}
      </section>
    </div>
  )
}

export default SchedulePage
