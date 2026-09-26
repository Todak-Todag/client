import { useState } from 'react'
import BottomSheet from '../../components/ui/BottomSheet'
import Button from '../../components/ui/Button'
import MonthCalendar from '../../components/ui/MonthCalendar'
import { PREFERRED_TIME_SLOT, PREFERRED_TIME_SLOT_LABEL } from '../../constants/status'
import { formatMonthDay } from '../../utils/date'
import { getCarePlanErrorMessage } from './carePlanErrors'
import styles from './CarePlanReview.module.css'

const TIME_SLOTS = [PREFERRED_TIME_SLOT.MORNING, PREFERRED_TIME_SLOT.AFTERNOON]

/**
 * 희망 일정 추가·수정 시트. 열 때마다 새로 그려지도록 부모가 조건부로 렌더링한다.
 *
 * @param {string} serviceName 시트 부제
 * @param {string} min 고를 수 있는 첫날 (내일과 케어 시작일 중 늦은 날)
 * @param {string} max 고를 수 있는 마지막 날 (케어 종료일)
 * @param {{ servicePreferenceId: string, preferredDate: string, preferredTimeSlot: string } | null} editing
 *   수정할 일정. null이면 추가
 * @param {Array<{ servicePreferenceId: string, preferredDate: string, preferredTimeSlot: string }>} existing
 *   이미 있는 일정 (같은 날짜·시간대 중복 방지)
 * @param {(value: { preferredDate: string, preferredTimeSlot: string }) => Promise<void>} onSubmit
 * @param {() => void} onClose
 */
function PreferenceSheet({ serviceName, min, max, editing, existing, onSubmit, onClose }) {
  const [date, setDate] = useState(editing?.preferredDate ?? null)
  const [slot, setSlot] = useState(editing?.preferredTimeSlot ?? null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const duplicate = existing.some(
    (preference) =>
      preference.servicePreferenceId !== editing?.servicePreferenceId &&
      preference.preferredDate === date &&
      preference.preferredTimeSlot === slot,
  )
  const unchanged =
    editing && editing.preferredDate === date && editing.preferredTimeSlot === slot

  // 버튼이 왜 눌리지 않는지 항상 한 줄로 알려준다
  const hint = (() => {
    if (!date || !slot) return '날짜와 시간대를 골라 주세요.'
    if (duplicate) return '이미 추가한 일정이에요. 다른 날짜나 시간대를 골라 주세요.'
    // 받침 유무로 조사가 달라진다: 오전'으로' / 오후'로'
    const particle = slot === PREFERRED_TIME_SLOT.MORNING ? '으로' : '로'
    return `${formatMonthDay(date)} ${PREFERRED_TIME_SLOT_LABEL[slot]}${particle} 저장해요.`
  })()

  const submit = async () => {
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit({ preferredDate: date, preferredTimeSlot: slot })
    } catch (caught) {
      setError(getCarePlanErrorMessage(caught))
      setSubmitting(false)
    }
  }

  return (
    <BottomSheet
      open
      onClose={submitting ? () => {} : onClose}
      title={editing ? '희망 일정 수정' : '희망 일정 추가'}
      description={serviceName}
    >
      <div className={styles.sheet}>
        <MonthCalendar value={date} min={min} max={max} onChange={setDate} label="희망 날짜" />

        <p className={styles.sheetNote}>
          {formatMonthDay(min, { weekday: false })}부터 {formatMonthDay(max, { weekday: false })}까지 고를 수 있어요.
        </p>

        <fieldset className={styles.slotGroup}>
          <legend className={styles.slotLegend}>시간대</legend>
          <div className={styles.slots}>
            {TIME_SLOTS.map((value) => (
              <label key={value} className={styles.slot}>
                <input
                  type="radio"
                  name="preferredTimeSlot"
                  value={value}
                  checked={slot === value}
                  onChange={() => setSlot(value)}
                  className={styles.slotInput}
                />
                <span className={styles.slotLabel}>{PREFERRED_TIME_SLOT_LABEL[value]}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <p
          className={[styles.sheetHint, duplicate ? styles.sheetHintWarning : '']
            .filter(Boolean)
            .join(' ')}
          aria-live="polite"
        >
          {hint}
        </p>

        {error && (
          <p className={styles.formError} role="alert">
            {error}
          </p>
        )}

        <Button
          onClick={submit}
          loading={submitting}
          disabled={!date || !slot || duplicate || unchanged}
        >
          {editing ? '수정하기' : '저장하기'}
        </Button>
      </div>
    </BottomSheet>
  )
}

export default PreferenceSheet
