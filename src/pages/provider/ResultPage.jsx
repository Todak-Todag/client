import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getErrorMessage } from '../../api/client'
import { completeSchedule, registerResult } from '../../api/endpoints/schedule'
import ResultForm from '../../features/provider/ResultForm'
import { useProviderSchedule } from '../../features/provider/useProviderSchedules'
import SubPageLayout from '../../layouts/SubPageLayout'
import { SCHEDULE_STATUS } from '../../constants/status'
import { PROVIDER_PATHS } from '../../constants/paths'
import styles from './FormPage.module.css'

/** 서비스 수행 결과 등록 */
function ResultPage() {
  const navigate = useNavigate()
  const { serviceScheduleId } = useParams()
  const schedule = useProviderSchedule(serviceScheduleId)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const submit = async ({ status, startedAt, finishedAt, note }) => {
    setSubmitting(true)
    setError(null)

    try {
      const confirmed =
        schedule.data.status === SCHEDULE_STATUS.COMPLETED ||
        schedule.data.status === SCHEDULE_STATUS.NO_SHOW

      // 수행 여부가 아직 확정되지 않은 일정만 상태를 바꾼다
      if (!confirmed) {
        await completeSchedule(serviceScheduleId, status)
      }

      await registerResult(serviceScheduleId, {
        startedAt: `${schedule.data.date}T${startedAt}:00`,
        finishedAt: `${schedule.data.date}T${finishedAt}:00`,
        note,
      })

      navigate(PROVIDER_PATHS.home, { replace: true })
    } catch (caught) {
      setError(getErrorMessage(caught))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <SubPageLayout title="서비스 수행 결과 등록">
      {schedule.status === 'loading' && (
        <p className={styles.state} role="status">
          일정을 불러오는 중이에요
        </p>
      )}

      {schedule.status === 'error' && (
        <p className={styles.error} role="alert">
          {getErrorMessage(schedule.error)}
        </p>
      )}

      {schedule.status === 'success' && (
        <ResultForm schedule={schedule.data} submitting={submitting} onSubmit={submit} />
      )}

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </SubPageLayout>
  )
}

export default ResultPage
