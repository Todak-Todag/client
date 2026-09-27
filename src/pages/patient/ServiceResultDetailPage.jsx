import { useParams } from 'react-router-dom'
import EmptyState from '../../components/common/EmptyState'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { AlertIcon } from '../../components/ui/Icons'
import { getScheduleBadge } from '../../features/schedule/scheduleStatus'
import {
  getServiceResultDetailErrorMessage,
  isServiceResultGone,
} from '../../features/service-result/serviceResultErrors'
import { useServiceResultDetail } from '../../features/service-result/useServiceResults'
import SubPageLayout from '../../layouts/SubPageLayout'
import { formatMonthDay, formatTimeRange } from '../../utils/date'
import layout from './CarePlanPage.module.css'
import card from './ScheduleDetailPage.module.css'
import styles from './ServiceResult.module.css'

/**
 * 수행 결과 상세
 * 배지는 일정 상세와 같은 규칙(getScheduleBadge)을 써서, 같은 일정이 화면마다 다른 색으로 보이지 않게 한다.
 */
function ServiceResultDetailPage() {
  const { serviceResultId } = useParams()
  const detail = useServiceResultDetail(serviceResultId)

  const renderBody = () => {
    if (detail.status === 'loading') {
      return (
        <>
          <div className={`${card.card} ${styles.skeletonCard}`} aria-hidden="true">
            <span className={`${styles.block} ${styles.blockTitle}`} />
            <span className={`${styles.block} ${styles.blockLine}`} />
            <span className={`${styles.block} ${styles.blockLine}`} />
          </div>
          <p className={layout.srOnly} role="status">
            수행 결과를 불러오는 중이에요
          </p>
        </>
      )
    }

    if (detail.status === 'error') {
      return (
        <EmptyState
          icon={AlertIcon}
          tone="error"
          title="수행 결과를 불러오지 못했어요"
          description={getServiceResultDetailErrorMessage(detail.error)}
          action={
            isServiceResultGone(detail.error) ? null : (
              <Button variant="secondary" size="md" block={false} onClick={detail.reload}>
                다시 불러오기
              </Button>
            )
          }
        />
      )
    }

    const { data } = detail
    const badge = data.scheduleStatus ? getScheduleBadge({ status: data.scheduleStatus }) : null

    return (
      <section className={card.card} aria-labelledby="result-title">
        <div className={card.head}>
          <h2 id="result-title" className={card.title}>
            {data.serviceName ?? '케어 서비스'}
          </h2>
          {badge && <Badge variant={badge.variant}>{badge.label}</Badge>}
        </div>

        <dl className={card.rows}>
          <div className={card.row}>
            <dt>날짜</dt>
            <dd>{formatMonthDay(data.startedAt.slice(0, 10))}</dd>
          </div>
          <div className={card.row}>
            <dt>수행 시간</dt>
            <dd>{formatTimeRange(data.startedAt, data.finishedAt)}</dd>
          </div>
        </dl>

        <div className={card.description}>
          <p className={card.descriptionLabel}>수행 특이사항</p>
          <p className={card.descriptionText}>{data.note || '남긴 특이사항이 없어요.'}</p>
        </div>
      </section>
    )
  }

  return (
    <SubPageLayout title="수행 결과 상세">
      <div className={styles.page} aria-busy={detail.status === 'loading'}>
        {renderBody()}
      </div>
    </SubPageLayout>
  )
}

export default ServiceResultDetailPage
