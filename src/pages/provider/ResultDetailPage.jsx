import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getErrorMessage } from '../../api/client'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import EmptyState from '../../components/common/EmptyState'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { AlertIcon, CalendarIcon, ClockIcon } from '../../components/ui/Icons'
import { useProviderSchedule } from '../../features/provider/useProviderSchedules'
import SubPageLayout from '../../layouts/SubPageLayout'
import { PROVIDER_PATHS } from '../../constants/paths'
import { SCHEDULE_STATUS } from '../../constants/status'
import { formatDateLabel, formatTimeRange, parseLocalDateTime } from '../../utils/date'
import styles from './ResultDetailPage.module.css'

/** 두 시각의 차이를 '1시간 20분' 형태로 바꾼다 */
function formatDuration(startedAt, finishedAt) {
  const minutes = Math.round(
    (parseLocalDateTime(finishedAt) - parseLocalDateTime(startedAt)) / 60000,
  )

  if (minutes < 60) return `${minutes}분`

  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60

  return rest === 0 ? `${hours}시간` : `${hours}시간 ${rest}분`
}

/** 수행 결과 상세 */
function ResultDetailPage() {
  const navigate = useNavigate()
  const { serviceScheduleId } = useParams()
  const schedule = useProviderSchedule(serviceScheduleId)

  // 'confirm' 삭제 확인 → 'done' 삭제 완료 안내
  const [dialog, setDialog] = useState(null)

  // 서버에 수행 결과 삭제 API가 없어 화면 흐름만 만들어 둔다.
  // DELETE /service-results/{id} 가 추가되면 여기서 호출하고 목록을 새로고침한다.
  const deleteResult = () => setDialog('done')

  if (schedule.status === 'loading') {
    return (
      <SubPageLayout title="수행 결과 상세">
        <p className={styles.state} role="status">
          결과를 불러오는 중이에요
        </p>
      </SubPageLayout>
    )
  }

  if (schedule.status === 'error') {
    return (
      <SubPageLayout title="수행 결과 상세">
        <EmptyState
          icon={AlertIcon}
          tone="error"
          title="결과를 불러오지 못했어요"
          description={getErrorMessage(schedule.error)}
        />
      </SubPageLayout>
    )
  }

  const { data } = schedule
  const noShow = data.status === SCHEDULE_STATUS.NO_SHOW
  const { result } = data

  return (
    <SubPageLayout title="수행 결과 상세">
      <div className={styles.page}>
        <section className={styles.card}>
          <div className={styles.head}>
            <h2 className={styles.service}>{data.serviceName ?? '서비스 일정'}</h2>
            <Badge variant={noShow ? 'neutral' : 'success'}>
              {noShow ? '미수행' : '수행 완료'}
            </Badge>
          </div>

          <p className={styles.date}>
            <CalendarIcon className={styles.icon} />
            {formatDateLabel(data.date)}
          </p>

          <dl className={styles.rows}>
            <div className={styles.row}>
              <dt className={styles.label}>예정 시간</dt>
              <dd className={styles.value}>{formatTimeRange(data.startedAt, data.finishedAt)}</dd>
            </div>

            {result && (
              <>
                <div className={styles.row}>
                  <dt className={styles.label}>
                    <ClockIcon className={styles.icon} />
                    실제 수행 시간
                  </dt>
                  <dd className={styles.value}>
                    {formatTimeRange(result.startedAt, result.finishedAt)}
                  </dd>
                </div>

                <div className={styles.row}>
                  <dt className={styles.label}>소요 시간</dt>
                  <dd className={styles.value}>
                    {formatDuration(result.startedAt, result.finishedAt)}
                  </dd>
                </div>
              </>
            )}
          </dl>
        </section>

        <section className={styles.card}>
          <h3 className={styles.noteTitle}>수행 특이사항</h3>
          <p className={result?.note ? styles.note : styles.noteEmpty}>
            {result?.note || '작성된 메모가 없어요.'}
          </p>
        </section>

        {result && (
          <Button variant="ghost" className={styles.delete} onClick={() => setDialog('confirm')}>
            수행 결과 삭제하기
          </Button>
        )}
      </div>

      <ConfirmDialog
        open={dialog === 'confirm'}
        danger
        title="수행 결과를 삭제할까요?"
        description="삭제하면 되돌릴 수 없고, 결과를 다시 작성해야 해요."
        confirmLabel="삭제"
        onConfirm={deleteResult}
        onClose={() => setDialog(null)}
      />

      <ConfirmDialog
        open={dialog === 'done'}
        title="삭제되었어요"
        description="수행 결과가 삭제되어 다시 작성할 수 있어요."
        confirmLabel="확인"
        cancelLabel="닫기"
        onConfirm={() => navigate(PROVIDER_PATHS.home, { replace: true })}
        onClose={() => setDialog(null)}
      />
    </SubPageLayout>
  )
}

export default ResultDetailPage
