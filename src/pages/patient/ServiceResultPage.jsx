import { Link } from 'react-router-dom'
import { getErrorMessage } from '../../api/client'
import EmptyState from '../../components/common/EmptyState'
import Button from '../../components/ui/Button'
import { AlertIcon, ChevronRightIcon, ClockIcon, DocumentIcon } from '../../components/ui/Icons'
import { useServiceResults } from '../../features/service-result/useServiceResults'
import SubPageLayout from '../../layouts/SubPageLayout'
import { PATHS, toPath } from '../../constants/paths'
import { formatMonthDay, formatTimeRange } from '../../utils/date'
import layout from './CarePlanPage.module.css'
import styles from './ServiceResult.module.css'

const SKELETON_ROWS = 3

/** 서비스 수행 결과 목록 — 날짜와 수행 시간만 보여주고 상세로 이동한다 */
function ServiceResultPage() {
  const results = useServiceResults()

  const renderBody = () => {
    if (results.status === 'loading') {
      return (
        <>
          <ul className={styles.rows} aria-hidden="true">
            {Array.from({ length: SKELETON_ROWS }, (_, index) => (
              <li key={index} className={`${styles.row} ${styles.skeletonRow}`}>
                <span className={`${styles.block} ${styles.blockDate}`} />
                <span className={`${styles.block} ${styles.blockTime}`} />
              </li>
            ))}
          </ul>
          <p className={layout.srOnly} role="status">
            수행 결과를 불러오는 중이에요
          </p>
        </>
      )
    }

    if (results.status === 'error') {
      return (
        <EmptyState
          icon={AlertIcon}
          tone="error"
          title="수행 결과를 불러오지 못했어요"
          description={getErrorMessage(results.error)}
          action={
            <Button variant="secondary" size="md" block={false} onClick={results.reload}>
              다시 불러오기
            </Button>
          }
        />
      )
    }

    if (results.data.length === 0) {
      return (
        <EmptyState
          icon={DocumentIcon}
          title="아직 수행 결과가 없어요"
          description="서비스를 받은 뒤 제공자가 결과를 기록하면 여기에서 볼 수 있어요."
        />
      )
    }

    return (
      <ul className={styles.rows}>
        {results.data.map((result) => {
          const date = formatMonthDay(result.startedAt.slice(0, 10))
          const time = formatTimeRange(result.startedAt, result.finishedAt)

          return (
            <li key={result.serviceResultId} className={styles.row}>
              <Link
                to={toPath(PATHS.myResultDetail, { serviceResultId: result.serviceResultId })}
                className={styles.link}
              >
                <span className={styles.body}>
                  <span className={styles.date}>{date}</span>
                  <span className={styles.time}>
                    <ClockIcon className={styles.timeIcon} />
                    <span className={layout.srOnly}>수행 시간</span>
                    {time}
                  </span>
                </span>
                <ChevronRightIcon className={styles.chevron} />
              </Link>
            </li>
          )
        })}
      </ul>
    )
  }

  return (
    <SubPageLayout title="서비스 수행 결과">
      <div className={styles.page} aria-busy={results.status === 'loading'}>
        <p className={layout.leadText}>서비스 제공자가 기록한 수행 결과예요.</p>
        {renderBody()}
      </div>
    </SubPageLayout>
  )
}

export default ServiceResultPage
