import { Navigate } from 'react-router-dom'
import { getErrorMessage } from '../../api/client'
import EmptyState from '../../components/common/EmptyState'
import { AlertIcon, UserIcon } from '../../components/ui/Icons'
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

/*
 * TODO: 퇴원 예정자 등록 화면, todak-todag 작성 화면 연결
 * TODO: 서버에 퇴원건이 쌓이면 DUMMY_DISCHARGES를 useRecentDischarges()로 교체
 *       (features/hospital/useDischarges.js에 GET /discharges 연동이 준비돼 있다)
 */
function HospitalHomePage() {
  const me = useAuth()
  const discharges = DUMMY_DISCHARGES

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

  const renderDischarges = () => {
    if (discharges.length === 0) {
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
        {discharges.map((discharge) => (
          <li key={discharge.dischargeId}>
            <DischargeCard
              discharge={discharge}
              // 서버가 환자 이름·나이·성별·작성여부를 주지 않아 임시 값으로 채운다
              patient={getDummyPatient(discharge.patientId)}
              // TODO: todak-todag 작성 화면이 생기면 연결
              onWrite={() => {}}
            />
          </li>
        ))}
      </ul>
    )
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

        {renderDischarges()}
      </section>
    </div>
  )
}

export default HospitalHomePage
