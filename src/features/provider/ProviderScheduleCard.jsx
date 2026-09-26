import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { ClockIcon } from '../../components/ui/Icons'
import { formatTimeRange } from '../../utils/date'
import { SCHEDULE_ACTION, getProviderScheduleView } from './providerScheduleStatus'
import styles from './ProviderScheduleCard.module.css'

/**
 * 방문 케어 일정 카드 (서비스 제공자용)
 *
 * 일정 응답에 이용자 정보가 없어 서비스 이름과 시간만 보여준다.
 *
 * @param {object} schedule serviceName, result 가 채워진 일정
 */
function ProviderScheduleCard({ schedule, now, completing, onComplete, onWriteResult, onViewResult }) {
  const view = getProviderScheduleView(schedule, Boolean(schedule.result), now)

  return (
    <article className={styles.card}>
      <div className={styles.head}>
        <h3 className={styles.title}>{schedule.serviceName ?? '서비스 일정'}</h3>
        <Badge variant={view.variant}>{view.label}</Badge>
      </div>

      <p className={styles.row}>
        <ClockIcon className={styles.icon} />
        <span>방문 시간:</span>
        <span className={styles.value}>
          {formatTimeRange(schedule.startedAt, schedule.finishedAt)}
        </span>
      </p>

      {view.action === SCHEDULE_ACTION.COMPLETE && (
        <Button
          size="md"
          disabled={view.disabled}
          loading={completing}
          onClick={() => onComplete(schedule)}
        >
          수행 완료하기
        </Button>
      )}

      {view.action === SCHEDULE_ACTION.WRITE_RESULT && (
        <Button size="md" onClick={() => onWriteResult(schedule)}>
          결과 작성하기
        </Button>
      )}

      {view.action === SCHEDULE_ACTION.VIEW_RESULT && (
        <Button size="md" variant="outline" onClick={() => onViewResult(schedule)}>
          결과 상세 보기
        </Button>
      )}
    </article>
  )
}

export default ProviderScheduleCard
