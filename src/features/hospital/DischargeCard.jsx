import Button from '../../components/ui/Button'
import { formatMonthDay } from '../../utils/date'
import styles from './DischargeCard.module.css'

/**
 * 병원 담당자 홈의 연계 환자 카드
 *
 * @param {object} discharge GET /discharges 응답 항목
 * @param {{ name: string, age: number|null, gender: string|null, carePlanWritten: boolean }} patient
 *   서버에서 받을 수 없어 임시로 채운 환자 정보 (src/dummy/dischargePatients.js)
 * @param {(discharge: object) => void} onWrite 'todak-todag 작성하기' 클릭
 */
function DischargeCard({ discharge, patient, onWrite }) {
  const isCompleted = discharge.status === 'COMPLETED'
  const dateLabel = isCompleted
    ? `${formatMonthDay(discharge.actualDate ?? discharge.scheduledDate, { weekday: false })} 퇴원`
    : `${formatMonthDay(discharge.scheduledDate, { weekday: false })} 퇴원 예정`

  // 나이·성별이 없을 수도 있어 있는 것만 이어 붙인다
  const profile = [
    patient.age != null ? `${patient.age}세` : null,
    patient.gender,
  ]
    .filter(Boolean)
    .join(' / ')

  const needsCarePlan = !patient.carePlanWritten

  return (
    <article
      className={[styles.card, needsCarePlan ? styles.todo : '']
        .filter(Boolean)
        .join(' ')}
    >
      <div className={styles.row}>
        <div className={styles.left}>
          <p className={styles.name}>{patient.name} 님</p>
          {profile && <span className={styles.profile}>{profile}</span>}
        </div>

        <span
          className={[styles.status, needsCarePlan ? styles.statusTodo : '']
            .filter(Boolean)
            .join(' ')}
        >
          todak-todag {needsCarePlan ? '작성 필요' : '작성 완료'}
        </span>
      </div>

      <div className={styles.row}>
        <p className={styles.date}>{dateLabel}</p>

        {needsCarePlan && (
          <Button size="sm" block={false} onClick={() => onWrite?.(discharge)}>
            작성하기
          </Button>
        )}
      </div>
    </article>
  )
}

export default DischargeCard
