import { useState } from 'react'
import BottomSheet from '../../components/ui/BottomSheet'
import Button from '../../components/ui/Button'
import { InfoIcon } from '../../components/ui/Icons'
import { formatMonthDay, formatTimeRange } from '../../utils/date'
import { getRescheduleOptions } from './scheduleStatus'
import { getScheduleErrorMessage } from './scheduleErrors'
import styles from './ScheduleSheet.module.css'

/**
 * 일정 변경 시트: 하루 앞당기기 · 하루 미루기 중 하나. 열 때마다 새로 그려지도록 부모가 조건부로 렌더링한다.
 *
 * @param {{ date: string, startedAt: string, finishedAt: string }} schedule 현재 일정
 * @param {string} today 'YYYY-MM-DD'
 * @param {string|null} finishDate 일정이 속한 Care Plan 종료일 (하루 미루기 제한)
 * @param {(date: string) => Promise<void>} onSubmit 실패하면 throw (시트 안에 오류 표시)
 * @param {() => void} onClose
 */
function RescheduleSheet({ schedule, today, finishDate, onSubmit, onClose }) {
  const [selected, setSelected] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const options = getRescheduleOptions(schedule.date, today, finishDate)
  const available = options.filter((option) => !option.disabledReason)
  const time = formatTimeRange(schedule.startedAt, schedule.finishedAt)

  // 버튼이 왜 눌리지 않는지 항상 한 줄로 알려준다
  const hint = (() => {
    if (available.length === 0) return '지금은 바꿀 수 있는 날짜가 없어요.'
    if (!selected) return '바꿀 날짜를 골라 주세요.'
    return `${formatMonthDay(selected)} 같은 시간으로 변경을 요청해요.`
  })()

  const submit = async () => {
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit(selected)
    } catch (caught) {
      setError(getScheduleErrorMessage(caught))
      setSubmitting(false)
    }
  }

  return (
    <BottomSheet
      open
      onClose={submitting ? () => {} : onClose}
      title="일정 변경"
      description={`현재 일정 · ${formatMonthDay(schedule.date)} ${time}`}
    >
      <div className={styles.sheet}>
        <fieldset className={styles.options}>
          <legend className={styles.srOnly}>바꿀 날짜</legend>
          {options.map((option) => (
            <label key={option.key} className={styles.option}>
              <input
                type="radio"
                name="rescheduleDate"
                value={option.date}
                checked={selected === option.date}
                onChange={() => setSelected(option.date)}
                disabled={Boolean(option.disabledReason) || submitting}
                className={styles.optionInput}
              />
              <span className={styles.radio} aria-hidden="true" />
              <span className={styles.optionBody}>
                <span className={styles.optionName}>{option.label}</span>
                <span className={styles.optionText}>{formatMonthDay(option.date)}</span>
                {option.disabledReason && (
                  <span className={styles.optionReason}>{option.disabledReason}</span>
                )}
              </span>
            </label>
          ))}
        </fieldset>

        <p className={styles.note}>
          <InfoIcon className={styles.noteIcon} />
          <span>
            시간대는 고를 수 없어요. 새 날짜로 서비스 제공자를 다시 찾으며, 찾지 못하면 기존 일정이
            유지돼요.
          </span>
        </p>

        <p className={styles.hint} aria-live="polite">
          {hint}
        </p>

        {error && (
          <p className={styles.formError} role="alert">
            {error}
          </p>
        )}

        <Button onClick={submit} loading={submitting} disabled={!selected}>
          변경 요청하기
        </Button>
      </div>
    </BottomSheet>
  )
}

export default RescheduleSheet
