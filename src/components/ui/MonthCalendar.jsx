import { useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from './Icons'
import { WEEKDAY_LABELS, formatDateLabel, getMonthCells } from '../../utils/date'
import styles from './MonthCalendar.module.css'

const toMonth = (dateString) => ({
  year: Number(dateString.slice(0, 4)),
  month: Number(dateString.slice(5, 7)),
})
const monthKey = ({ year, month }) => year * 12 + month

/**
 * 한 달 달력에서 날짜 하나를 고른다. min~max 밖의 날짜는 누를 수 없다.
 *
 * @param {string|null} value 선택한 날짜 'YYYY-MM-DD'
 * @param {string} min 고를 수 있는 첫날 'YYYY-MM-DD'
 * @param {string} max 고를 수 있는 마지막 날 'YYYY-MM-DD'
 * @param {(date: string) => void} onChange
 * @param {string} label 스크린리더용 이름
 */
function MonthCalendar({ value, min, max, onChange, label = '날짜 선택' }) {
  const [visible, setVisible] = useState(() => toMonth(value ?? min))

  const canPrev = monthKey(visible) > monthKey(toMonth(min))
  const canNext = monthKey(visible) < monthKey(toMonth(max))

  const move = (step) => {
    setVisible(({ year, month }) => {
      const next = month + step
      if (next < 1) return { year: year - 1, month: 12 }
      if (next > 12) return { year: year + 1, month: 1 }
      return { year, month: next }
    })
  }

  return (
    <div className={styles.calendar} role="group" aria-label={label}>
      <div className={styles.head}>
        <button
          type="button"
          className={styles.nav}
          onClick={() => move(-1)}
          disabled={!canPrev}
          aria-label="이전 달"
        >
          <ChevronLeftIcon className={styles.navIcon} />
        </button>
        <p className={styles.month} aria-live="polite">
          {visible.year}년 {visible.month}월
        </p>
        <button
          type="button"
          className={styles.nav}
          onClick={() => move(1)}
          disabled={!canNext}
          aria-label="다음 달"
        >
          <ChevronRightIcon className={styles.navIcon} />
        </button>
      </div>

      <div className={styles.grid}>
        {WEEKDAY_LABELS.map((weekday) => (
          <span key={weekday} className={styles.weekday} aria-hidden="true">
            {weekday}
          </span>
        ))}

        {getMonthCells(visible.year, visible.month).map((date, index) => {
          if (!date) return <span key={`blank-${index}`} aria-hidden="true" />

          // 'YYYY-MM-DD'는 문자열 비교가 날짜 비교와 같다
          const disabled = date < min || date > max
          const selected = date === value

          return (
            <button
              key={date}
              type="button"
              className={[styles.day, selected ? styles.selected : ''].filter(Boolean).join(' ')}
              onClick={() => onChange(date)}
              disabled={disabled}
              aria-pressed={selected}
              aria-label={formatDateLabel(date)}
            >
              {Number(date.slice(8))}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default MonthCalendar
