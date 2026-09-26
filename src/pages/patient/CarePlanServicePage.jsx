import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import {
  createServicePreference,
  deleteServicePreference,
  getCarePlanService,
  removeCarePlanService,
  updateServicePreference,
} from '../../api/endpoints/carePlan'
import EmptyState from '../../components/common/EmptyState'
import Button from '../../components/ui/Button'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { AlertIcon, CalendarIcon, InfoIcon, PlusIcon } from '../../components/ui/Icons'
import { ScheduleCardSkeleton } from '../../features/schedule/ScheduleCard'
import PreferenceSheet from '../../features/care-plan/PreferenceSheet'
import { useCarePlanService } from '../../features/care-plan/useCarePlan'
import {
  CARE_PLAN_ERROR,
  getCarePlanErrorMessage,
  isCarePlanGone,
} from '../../features/care-plan/carePlanErrors'
import SubPageLayout from '../../layouts/SubPageLayout'
import { PATHS, toPath } from '../../constants/paths'
import {
  CARE_PLAN_STATUS,
  PREFERRED_TIME_SLOT,
  PREFERRED_TIME_SLOT_LABEL,
} from '../../constants/status'
import { addDays, formatMonthDay, toLocalDateString } from '../../utils/date'
import { withParticle } from '../../utils/korean'
import cardStyles from '../../features/care-plan/CarePlanReview.module.css'
import styles from './CarePlanPage.module.css'

const SLOT_ORDER = [PREFERRED_TIME_SLOT.MORNING, PREFERRED_TIME_SLOT.AFTERNOON]

/** 날짜 → 시간대(오전 먼저) 순 */
const sortPreferences = (preferences) =>
  [...preferences].sort(
    (a, b) =>
      a.preferredDate.localeCompare(b.preferredDate) ||
      SLOT_ORDER.indexOf(a.preferredTimeSlot) - SLOT_ORDER.indexOf(b.preferredTimeSlot),
  )

const formatPreference = (preference) =>
  `${formatMonthDay(preference.preferredDate)} · ${PREFERRED_TIME_SLOT_LABEL[preference.preferredTimeSlot]}`

/**
 * 희망 일정을 고를 수 있는 기간.
 * 서버 규칙: 오늘 이후(내일부터) · 케어 시작일 이후 · 케어 종료일까지
 */
function getSelectableRange(carePlan) {
  const tomorrow = addDays(toLocalDateString(), 1)
  const min = carePlan.startDate && carePlan.startDate > tomorrow ? carePlan.startDate : tomorrow
  return { min, max: carePlan.finishDate }
}

/** 서비스 상세: 희망 일정 추가·수정·삭제, 서비스 빼기 (UNDER_REVIEW 전용) */
function CarePlanServicePage() {
  const navigate = useNavigate()
  const { carePlanId, planServiceId } = useParams()
  const detail = useCarePlanService(carePlanId, planServiceId)

  // 일정을 바꾼 뒤에는 화면 전체를 다시 로딩하지 않고 서비스만 다시 받아 덮어쓴다
  const [freshService, setFreshService] = useState(null)
  // 시트: null(닫힘) | { editing: 수정할 일정 | null }
  const [sheet, setSheet] = useState(null)
  const [removed, setRemoved] = useState(null) // 되돌리기용으로 방금 지운 일정
  const [restoring, setRestoring] = useState(false)
  const [listError, setListError] = useState(null)

  const [removeOpen, setRemoveOpen] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [removeError, setRemoveError] = useState(null)

  const planPath = toPath(PATHS.carePlan, { carePlanId })

  if (detail.status === 'error' && detail.error?.status === 401) {
    return <Navigate to={PATHS.login} replace />
  }

  if (detail.status === 'success' && detail.data.carePlan.status !== CARE_PLAN_STATUS.UNDER_REVIEW) {
    return <Navigate to={PATHS.home} replace />
  }

  const refresh = async () => {
    setFreshService(await getCarePlanService(carePlanId, planServiceId))
  }

  const savePreference = async (value) => {
    if (sheet.editing) {
      await updateServicePreference(sheet.editing.servicePreferenceId, value)
    } else {
      await createServicePreference(planServiceId, value)
    }
    await refresh()
    setRemoved(null)
    setSheet(null)
  }

  // 되돌릴 수 있는 삭제라 확인창 없이 바로 지우고, 되돌리기를 준다
  const deletePreference = async (preference) => {
    const service = freshService ?? detail.data.service
    setListError(null)
    setFreshService({
      ...service,
      preferences: service.preferences.filter(
        (item) => item.servicePreferenceId !== preference.servicePreferenceId,
      ),
    })
    try {
      await deleteServicePreference(preference.servicePreferenceId)
      setRemoved(preference)
    } catch (caught) {
      setFreshService(service)
      setListError(`${formatPreference(preference)} 일정을 지우지 못했어요. ${getCarePlanErrorMessage(caught)}`)
    }
  }

  const restorePreference = async () => {
    setRestoring(true)
    try {
      await createServicePreference(planServiceId, {
        preferredDate: removed.preferredDate,
        preferredTimeSlot: removed.preferredTimeSlot,
      })
      await refresh()
      setRemoved(null)
    } catch (caught) {
      setListError(`일정을 되돌리지 못했어요. ${getCarePlanErrorMessage(caught)}`)
    } finally {
      setRestoring(false)
    }
  }

  const removeService = async () => {
    setRemoving(true)
    setRemoveError(null)
    try {
      await removeCarePlanService(planServiceId)
      // 마지막 서비스였다면 케어플랜이 종료됐으므로 홈에서 바뀐 상태를 보여준다
      navigate(detail.data.isLastService ? PATHS.home : planPath, { replace: true })
    } catch (caught) {
      setRemoveError(getCarePlanErrorMessage(caught))
      setRemoving(false)
    }
  }

  const renderBody = () => {
    if (detail.status === 'loading') {
      return (
        <>
          <p className={styles.srOnly} role="status">
            서비스 정보를 불러오는 중이에요
          </p>
          <ScheduleCardSkeleton description />
          <ScheduleCardSkeleton />
        </>
      )
    }

    if (detail.status === 'error') {
      return (
        <EmptyState
          tone="error"
          icon={AlertIcon}
          title="서비스 정보를 불러오지 못했어요"
          description={getCarePlanErrorMessage(detail.error)}
          action={
            isCarePlanGone(detail.error) ? (
              // 서비스만 빠졌으면 케어플랜 확인으로, 케어플랜 자체가 없으면 홈으로
              <Button
                variant="outline"
                size="md"
                block={false}
                onClick={() =>
                  navigate(
                    detail.error.code === CARE_PLAN_ERROR.CARE_PLAN_SERVICE_NOT_FOUND
                      ? planPath
                      : PATHS.home,
                    { replace: true },
                  )
                }
              >
                {detail.error.code === CARE_PLAN_ERROR.CARE_PLAN_SERVICE_NOT_FOUND
                  ? '케어플랜으로'
                  : '홈으로'}
              </Button>
            ) : (
              <Button variant="outline" size="md" block={false} onClick={detail.reload}>
                다시 시도
              </Button>
            )
          }
        />
      )
    }

    const { carePlan, isLastService } = detail.data
    const service = freshService ?? detail.data.service
    const preferences = sortPreferences(service.preferences ?? [])
    const range = getSelectableRange(carePlan)
    // 남은 기간이 없으면(내일이 종료일 뒤) 더 추가할 수 없다
    const canAdd = Boolean(range.max) && range.min <= range.max

    return (
      <>
        <section className={cardStyles.card} aria-labelledby="service-title">
          <h2 id="service-title" className={styles.heroTitle}>
            {service.provideServiceName}
          </h2>
          {service.provideServiceContent && (
            <div className={cardStyles.inset}>
              <p className={cardStyles.insetLabel}>서비스 내용</p>
              <p className={cardStyles.insetText}>{service.provideServiceContent}</p>
            </div>
          )}
        </section>

        <section className={styles.section} aria-labelledby="preferences-title">
          <div className={styles.sectionHead}>
            <h2 id="preferences-title" className={styles.sectionTitle}>
              희망 일정
            </h2>
            <p className={styles.sectionCount}>{preferences.length}건</p>
          </div>

          {preferences.length === 0 ? (
            <p className={styles.emptyLine}>
              아직 희망 일정이 없어요. 희망 일정이 있어야 서비스 제공자를 찾을 수 있어요.
            </p>
          ) : (
            <ul className={styles.preferenceList}>
              {preferences.map((preference) => (
                <li key={preference.servicePreferenceId} className={styles.preference}>
                  <CalendarIcon className={styles.preferenceIcon} />
                  <span className={styles.preferenceText}>{formatPreference(preference)}</span>
                  <span className={styles.preferenceActions}>
                    <button
                      type="button"
                      className={`${styles.textButton} ${styles.textButtonPrimary}`}
                      onClick={() => setSheet({ editing: preference })}
                      aria-label={`${formatPreference(preference)} 수정`}
                    >
                      수정
                    </button>
                    <button
                      type="button"
                      className={styles.textButton}
                      onClick={() => deletePreference(preference)}
                      aria-label={`${formatPreference(preference)} 삭제`}
                    >
                      삭제
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}

          {removed && (
            <p className={styles.undo} role="status">
              <span>{formatPreference(removed)} 일정을 지웠어요.</span>
              <button
                type="button"
                className={styles.undoButton}
                onClick={restorePreference}
                disabled={restoring}
              >
                되돌리기
              </button>
            </p>
          )}

          {listError && (
            <p className={styles.error} role="alert">
              {listError}
            </p>
          )}

          <Button
            variant="dashed"
            size="md"
            onClick={() => setSheet({ editing: null })}
            disabled={!canAdd}
          >
            <PlusIcon className={styles.plusIcon} />
            희망 일정 추가
          </Button>

          <p className={styles.note}>
            <InfoIcon className={styles.noteIcon} />
            <span>
              {canAdd
                ? `희망 일정은 ${formatMonthDay(range.min, { weekday: false })}부터 케어 종료일(${formatMonthDay(range.max, { weekday: false })})까지, 오전 또는 오후로 고를 수 있어요.`
                : '남은 케어 기간이 없어 희망 일정을 더 추가할 수 없어요.'}
            </span>
          </p>
        </section>

        <div className={styles.dangerZone}>
          <Button variant="danger" size="md" onClick={() => setRemoveOpen(true)}>
            이 서비스 빼기
          </Button>
          <p className={styles.actionNote}>
            {isLastService
              ? '남은 서비스가 이것 하나라 빼면 케어플랜이 종료돼요.'
              : '마지막 남은 서비스를 빼면 케어플랜이 종료돼요.'}
          </p>
        </div>

        {sheet && (
          <PreferenceSheet
            key={sheet.editing?.servicePreferenceId ?? 'new'}
            serviceName={service.provideServiceName}
            min={range.min}
            max={range.max}
            editing={sheet.editing}
            existing={preferences}
            onSubmit={savePreference}
            onClose={() => setSheet(null)}
          />
        )}

        <ConfirmDialog
          open={removeOpen}
          tone="danger"
          title={isLastService ? '케어플랜을 종료할까요?' : '이 서비스를 뺄까요?'}
          description={
            isLastService
              ? `${withParticle(service.provideServiceName, '은', '는')} 남은 마지막 서비스예요. 빼면 케어플랜이 종료되고 되돌릴 수 없어요.`
              : preferences.length > 0
                ? `${withParticle(service.provideServiceName, '과', '와')} 희망 일정 ${preferences.length}건이 케어플랜에서 빠져요.`
                : `${withParticle(service.provideServiceName, '이', '가')} 케어플랜에서 빠져요.`
          }
          confirmLabel={isLastService ? '빼고 종료하기' : '빼기'}
          loading={removing}
          error={removeError}
          onConfirm={removeService}
          onCancel={() => {
            setRemoveOpen(false)
            setRemoveError(null)
          }}
        />
      </>
    )
  }

  return (
    <SubPageLayout title="서비스 상세">
      <div className={styles.page} aria-busy={detail.status === 'loading'}>
        {renderBody()}
      </div>
    </SubPageLayout>
  )
}

export default CarePlanServicePage
