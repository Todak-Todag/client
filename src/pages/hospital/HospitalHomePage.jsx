import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { getErrorMessage } from '../../api/client'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/common/EmptyState'
import { AlertIcon, UserIcon } from '../../components/ui/Icons'
import DischargeCard from '../../features/hospital/DischargeCard'
import ProfileCard, {
  ProfileCardSkeleton,
} from '../../features/auth/ProfileCard'
import { useAuth } from '../../features/auth/useAuth'
import { completeDischarge } from '../../api/endpoints/discharge'
import DischargeCompleteSheet from '../../features/hospital/DischargeCompleteSheet'
import { useRecentDischarges } from '../../features/hospital/useDischarges'
import { HOSPITAL_PATHS, PATHS } from '../../constants/paths'
import styles from './HospitalHomePage.module.css'

/* TODO: 안내 문구 표시 방식 정리 */
function HospitalHomePage() {
  const navigate = useNavigate()
  // 등록 화면에서 넘어올 때만 들어 있다 (새로고침하면 사라진다)
  const notice = useLocation().state?.notice
  const me = useAuth()
  const discharges = useRecentDischarges()
  const [completeTarget, setCompleteTarget] = useState(null)
  const [completing, setCompleting] = useState(false)
  const [completeError, setCompleteError] = useState('')

  // 비로그인이면 로그인 화면으로 (다른 오류는 아래에서 다시 시도할 수 있게 둔다)
  if (me.status === 'error' && me.error?.status === 401) {
    return <Navigate to={PATHS.login} replace />
  }

  const renderProfile = () => {
    if (me.status === 'loading') return <ProfileCardSkeleton />

    if (me.status === 'error') {
      return (
        <EmptyState
          tone="error"
          icon={AlertIcon}
          title="내 정보를 불러오지 못했어요"
          description={getErrorMessage(me.error)}
        />
      )
    }

    return <ProfileCard name={me.data.name} />
  }

  /** 퇴원 완료 처리 후 목록을 다시 불러와 카드가 '작성하기'로 바뀌게 한다 */
  const handleComplete = async (actualDate) => {
    setCompleting(true)
    setCompleteError('')

    try {
      await completeDischarge(completeTarget.dischargeId, { actualDate })
      setCompleteTarget(null)
      discharges.reload()
    } catch (caught) {
      setCompleteError(getErrorMessage(caught))
    } finally {
      setCompleting(false)
    }
  }

  const renderDischarges = () => {
    if (discharges.status === 'loading') {
      return (
        <p className={styles.state} role="status">
          연계 환자를 불러오는 중이에요…
        </p>
      )
    }

    if (discharges.status === 'error') {
      return (
        <EmptyState
          tone="error"
          icon={AlertIcon}
          title="연계 환자를 불러오지 못했어요"
          description={getErrorMessage(discharges.error)}
          action={
            <Button
              variant="outline"
              size="md"
              block={false}
              onClick={discharges.reload}
            >
              다시 시도
            </Button>
          }
        />
      )
    }

    if (discharges.data.length === 0) {
      return (
        <EmptyState
          icon={UserIcon}
          title="아직 등록한 퇴원 예정자가 없어요"
          description="퇴원 예정자를 등록하면 여기에 표시돼요."
        />
      )
    }

    return (
      <ul className={styles.list}>
        {discharges.data.map((discharge) => (
          <li key={discharge.dischargeId}>
            <DischargeCard
              discharge={discharge}
              onWrite={() =>
                navigate(HOSPITAL_PATHS.carePlanNew, {
                  state: {
                    patientId: discharge.patientId,
                    dischargeId: discharge.dischargeId,
                  },
                })
              }
              onComplete={setCompleteTarget}
            />
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.srOnly}>병원 담당자 홈</h1>

      {notice && (
        <p className={styles.notice} role="status">
          {notice}
        </p>
      )}

      {renderProfile()}

      <section className={styles.section} aria-labelledby="recent-patients">
        <div className={styles.sectionHead}>
          <h2 id="recent-patients" className={styles.sectionTitle}>
            최근 연계 환자
          </h2>
          <button
            type="button"
            className={styles.addButton}
            onClick={() => navigate(HOSPITAL_PATHS.patientNew)}
          >
            퇴원 예정자 등록 +
          </button>
        </div>

        {renderDischarges()}
      </section>

      <DischargeCompleteSheet
        key={completeTarget?.dischargeId}
        discharge={completeTarget}
        submitting={completing}
        error={completeError}
        onClose={() => setCompleteTarget(null)}
        onSubmit={handleComplete}
      />
    </div>
  )
}

export default HospitalHomePage
