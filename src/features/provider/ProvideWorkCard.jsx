import Button from '../../components/ui/Button'
import { WEEKDAY_LABELS } from '../../utils/date'
import styles from './ProvideWorkCard.module.css'

// 서버 day(1=월 ~ 7=일)를 WEEKDAY_LABELS(0=일 ~ 6=토) 기준으로 바꾼다
const toLabel = (day) => WEEKDAY_LABELS[day % 7]

/**
 * 제공 가능 일정 카드 — 같은 서비스, 같은 시간대의 여러 요일을 한 장으로 묶는다
 *
 * @param {object} group { serviceName, startedAt, finishedAt, works: [] }
 */
function ProvideWorkCard({ group, onEdit }) {
  const days = group.works.map((work) => work.day).sort((a, b) => a - b)

  return (
    <article className={styles.card}>
      <div className={styles.head}>
        <span className={styles.service}>{group.serviceName ?? '서비스'}</span>
        <Button size="sm" variant="ghost" block={false} onClick={() => onEdit(group)}>
          수정
        </Button>
      </div>

      <p className={styles.line}>
        서비스 시간 : {group.startedAt} ~ {group.finishedAt}
      </p>

      <p className={styles.line}>
        제공 요일 :{' '}
        {days.map((day) => (
          <span key={day} className={styles.day}>
            {toLabel(day)}
          </span>
        ))}
      </p>
    </article>
  )
}

export default ProvideWorkCard
