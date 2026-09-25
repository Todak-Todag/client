import { InfoIcon } from '../../components/ui/Icons'
import { WEEKDAY_LABELS, parseLocalDateTime } from '../../utils/date'
import styles from './CareEndNotice.module.css'

/**
 * 케어 종료 예정일 안내 띠
 *
 * @param {string} finishDate Care Plan 종료일 'YYYY-MM-DD'
 * @param {string} today 오늘 'YYYY-MM-DD' (다른 달이면 월까지 표시)
 */
function CareEndNotice({ finishDate, today, className = '', ...rest }) {
  const date = parseLocalDateTime(finishDate)
  const sameMonth = finishDate.slice(0, 7) === today.slice(0, 7)
  const day = `${sameMonth ? '' : `${date.getMonth() + 1}월 `}${date.getDate()}일`

  return (
    <p className={[styles.notice, className].filter(Boolean).join(' ')} {...rest}>
      <InfoIcon className={styles.icon} />
      <span>
        {day} {WEEKDAY_LABELS[date.getDay()]}요일 케어 종료 예정
      </span>
    </p>
  )
}

export default CareEndNotice
