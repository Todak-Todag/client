import { WEEKDAY_LABELS, formatDateLabel, getWeekDates, toLocalDateString } from '../../utils/date'
import styles from './WeekStrip.module.css'

/**
 * 선택한 날짜가 속한 주(일~토)의 날짜 선택 바
 *
 * @param {string} selectedDate 선택된 날짜 'YYYY-MM-DD'
 * @param {string} today 오늘 날짜 'YYYY-MM-DD' (강조 표시용)
 * @param {(date: string) => void} onSelect 날짜 클릭 핸들러
 */
function WeekStrip({ selectedDate, today, onSelect, className = '', ...rest }) {
  return (
    <div
      className={[styles.strip, className].filter(Boolean).join(' ')}
      role="group"
      aria-label="날짜 선택"
      {...rest}
    >
      {getWeekDates(selectedDate).map((date) => {
        const value = toLocalDateString(date)
        const isSelected = value === selectedDate
        const isToday = value === today

        return (
          <button
            key={value}
            type="button"
            className={[
              styles.day,
              isSelected ? styles.selected : '',
              isToday ? styles.today : '',
            ]
              .filter(Boolean)
              .join(' ')}
            aria-pressed={isSelected}
            aria-current={isToday ? 'date' : undefined}
            aria-label={formatDateLabel(value)}
            onClick={() => onSelect(value)}
          >
            <span className={styles.weekday}>{WEEKDAY_LABELS[date.getDay()]}</span>
            <span className={styles.date}>{date.getDate()}</span>
          </button>
        )
      })}
    </div>
  )
}

export default WeekStrip
