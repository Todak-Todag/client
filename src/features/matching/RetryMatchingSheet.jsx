import { useState } from 'react'
import BottomSheet from '../../components/ui/BottomSheet'
import Button from '../../components/ui/Button'
import { InfoIcon } from '../../components/ui/Icons'
import MonthCalendar from '../../components/ui/MonthCalendar'
import { PREFERRED_TIME_SLOT, PREFERRED_TIME_SLOT_LABEL } from '../../constants/status'
import { formatMonthDay } from '../../utils/date'
import { formatAttemptDate } from './matchingStatus'
import { getMatchingErrorMessage } from './matchingErrors'
import sheetStyles from '../care-plan/CarePlanReview.module.css'
import styles from './Matching.module.css'

const TIME_SLOTS = [PREFERRED_TIME_SLOT.MORNING, PREFERRED_TIME_SLOT.AFTERNOON]

/**
 * 매칭 실패 건 다시 요청 시트 (희망 일정 시트와 같은 달력·시간대 모양).
 * 열 때마다 새로 그려지도록 부모가 조건부로 렌더링한다.
 *
 * @param {object} attempt 다시 요청할 FAILED 기록 (serviceName 포함)
 * @param {string} min 고를 수 있는 첫날 (내일과 케어 시작일 중 늦은 날)
 * @param {string|null} max 고를 수 있는 마지막 날 (케어 종료일)
 * @param {(value: { date: string, preferredTimeSlot: string }) => Promise<void>} onSubmit 실패하면 throw
 * @param {() => void} onClose
 */
function RetryMatchingSheet({ attempt, min, max, onSubmit, onClose }) {
  const [date, setDate] = useState(null)
  // 시간대는 처음 희망한 것을 그대로 두고, 바꾸고 싶을 때만 누르게 한다
  const [slot, setSlot] = useState(attempt.preferredTimeSlot ?? null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  // 남은 케어 기간이 없으면(내일이 종료일 뒤) 고를 날짜가 없다
  const canPick = Boolean(max) && min <= max

  // 버튼이 왜 눌리지 않는지 항상 한 줄로 알려준다
  const hint = (() => {
    if (!canPick) return '남은 케어 기간이 없어 다시 요청할 수 없어요.'
    if (!date || !slot) return '날짜와 시간대를 골라 주세요.'
    // 받침 유무로 조사가 달라진다: 오전'으로' / 오후'로'
    const particle = slot === PREFERRED_TIME_SLOT.MORNING ? '으로' : '로'
    return `${formatMonthDay(date)} ${PREFERRED_TIME_SLOT_LABEL[slot]}${particle} 다시 요청해요.`
  })()

  const submit = async () => {
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit({ date, preferredTimeSlot: slot })
    } catch (caught) {
      setError(getMatchingErrorMessage(caught))
      setSubmitting(false)
    }
  }

  return (
    <BottomSheet
      open
      onClose={submitting ? () => {} : onClose}
      title="다시 요청하기"
      description={`${attempt.serviceName ?? '케어 서비스'} · 기존 희망 일정 ${formatAttemptDate(attempt)}`}
    >
      <div className={sheetStyles.sheet}>
        {canPick && (
          <>
            {/* 새 날짜는 기존 희망일 근처에서 고르는 경우가 많아 그 달부터 보여준다 (기간 밖이면 가까운 끝) */}
            <MonthCalendar
              value={date}
              min={min}
              max={max}
              onChange={setDate}
              label="희망 날짜"
              defaultMonth={attempt.date < min ? min : attempt.date > max ? max : attempt.date}
            />
            <p className={sheetStyles.sheetNote}>
              케어 기간 안에서 {formatMonthDay(min, { weekday: false })}부터{' '}
              {formatMonthDay(max, { weekday: false })}까지 고를 수 있어요.
            </p>
          </>
        )}

        <fieldset className={sheetStyles.slotGroup} disabled={!canPick || submitting}>
          <legend className={sheetStyles.slotLegend}>시간대</legend>
          <div className={sheetStyles.slots}>
            {TIME_SLOTS.map((value) => (
              <label key={value} className={sheetStyles.slot}>
                <input
                  type="radio"
                  name="retryTimeSlot"
                  value={value}
                  checked={slot === value}
                  onChange={() => setSlot(value)}
                  className={sheetStyles.slotInput}
                />
                <span className={sheetStyles.slotLabel}>{PREFERRED_TIME_SLOT_LABEL[value]}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <p className={styles.note}>
          <InfoIcon className={styles.noteIcon} />
          <span>
            요청이 접수되면 결과가 나오기까지 시간이 걸릴 수 있어요. 결과는 매칭 현황에서 확인할 수
            있어요.
          </span>
        </p>

        <p className={sheetStyles.sheetHint} aria-live="polite">
          {hint}
        </p>

        {error && (
          <p className={sheetStyles.formError} role="alert">
            {error}
          </p>
        )}

        <Button onClick={submit} loading={submitting} disabled={!canPick || !date || !slot}>
          요청하기
        </Button>
      </div>
    </BottomSheet>
  )
}

export default RetryMatchingSheet
