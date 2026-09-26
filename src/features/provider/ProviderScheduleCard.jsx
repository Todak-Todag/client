import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
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
function ProviderScheduleCard({ schedule, now, onWriteResult, onViewResult }) {
  const view = getProviderScheduleView(schedule, Boolean(schedule.result), now)

  return (
    <article className={styles.card}>
      <div className={styles.head}>
        <span className={styles.service}>{schedule.serviceName ?? '서비스 일정'}</span>
        <Badge variant={view.variant}>{view.label}</Badge>
      </div>

      <p className={styles.time}>
        방문 시간 : {formatTimeRange(schedule.startedAt, schedule.finishedAt)}
      </p>

      {view.action === SCHEDULE_ACTION.WRITE_RESULT && (
        <Button size="sm" onClick={() => onWriteResult(schedule)}>
          결과 작성하기
        </Button>
      )}

      {view.action === SCHEDULE_ACTION.VIEW_RESULT && (
        <Button size="sm" variant="outline" onClick={() => onViewResult(schedule)}>
          작성 결과 상세 보기
        </Button>
      )}
    </article>
  )
}

export default ProviderScheduleCard
