import { ChevronLeftIcon, ChevronRightIcon } from '../../components/ui/Icons'
import {
  WEEKDAY_LABELS,
  addDays,
  formatDateLabel,
  formatWeekRange,
  getWeekDates,
  toLocalDateString,
} from '../../utils/date'
import styles from './WeekStrip.module.css'

/**
 * 선택한 날짜가 속한 주(일~토)의 날짜 선택 바 + 주 이동
 *
 * @param {string} selectedDate 선택된 날짜 'YYYY-MM-DD'
 * @param {string} today 오늘 날짜 'YYYY-MM-DD' (강조 표시용)
 * @param {(date: string) => void} onSelect 날짜 클릭·주 이동 핸들러
 * @param {Set<string>} markedDates 일정이 있어 점을 찍을 날짜 (없으면 점 없음)
 * @param {string} min 주 이동으로 갈 수 있는 첫날 (케어 시작일, 없으면 제한 없음)
 * @param {string} max 주 이동으로 갈 수 있는 마지막 날 (케어 종료일, 없으면 제한 없음)
 */
function WeekStrip({
  selectedDate,
  today,
  onSelect,
  markedDates,
  min,
  max,
  className = '',
  ...rest
}) {
  const dates = getWeekDates(selectedDate)
  const weekStart = toLocalDateString(dates[0])
  const weekEnd = toLocalDateString(dates[6])

  // 'YYYY-MM-DD'는 문자열 비교가 날짜 비교와 같다. 기간 밖 주에 있어도 기간 쪽으로는 돌아갈 수 있다
  const canPrev = !min || weekStart > min
  const canNext = !max || weekEnd < max

  // 같은 요일로 한 주 이동하되, 케어 기간을 넘으면 기간 끝 날짜로 맞춘다
  const moveWeek = (step) => {
    let next = addDays(selectedDate, step * 7)
    if (min && next < min) next = min
    if (max && next > max) next = max
    onSelect(next)
  }

  return (
    <div
      className={[styles.strip, className].filter(Boolean).join(' ')}
      role="group"
      aria-label="날짜 선택"
      {...rest}
    >
      <div className={styles.head}>
        <button
          type="button"
          className={styles.nav}
          onClick={() => moveWeek(-1)}
          disabled={!canPrev}
          aria-label="이전 주"
        >
          <ChevronLeftIcon className={styles.navIcon} />
        </button>
        <p className={styles.range} aria-live="polite">
          {formatWeekRange(dates[0], dates[6])}
        </p>
        <button
          type="button"
          className={styles.nav}
          onClick={() => moveWeek(1)}
          disabled={!canNext}
          aria-label="다음 주"
        >
          <ChevronRightIcon className={styles.navIcon} />
        </button>
      </div>

      <div className={styles.days}>
        {dates.map((date) => {
          const value = toLocalDateString(date)
          const isSelected = value === selectedDate
          const isToday = value === today
          const isMarked = markedDates?.has(value) ?? false

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
              aria-label={`${formatDateLabel(value)}${isMarked ? ', 일정 있음' : ''}`}
              onClick={() => onSelect(value)}
            >
              <span className={styles.weekday}>{WEEKDAY_LABELS[date.getDay()]}</span>
              <span className={styles.date}>{date.getDate()}</span>
              {/* 점 자리는 항상 두어 점 유무로 칸 높이가 흔들리지 않게 한다 */}
              <span
                className={[styles.dot, isMarked ? styles.dotOn : ''].filter(Boolean).join(' ')}
                aria-hidden="true"
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default WeekStrip
