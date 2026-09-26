import { Navigate } from 'react-router-dom'
import { getErrorMessage } from '../../api/client'
import EmptyState from '../../components/common/EmptyState'
import { AlertIcon } from '../../components/ui/Icons'
import DischargeCard from '../../features/hospital/DischargeCard'
import ProfileCard, {
  ProfileCardSkeleton,
} from '../../features/auth/ProfileCard'
import { useAuth } from '../../features/auth/useAuth'
import {
  DUMMY_DISCHARGES,
  getDummyPatient,
} from '../../dummy/dischargePatients'
import { PATHS } from '../../constants/paths'
import styles from './HospitalHomePage.module.css'

/* TODO: 목록을 GET /discharges 로 교체, 퇴원 예정자 등록 화면 연결 */
function HospitalHomePage() {
  const me = useAuth()

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

  return (
    <div className={styles.page}>
      <h1 className={styles.srOnly}>병원 담당자 홈</h1>

      {renderProfile()}

      <section className={styles.section} aria-labelledby="recent-patients">
        <div className={styles.sectionHead}>
          <h2 id="recent-patients" className={styles.sectionTitle}>
            최근 연계 환자
          </h2>
          <button
            type="button"
            className={styles.addButton}
            // TODO: 퇴원 예정자 등록 화면이 생기면 연결
            onClick={() => {}}
          >
            퇴원 예정자 등록 +
          </button>
        </div>

        <ul className={styles.list}>
          {DUMMY_DISCHARGES.map((discharge) => (
            <li key={discharge.dischargeId}>
              <DischargeCard
                discharge={discharge}
                patient={getDummyPatient(discharge.patientId)}
                // TODO: todak-todag 작성 화면이 생기면 연결
                onWrite={() => {}}
              />
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

export default HospitalHomePage
