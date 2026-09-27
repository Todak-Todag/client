import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { CalendarIcon, InfoIcon } from '../../components/ui/Icons'
import { formatAttemptDate, getFailureReasonText } from './matchingStatus'
import cardStyles from '../care-plan/CarePlanReview.module.css'
import styles from './Matching.module.css'

/**
 * 매칭 실패 카드. 다시 요청한 뒤에는 결과를 기다리는 안내로 바뀐다.
 * (서버는 결과가 나올 때까지 이 기록을 FAILED로 두어서, 요청 여부는 화면이 기억한다)
 *
 * @param {object} attempt 가장 최근 FAILED 기록 (serviceName 포함)
 * @param {boolean} requested 이미 다시 요청했는지
 * @param {{ date: string, preferredTimeSlot: string|null } | null} requestedSchedule 새로 요청한 일정 (모르면 null)
 * @param {() => void} onRetry 다시 요청 시트 열기
 * @param {() => void} onRefresh 결과 다시 불러오기
 */
function FailedAttemptCard({ attempt, requested, requestedSchedule, onRetry, onRefresh }) {
  const title = attempt.serviceName ?? '케어 서비스'
  // 다시 요청했으면 지금 찾고 있는 일정을 보여준다
  const shown = requested && requestedSchedule ? requestedSchedule : attempt

  return (
    <article className={cardStyles.card}>
      <div className={cardStyles.cardHead}>
        <h3 className={cardStyles.cardTitle}>{title}</h3>
        {/* 결과를 기다리는 중은 일정 '변경 요청 중'과 같은 노랑 */}
        <Badge variant={requested ? 'warning' : 'danger'}>
          {requested ? '다시 요청함' : '매칭 실패'}
        </Badge>
      </div>

      <p className={cardStyles.meta}>
        <CalendarIcon className={cardStyles.metaIcon} />
        <span className={styles.srOnly}>{shown === attempt ? '희망 일정:' : '다시 요청한 일정:'}</span>
        {formatAttemptDate(shown)}
      </p>

      {requested ? (
        <>
          <p className={styles.note} role="status">
            <InfoIcon className={styles.noteIcon} />
            <span>
              {requestedSchedule
                ? `기존 ${formatAttemptDate(attempt)} 대신 이 일정으로 서비스 제공자를 찾고 있어요.`
                : '다시 요청한 일정으로 서비스 제공자를 찾고 있어요.'}{' '}
              결과가 나오면 이 화면에 반영돼요.
            </span>
          </p>
          <Button variant="secondary" size="md" onClick={onRefresh}>
            결과 새로고침
          </Button>
        </>
      ) : (
        <>
          <div className={cardStyles.inset}>
            <p className={cardStyles.insetLabel}>실패 사유</p>
            <p className={cardStyles.insetText}>{getFailureReasonText(attempt.failureReason)}</p>
          </div>
          <Button size="md" onClick={onRetry} aria-label={`${title} 다시 요청하기`}>
            다시 요청하기
          </Button>
        </>
      )}
    </article>
  )
}

export default FailedAttemptCard
