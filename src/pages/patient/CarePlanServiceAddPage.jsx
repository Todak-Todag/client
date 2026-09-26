import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { addCarePlanService } from '../../api/endpoints/carePlan'
import EmptyState from '../../components/common/EmptyState'
import Button from '../../components/ui/Button'
import { AlertIcon, CheckIcon } from '../../components/ui/Icons'
import { ScheduleCardSkeleton } from '../../features/schedule/ScheduleCard'
import { useCarePlanServiceOptions } from '../../features/care-plan/useCarePlan'
import { getCarePlanErrorMessage, isCarePlanGone } from '../../features/care-plan/carePlanErrors'
import SubPageLayout from '../../layouts/SubPageLayout'
import { PATHS, toPath } from '../../constants/paths'
import { CARE_PLAN_STATUS } from '../../constants/status'
import styles from './CarePlanPage.module.css'

/** 서비스 추가: 아직 고르지 않은 서비스 하나를 케어플랜에 담는다 (UNDER_REVIEW 전용) */
function CarePlanServiceAddPage() {
  const navigate = useNavigate()
  const { carePlanId } = useParams()
  const options = useCarePlanServiceOptions(carePlanId)

  const [selectedId, setSelectedId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  if (options.status === 'error' && options.error?.status === 401) {
    return <Navigate to={PATHS.login} replace />
  }

  if (options.status === 'success' && options.data.carePlan.status !== CARE_PLAN_STATUS.UNDER_REVIEW) {
    return <Navigate to={PATHS.home} replace />
  }

  const submit = async () => {
    setSubmitting(true)
    setError(null)
    try {
      await addCarePlanService(carePlanId, selectedId)
      // 새 planServiceId는 응답에 없어 케어플랜 확인으로 돌아가 목록에서 이어서 고른다
      navigate(toPath(PATHS.carePlan, { carePlanId }), { replace: true })
    } catch (caught) {
      setError(getCarePlanErrorMessage(caught))
      setSubmitting(false)
    }
  }

  const renderBody = () => {
    if (options.status === 'loading') {
      return (
        <div className={styles.list}>
          <p className={styles.srOnly} role="status">
            서비스 목록을 불러오는 중이에요
          </p>
          <ScheduleCardSkeleton />
          <ScheduleCardSkeleton />
          <ScheduleCardSkeleton />
        </div>
      )
    }

    if (options.status === 'error') {
      return (
        <EmptyState
          tone="error"
          icon={AlertIcon}
          title="서비스 목록을 불러오지 못했어요"
          description={getCarePlanErrorMessage(options.error)}
          action={
            isCarePlanGone(options.error) ? (
              <Button
                variant="outline"
                size="md"
                block={false}
                onClick={() => navigate(PATHS.home, { replace: true })}
              >
                홈으로
              </Button>
            ) : (
              <Button variant="outline" size="md" block={false} onClick={options.reload}>
                다시 시도
              </Button>
            )
          }
        />
      )
    }

    const list = options.data.options

    if (list.every((option) => option.selected)) {
      return (
        <EmptyState
          icon={CheckIcon}
          title="모든 서비스를 이미 골랐어요"
          description="케어플랜 확인 화면에서 서비스별 희망 일정을 정해 주세요."
          action={
            <Button variant="outline" size="md" block={false} onClick={() => navigate(-1)}>
              케어플랜으로 돌아가기
            </Button>
          }
        />
      )
    }

    const selected = list.find((option) => option.provideServiceId === selectedId)

    return (
      <>
        <fieldset className={styles.options}>
          <legend className={styles.srOnly}>추가할 서비스</legend>
          {list.map((option) => (
            <label key={option.provideServiceId} className={styles.option}>
              <input
                type="radio"
                name="provideServiceId"
                value={option.provideServiceId}
                checked={selectedId === option.provideServiceId}
                disabled={option.selected}
                onChange={() => setSelectedId(option.provideServiceId)}
                className={styles.optionInput}
              />
              <span className={styles.radio} aria-hidden="true" />
              <span className={styles.optionBody}>
                <span className={styles.optionName}>{option.provideServiceName}</span>
                {option.content && <span className={styles.optionText}>{option.content}</span>}
              </span>
              {option.selected && <span className={styles.optionTag}>선택됨</span>}
            </label>
          ))}
        </fieldset>

        <div className={styles.actionBar}>
          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
          <Button onClick={submit} loading={submitting} disabled={!selected}>
            {selected ? `${selected.provideServiceName} 추가하기` : '추가할 서비스를 골라 주세요'}
          </Button>
        </div>
      </>
    )
  }

  return (
    <SubPageLayout title="서비스 추가">
      <div className={styles.page} aria-busy={options.status === 'loading'}>
        <div className={styles.lead}>
          <h2 className={styles.leadTitle}>추가할 서비스를 선택해 주세요</h2>
          <p className={styles.leadText}>이미 선택한 서비스는 다시 추가할 수 없어요.</p>
        </div>
        {renderBody()}
      </div>
    </SubPageLayout>
  )
}

export default CarePlanServiceAddPage
