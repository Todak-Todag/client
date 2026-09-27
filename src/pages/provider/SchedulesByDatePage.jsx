import { useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { getErrorMessage } from '../../api/client'
import { completeSchedule } from '../../api/endpoints/schedule'
import EmptyState from '../../components/common/EmptyState'
import Button from '../../components/ui/Button'
import MonthCalendar from '../../components/ui/MonthCalendar'
import { AlertIcon, CalendarIcon } from '../../components/ui/Icons'
import ProviderScheduleCard from '../../features/provider/ProviderScheduleCard'
import { getProviderScheduleView } from '../../features/provider/providerScheduleStatus'
import {
  useProviderMonthlyMarkers,
  useProviderSchedulesByDate,
} from '../../features/provider/useProviderSchedules'
import { useNow } from '../../hooks/useNow'
import { PATHS, PROVIDER_PATHS, toPath } from '../../constants/paths'
import { formatDateLabel, toLocalDateString } from '../../utils/date'
import styles from './SchedulesByDatePage.module.css'

// 배지 라벨로 거르는 필터. 서버 파라미터가 아니라 화면에서 나눈다
const FILTERS = [
  { key: 'ALL', label: '전체' },
  { key: 'UPCOMING', label: '예정', labels: ['예정', '진행 중', '수행 완료 필요'] },
  { key: 'RESULT_DONE', label: '결과 작성 완료', labels: ['결과 작성 완료', '미수행'] },
  { key: 'RESULT_TODO', label: '결과 작성 필요', labels: ['결과 작성 필요'] },
]

// 달력에서 고를 수 있는 범위 — 지난 일정 확인과 앞으로의 배정까지 1년씩
const YEAR = 365

function shiftDate(days) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return toLocalDateString(date)
}

/** 서비스 제공자 일정 조회 — 월 달력에서 날짜를 골라 그날 일정을 본다 */
function SchedulesByDatePage() {
  const navigate = useNavigate()
  const now = useNow()
  const today = toLocalDateString(now)

  const [selectedDate, setSelectedDate] = useState(today)
  const [yearMonth, setYearMonth] = useState(today.slice(0, 7))
  const [filter, setFilter] = useState('ALL')
  const [completingId, setCompletingId] = useState(null)

  const schedules = useProviderSchedulesByDate(selectedDate)
  const markers = useProviderMonthlyMarkers(yearMonth)

  const range = useMemo(() => ({ min: shiftDate(-YEAR), max: shiftDate(YEAR) }), [])

  // 재발급까지 실패한 세션 만료
  if (schedules.status === 'error' && schedules.error?.status === 401) {
    return <Navigate to={PATHS.login} replace />
  }

  const visible = (schedules.data ?? []).filter((schedule) => {
    if (filter === 'ALL') return true

    const { label } = getProviderScheduleView(schedule, Boolean(schedule.result), now)
    return FILTERS.find((item) => item.key === filter)?.labels.includes(label)
  })

  const complete = async (schedule) => {
    setCompletingId(schedule.serviceScheduleId)

    try {
      await completeSchedule(schedule.serviceScheduleId, 'COMPLETED')
      schedules.reload()
      markers.reload()
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

    if (visible.length === 0) {
      return (
        <EmptyState
          icon={CalendarIcon}
          title={filter === 'ALL' ? '이 날은 예정된 방문이 없어요' : '해당하는 일정이 없어요'}
          description={filter === 'ALL' ? '다른 날짜를 눌러 확인해 보세요.' : undefined}
        />
      )
    }

    return (
      <div className={styles.list}>
        {visible.map((schedule) => (
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
      <MonthCalendar
        value={selectedDate}
        min={range.min}
        max={range.max}
        label="일정을 확인할 날짜"
        markers={markers.status === 'success' ? markers.data : undefined}
        onChange={setSelectedDate}
        onMonthChange={({ year, month }) =>
          setYearMonth(`${year}-${String(month).padStart(2, '0')}`)
        }
      />

      <h2 className={styles.heading}>{formatDateLabel(selectedDate)}</h2>

      <div className={styles.filters} role="tablist" aria-label="일정 상태 필터">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={filter === key}
            className={[styles.filter, filter === key ? styles.filterOn : '']
              .filter(Boolean)
              .join(' ')}
            onClick={(event) => {
              setFilter(key)
              // 고른 칩이 잘려 보이지 않도록 가로 목록 가운데로 끌어온다
              event.currentTarget.scrollIntoView({
                inline: 'center',
                block: 'nearest',
                behavior: 'smooth',
              })
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {renderSchedules()}
    </section>
  )
}

export default SchedulesByDatePage
