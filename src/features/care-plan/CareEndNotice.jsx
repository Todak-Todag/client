import { InfoIcon } from '../../components/ui/Icons'
import { formatMonthDay } from '../../utils/date'
import styles from './CareEndNotice.module.css'

/**
 * 케어 종료 예정일 안내 띠
 *
 * 일정 화면의 날짜 제목('8월 27일 (목)')과 같은 형식으로 보여준다.
 *
 * @param {string} finishDate Care Plan 종료일 'YYYY-MM-DD'
 */
function CareEndNotice({ finishDate, className = '', ...rest }) {
  return (
    <p className={[styles.notice, className].filter(Boolean).join(' ')} {...rest}>
      <InfoIcon className={styles.icon} />
      <span>
        {formatMonthDay(finishDate)} 케어 종료 예정
      </span>
    </p>
  )
}

export default CareEndNotice
