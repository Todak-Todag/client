import Button from '../../components/ui/Button'
import { formatMonthDay } from '../../utils/date'
import styles from './DischargeCard.module.css'

/**
 * 퇴원 상태별 표시와 다음 동작.
 *
 * Care Plan은 실제 퇴원이 완료된 건에만 만들 수 있어(DISCHARGE_NOT_COMPLETED),
 * 퇴원 전에는 작성하기 대신 퇴원처리를 먼저 안내한다.
 */
const VIEW_BY_STATUS = {
  COMPLETED: { label: 'todak-todag 작성 필요', action: '작성하기', highlight: true },
  SCHEDULED: { label: '퇴원 예정', action: '퇴원처리', highlight: false },
  POSTPONED: { label: '퇴원 연기', action: '퇴원처리', highlight: false },
  CANCELED: { label: '퇴원 취소', action: null, highlight: false },
}

/**
 * 병원 담당자 홈의 연계 환자 카드
 *
 * 환자 이름·나이·성별은 서버에서 받을 수 없어 자리만 표시한다.
 * (GET /discharges 응답에는 patientId만 있고, 나이·성별은 DB에도 없는 필드)
 *
 * @param {object} discharge GET /discharges 응답 항목
 * @param {(discharge: object) => void} onWrite Care Plan 작성하기 클릭
 * @param {(discharge: object) => void} onComplete 퇴원처리 클릭
 */
function DischargeCard({ discharge, onWrite, onComplete }) {
  const view = VIEW_BY_STATUS[discharge.status] ?? VIEW_BY_STATUS.SCHEDULED
  const isCompleted = discharge.status === 'COMPLETED'

  const dateLabel = isCompleted
    ? `${formatMonthDay(discharge.actualDate ?? discharge.scheduledDate, { weekday: false })} 퇴원`
    : `${formatMonthDay(discharge.scheduledDate, { weekday: false })} 퇴원 예정`

  const handleAction = () =>
    isCompleted ? onWrite?.(discharge) : onComplete?.(discharge)

  return (
    <article
      className={[styles.card, view.highlight ? styles.todo : '']
        .filter(Boolean)
        .join(' ')}
    >
      <div className={styles.row}>
        <div className={styles.left}>
          <p className={styles.name}>이름 님</p>
          <span className={styles.profile}>나이 / 성별</span>
        </div>

        <span
          className={[styles.status, view.highlight ? styles.statusTodo : '']
            .filter(Boolean)
            .join(' ')}
        >
          {view.label}
        </span>
      </div>

      <div className={styles.row}>
        <p className={styles.date}>{dateLabel}</p>

        {view.action && (
          <Button size="sm" block={false} onClick={handleAction}>
            {view.action}
          </Button>
        )}
      </div>
    </article>
  )
}

export default DischargeCard
