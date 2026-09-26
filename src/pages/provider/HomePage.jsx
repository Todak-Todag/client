import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { getErrorMessage } from '../../api/client'
import { completeSchedule } from '../../api/endpoints/schedule'
import EmptyState from '../../components/common/EmptyState'
import Button from '../../components/ui/Button'
import { AlertIcon, CalendarIcon } from '../../components/ui/Icons'
import ProfileCard, { ProfileCardSkeleton } from '../../features/auth/ProfileCard'
import ProviderScheduleCard from '../../features/provider/ProviderScheduleCard'
import { useAuth } from '../../features/auth/useAuth'
import { useTodayProviderSchedules } from '../../features/provider/useProviderSchedules'
import { useNow } from '../../hooks/useNow'
import { PATHS, PROVIDER_PATHS, toPath } from '../../constants/paths'
import styles from './HomePage.module.css'

/** 서비스 제공자 메인 — 오늘 방문할 케어 일정 */
function HomePage() {
  const navigate = useNavigate()
  const now = useNow()
  const me = useAuth()
  const schedules = useTodayProviderSchedules()
  const [completingId, setCompletingId] = useState(null)

  // 재발급까지 실패한 세션 만료
  if (schedules.status === 'error' && schedules.error?.status === 401) {
    return <Navigate to={PATHS.login} replace />
  }

  /** 방문이 끝난 일정을 수행 완료로 확정한다 (결과 작성은 다음 단계) */
  const complete = async (schedule) => {
    setCompletingId(schedule.serviceScheduleId)

    try {
      await completeSchedule(schedule.serviceScheduleId, 'COMPLETED')
      schedules.reload()
    } catch (error) {
      window.alert(getErrorMessage(error))
    } finally {
      setCompletingId(null)
    }
  }

  const goResult = (schedule) =>
    navigate(toPath(PROVIDER_PATHS.result, { serviceScheduleId: schedule.serviceScheduleId }))

  const goResultDetail = (schedule) =>
    navigate(
      toPath(PROVIDER_PATHS.resultDetail, { serviceScheduleId: schedule.serviceScheduleId }),
    )

  const renderSchedules = () => {
    if (schedules.status === 'loading') {
      return (
        <p className={styles.state} role="status">
          일정을 불러오는 중이에요
        </p>
      )
    }

    if (schedules.status === 'error') {
      return (
        <EmptyState
          icon={AlertIcon}
          tone="error"
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
          title="오늘 예정된 방문이 없어요"
          description="다른 날짜는 일정 탭에서 확인할 수 있어요."
        />
      )
    }

    return (
      <div className={styles.list}>
        {schedules.data.map((schedule) => (
          <ProviderScheduleCard
            key={schedule.serviceScheduleId}
            schedule={schedule}
            now={now}
            completing={completingId === schedule.serviceScheduleId}
            onComplete={complete}
            onWriteResult={goResult}
            onViewResult={goResultDetail}
          />
        ))}
      </div>
    )
  }

  return (
    <section className={styles.page}>
      {me.status === 'success' ? (
        <ProfileCard
          name={me.data.name}
          message={`${[me.data.province, me.data.district].filter(Boolean).join(' ')} 소속 서비스 제공자`}
        />
      ) : (
        <ProfileCardSkeleton />
      )}

      <h2 className={styles.heading}>오늘 방문 케어 대상자</h2>
      {renderSchedules()}
    </section>
  )
}

export default HomePage
