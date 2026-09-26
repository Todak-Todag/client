import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { cancelSchedule, requestReschedule } from '../../api/endpoints/schedule'
import EmptyState from '../../components/common/EmptyState'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { AlertIcon, CalendarIcon, InfoIcon } from '../../components/ui/Icons'
import CancelScheduleSheet from '../../features/schedule/CancelScheduleSheet'
import RescheduleSheet from '../../features/schedule/RescheduleSheet'
import { ScheduleCardSkeleton } from '../../features/schedule/ScheduleCard'
import {
  getScheduleErrorMessage,
  isScheduleGone,
  isScheduleStale,
} from '../../features/schedule/scheduleErrors'
import { getScheduleActions, getScheduleBadge } from '../../features/schedule/scheduleStatus'
import { useScheduleDetail } from '../../features/schedule/useSchedules'
import { useNow } from '../../hooks/useNow'
import SubPageLayout from '../../layouts/SubPageLayout'
import { PATHS } from '../../constants/paths'
import { SCHEDULE_STATUS } from '../../constants/status'
import {
  formatMonthDay,
  formatMonthDayTime,
  formatTimeRange,
  toLocalDateString,
} from '../../utils/date'
// 페이지 틀·안내 상자·하단 동작 영역은 퇴원 예정자 하위 화면 공통 스타일을 그대로 쓴다
import layout from './CarePlanPage.module.css'
import styles from './ScheduleDetailPage.module.css'

const SHEET = { RESCHEDULE: 'reschedule', CANCEL: 'cancel' }

/** 퇴원 예정자 일정 상세: 상태 확인 + 변경 요청·취소 */
function ScheduleDetailPage() {
  const { serviceScheduleId } = useParams()
  const navigate = useNavigate()
  const now = useNow()
  const today = toLocalDateString(now)

  const detail = useScheduleDetail(serviceScheduleId)
  const [sheet, setSheet] = useState(null)
  // 화면을 연 뒤 상태가 바뀌어 요청이 막혔으면, 시트를 닫을 때 상세를 다시 불러온다
  const [stale, setStale] = useState(false)

  // 재발급까지 실패한 세션 만료
  if (detail.status === 'error' && detail.error?.status === 401) {
    return <Navigate to={PATHS.login} replace />
  }

  // 성공하면 시트를 닫고 다시 조회한다. 바뀐 배지·안내가 결과를 알려주므로 따로 알림은 띄우지 않는다
  const submit = async (send) => {
    try {
      await send()
    } catch (error) {
      if (isScheduleStale(error)) setStale(true)
      throw error
    }
    setSheet(null)
    detail.reload()
  }

  const reschedule = (date) => submit(() => requestReschedule(serviceScheduleId, date))
  const cancel = (cancelReason) => submit(() => cancelSchedule(serviceScheduleId, cancelReason))

  const closeSheet = () => {
    setSheet(null)
    if (stale) {
      setStale(false)
      detail.reload()
    }
  }

  const renderBody = () => {
    if (detail.status === 'loading') {
      return (
        <>
          <p className={layout.srOnly} role="status">
            일정을 불러오는 중이에요
          </p>
          <ScheduleCardSkeleton description />
        </>
      )
    }

    if (detail.status === 'error') {
      // 없는 일정·남의 일정(서버는 둘 다 403)은 다시 시도해도 같아서 목록으로 안내한다
      if (isScheduleGone(detail.error)) {
        return (
          <EmptyState
            icon={CalendarIcon}
            title="일정을 찾을 수 없어요"
            description="볼 수 없는 일정이에요. 일정 목록에서 다시 확인해 주세요."
            action={
              <Button
                variant="outline"
                size="md"
                block={false}
                onClick={() => navigate(PATHS.schedule, { replace: true })}
              >
                일정 목록 보기
              </Button>
            }
          />
        )
      }

      return (
        <EmptyState
          tone="error"
          icon={AlertIcon}
          title="일정을 불러오지 못했어요"
          description={getScheduleErrorMessage(detail.error)}
          action={
            <Button variant="outline" size="md" block={false} onClick={detail.reload}>
              다시 시도
            </Button>
          }
        />
      )
    }

    const schedule = detail.data
    const serviceName = schedule.serviceName ?? '케어 서비스'
    const badge = getScheduleBadge(schedule, now)
    const actions = getScheduleActions(schedule, now)
    // 취소됐거나 새 일정으로 대체된 일정은 지나간 정보라 글자를 낮춘다
    const isCanceled = schedule.status === SCHEDULE_STATUS.CANCELED
    const isRescheduling = schedule.status === SCHEDULE_STATUS.RESCHEDULING

    return (
      <>
        <article
          className={[
            styles.card,
            isCanceled || schedule.status === SCHEDULE_STATUS.CHANGED ? styles.dimmed : '',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-labelledby="schedule-title"
        >
          <div className={styles.head}>
            <h2 id="schedule-title" className={styles.title}>
              {serviceName}
            </h2>
            <Badge variant={badge.variant}>{badge.label}</Badge>
          </div>

          {schedule.serviceContent && (
            <div className={styles.description}>
              <p className={styles.descriptionLabel}>서비스 내용</p>
              <p className={styles.descriptionText}>{schedule.serviceContent}</p>
            </div>
          )}

          <dl className={styles.rows}>
            <div className={styles.row}>
              <dt>날짜</dt>
              <dd>{formatMonthDay(schedule.date)}</dd>
            </div>
            <div className={styles.row}>
              <dt>시간</dt>
              <dd>{formatTimeRange(schedule.startedAt, schedule.finishedAt)}</dd>
            </div>
          </dl>
        </article>

        {/* 요청한 새 날짜는 응답에 없어서 보여주지 않는다 */}
        {isRescheduling && (
          <p className={`${layout.note} ${layout.noteWarning}`}>
            <AlertIcon className={layout.noteIcon} />
            <span>
              새 날짜로 변경을 요청했어요. 서비스 제공자를 찾으면 일정이 자동으로 바뀌고, 찾지
              못하면 기존 일정이 그대로 유지돼요.
            </span>
          </p>
        )}

        {schedule.status === SCHEDULE_STATUS.CHANGED && (
          <>
            <p className={layout.note}>
              <InfoIcon className={layout.noteIcon} />
              <span>새 날짜로 일정이 바뀌었어요. 바뀐 일정은 일정 목록에서 확인할 수 있어요.</span>
            </p>
            <Button
              variant="secondary"
              size="md"
              onClick={() => navigate(PATHS.schedule, { replace: true })}
            >
              일정 목록 보기
            </Button>
          </>
        )}

        {schedule.status === SCHEDULE_STATUS.SCHEDULED && actions.show && (
          <p className={layout.note}>
            <InfoIcon className={layout.noteIcon} />
            <span>
              {actions.canReschedule
                ? `변경·취소는 시작 24시간 전인 ${formatMonthDayTime(actions.deadline)}까지 할 수 있어요.`
                : `변경·취소 마감(${formatMonthDayTime(actions.deadline)})이 지나 이 일정은 바꿀 수 없어요.`}
            </span>
          </p>
        )}

        {isCanceled && (
          <section className={styles.card} aria-labelledby="cancel-title">
            <h3 id="cancel-title" className={styles.subTitle}>
              취소 사유
            </h3>
            <p className={styles.reason}>{schedule.cancelReason || '남긴 사유가 없어요.'}</p>
            {schedule.canceledAt && (
              <dl className={styles.rows}>
                <div className={styles.row}>
                  <dt>취소 일시</dt>
                  <dd>{formatMonthDayTime(schedule.canceledAt)}</dd>
                </div>
              </dl>
            )}
          </section>
        )}

        {actions.show && (
          <div className={layout.actionBar}>
            {isRescheduling ? (
              <>
                <p className={layout.actionNote}>
                  {actions.canCancel
                    ? '변경 요청 중에도 시작 24시간 전까지 취소할 수 있어요.'
                    : '시작 24시간 전이 지나 취소할 수 없어요.'}
                </p>
                <Button
                  variant="danger"
                  size="md"
                  onClick={() => setSheet(SHEET.CANCEL)}
                  disabled={!actions.canCancel}
                >
                  일정 취소
                </Button>
              </>
            ) : (
              <div className={styles.actionRow}>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => setSheet(SHEET.RESCHEDULE)}
                  disabled={!actions.canReschedule}
                >
                  일정 변경
                </Button>
                <Button
                  variant="danger"
                  size="md"
                  onClick={() => setSheet(SHEET.CANCEL)}
                  disabled={!actions.canCancel}
                >
                  일정 취소
                </Button>
              </div>
            )}
          </div>
        )}

        {sheet === SHEET.RESCHEDULE && (
          <RescheduleSheet
            schedule={schedule}
            today={today}
            finishDate={schedule.carePlanFinishDate}
            onSubmit={reschedule}
            onClose={closeSheet}
          />
        )}

        {sheet === SHEET.CANCEL && (
          <CancelScheduleSheet
            serviceName={serviceName}
            schedule={schedule}
            onSubmit={cancel}
            onClose={closeSheet}
          />
        )}
      </>
    )
  }

  return (
    <SubPageLayout title="일정 상세">
      <div className={layout.page} aria-busy={detail.status === 'loading'}>
        {renderBody()}
      </div>
    </SubPageLayout>
  )
}

export default ScheduleDetailPage
