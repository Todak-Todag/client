import { useId, useState } from 'react'
import BottomSheet from '../../components/ui/BottomSheet'
import Button from '../../components/ui/Button'
import { AlertIcon } from '../../components/ui/Icons'
import { formatMonthDay, formatTimeRange } from '../../utils/date'
import { getScheduleErrorMessage } from './scheduleErrors'
import styles from './ScheduleSheet.module.css'

/**
 * 일정 취소 시트. 되돌릴 수 없어 사유를 받고 한 번 더 확인한다.
 * 열 때마다 새로 그려지도록 부모가 조건부로 렌더링한다.
 *
 * @param {string} serviceName 시트 부제
 * @param {{ date: string, startedAt: string, finishedAt: string }} schedule
 * @param {(cancelReason: string) => Promise<void>} onSubmit 실패하면 throw (시트 안에 오류 표시)
 * @param {() => void} onClose
 */
function CancelScheduleSheet({ serviceName, schedule, onSubmit, onClose }) {
  const reasonId = useId()
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  // 서버가 공백만 있는 사유도 거절하므로(@NotBlank) 앞뒤 공백을 빼고 판단한다
  const trimmed = reason.trim()
  const close = submitting ? () => {} : onClose

  const submit = async () => {
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit(trimmed)
    } catch (caught) {
      setError(getScheduleErrorMessage(caught))
      setSubmitting(false)
    }
  }

  return (
    <BottomSheet
      open
      onClose={close}
      title="일정을 취소할까요?"
      description={`${serviceName} · ${formatMonthDay(schedule.date)} ${formatTimeRange(schedule.startedAt, schedule.finishedAt)}`}
    >
      <div className={styles.sheet}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor={reasonId}>
            취소 사유
            <span className={styles.required}>(필수)</span>
          </label>
          <textarea
            id={reasonId}
            className={styles.textarea}
            rows={3}
            // 입력 안내는 라벨이 맡고, 자리표시는 쓸 내용의 예시만 보여준다
            placeholder="예: 병원 외래 진료와 시간이 겹쳐요"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            disabled={submitting}
            required
          />
        </div>

        <p className={`${styles.note} ${styles.noteWarning}`}>
          <AlertIcon className={styles.noteIcon} />
          <span>취소한 일정은 되돌릴 수 없어요.</span>
        </p>

        {error && (
          <p className={styles.formError} role="alert">
            {error}
          </p>
        )}

        <div className={styles.actions}>
          <Button variant="secondary" size="md" onClick={close} disabled={submitting}>
            닫기
          </Button>
          <Button
            variant="danger"
            size="md"
            onClick={submit}
            loading={submitting}
            disabled={!trimmed}
          >
            일정 취소하기
          </Button>
        </div>
      </div>
    </BottomSheet>
  )
}

export default CancelScheduleSheet
