import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { updateCarePlanStatus } from '../../api/endpoints/carePlan'
import EmptyState from '../../components/common/EmptyState'
import Button from '../../components/ui/Button'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { AlertIcon, ListIcon, PlusIcon } from '../../components/ui/Icons'
import { ScheduleCardSkeleton } from '../../features/schedule/ScheduleCard'
import CarePlanSummaryCard from '../../features/care-plan/CarePlanSummaryCard'
import PlanServiceItem from '../../features/care-plan/PlanServiceItem'
import { useCarePlanReview } from '../../features/care-plan/useCarePlan'
import { getCarePlanErrorMessage, isCarePlanGone } from '../../features/care-plan/carePlanErrors'
import SubPageLayout from '../../layouts/SubPageLayout'
import { PATHS, toPath } from '../../constants/paths'
import { CARE_PLAN_STATUS } from '../../constants/status'
import styles from './CarePlanPage.module.css'

/** 케어플랜 확인: 선택한 서비스와 희망 일정을 살펴보고 확정한다 (UNDER_REVIEW 전용) */
function CarePlanReviewPage() {
  const navigate = useNavigate()
  const { carePlanId } = useParams()
  const review = useCarePlanReview(carePlanId)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [confirmError, setConfirmError] = useState(null)

  if (review.status === 'error' && review.error?.status === 401) {
    return <Navigate to={PATHS.login} replace />
  }

  // 확정됐거나 종료된 케어플랜은 더 바꿀 수 없으니 홈에서 현재 상태를 보여준다
  if (review.status === 'success' && review.data.carePlan.status !== CARE_PLAN_STATUS.UNDER_REVIEW) {
    return <Navigate to={PATHS.home} replace />
  }

  const confirm = async () => {
    setConfirming(true)
    setConfirmError(null)
    try {
      await updateCarePlanStatus(carePlanId, CARE_PLAN_STATUS.CONFIRMED)
      navigate(PATHS.home, { replace: true })
    } catch (caught) {
      setConfirmError(getCarePlanErrorMessage(caught))
      setConfirming(false)
    }
  }

  const renderBody = () => {
    if (review.status === 'loading') {
      return (
        <>
          <p className={styles.srOnly} role="status">
            케어플랜을 불러오는 중이에요
          </p>
          <ScheduleCardSkeleton description />
          <div className={styles.list}>
            <ScheduleCardSkeleton />
            <ScheduleCardSkeleton />
          </div>
        </>
      )
    }

    if (review.status === 'error') {
      return (
        <EmptyState
          tone="error"
          icon={AlertIcon}
          title="케어플랜을 불러오지 못했어요"
          description={getCarePlanErrorMessage(review.error)}
          action={
            // 없거나 내 것이 아닌 케어플랜은 다시 불러와도 같으니 홈으로 안내한다
            isCarePlanGone(review.error) ? (
              <Button
                variant="outline"
                size="md"
                block={false}
                onClick={() => navigate(PATHS.home, { replace: true })}
              >
                홈으로
              </Button>
            ) : (
              <Button variant="outline" size="md" block={false} onClick={review.reload}>
                다시 시도
              </Button>
            )
          }
        />
      )
    }

    const { carePlan, services } = review.data

    return (
      <>
        <CarePlanSummaryCard carePlan={carePlan} />

        <section className={styles.section} aria-labelledby="selected-services-title">
          <div className={styles.sectionHead}>
            <h2 id="selected-services-title" className={styles.sectionTitle}>
              선택한 서비스
            </h2>
            <p className={styles.sectionCount}>{services.length}개</p>
          </div>

          {services.length === 0 ? (
            <EmptyState
              icon={ListIcon}
              title="선택한 서비스가 없어요"
              description="받고 싶은 서비스를 추가해 주세요."
            />
          ) : (
            <ul className={styles.list}>
              {services.map((service) => (
                <li key={service.planServiceId}>
                  <PlanServiceItem
                    name={service.provideServiceName}
                    preferenceCount={service.preferenceCount}
                    onClick={() =>
                      navigate(
                        toPath(PATHS.carePlanService, {
                          carePlanId,
                          planServiceId: service.planServiceId,
                        }),
                      )
                    }
                  />
                </li>
              ))}
            </ul>
          )}

          {/* 새로 담는 동작은 홈 '서비스 추가 신청하기'와 같은 점선 버튼 */}
          <Button
            variant="dashed"
            size="md"
            onClick={() => navigate(toPath(PATHS.carePlanServiceNew, { carePlanId }))}
          >
            <PlusIcon className={styles.plusIcon} />
            서비스 추가
          </Button>
        </section>

        <div className={styles.actionBar}>
          <p className={styles.actionNote}>확정 후에는 서비스와 희망 일정을 바꿀 수 없어요.</p>
          <Button onClick={() => setConfirmOpen(true)} disabled={services.length === 0}>
            케어플랜 확정하기
          </Button>
        </div>

        <ConfirmDialog
          open={confirmOpen}
          title="케어플랜을 확정할까요?"
          description="확정하면 서비스와 희망 일정을 더 이상 바꿀 수 없어요. 확정과 동시에 희망 일정별로 서비스 제공자 매칭이 시작돼요."
          confirmLabel="확정하기"
          cancelLabel="다시 확인"
          loading={confirming}
          error={confirmError}
          onConfirm={confirm}
          onCancel={() => {
            setConfirmOpen(false)
            setConfirmError(null)
          }}
        >
          <UnscheduledWarning services={services} />
        </ConfirmDialog>
      </>
    )
  }

  return (
    <SubPageLayout title="케어플랜 확인">
      <div className={styles.page} aria-busy={review.status === 'loading'}>
        {renderBody()}
      </div>
    </SubPageLayout>
  )
}

/** 희망 일정이 없는 서비스는 매칭되지 않는다는 경고. 모두 있으면 그리지 않는다 */
function UnscheduledWarning({ services }) {
  const names = services
    .filter((service) => service.preferenceCount === 0)
    .map((service) => service.provideServiceName)

  if (names.length === 0) return null

  return (
    <p className={`${styles.note} ${styles.noteWarning}`}>
      <AlertIcon className={styles.noteIcon} />
      <span>희망 일정이 없는 서비스({names.join(', ')})는 매칭되지 않아요.</span>
    </p>
  )
}

export default CarePlanReviewPage
