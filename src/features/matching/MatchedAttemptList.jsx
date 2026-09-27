import { formatMonthDay } from '../../utils/date'
import styles from './Matching.module.css'

/**
 * 매칭 완료 목록. 섹션 제목이 이미 '매칭 완료'라 줄마다 같은 배지를 반복하지 않는다.
 * MATCHED 기록에는 시간대가 오지 않아 날짜만 보여준다 (시간은 일정 화면에서 확인).
 *
 * @param {Array<{ matchingAttemptId: string, serviceName: string|null, date: string }>} attempts
 */
function MatchedAttemptList({ attempts }) {
  return (
    <ul className={styles.rows}>
      {attempts.map((attempt) => (
        <li key={attempt.matchingAttemptId} className={styles.row}>
          <p className={styles.rowTitle}>{attempt.serviceName ?? '케어 서비스'}</p>
          <p className={styles.rowMeta}>{formatMonthDay(attempt.date)}</p>
        </li>
      ))}
    </ul>
  )
}

export default MatchedAttemptList
