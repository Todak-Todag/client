import { Navigate } from 'react-router-dom'
import { getErrorMessage } from '../../api/client'
import EmptyState from '../../components/common/EmptyState'
import { AlertIcon } from '../../components/ui/Icons'
import ProfileCard, {
  ProfileCardSkeleton,
} from '../../features/auth/ProfileCard'
import { useAuth } from '../../features/auth/useAuth'
import { PATHS } from '../../constants/paths'
import styles from './HospitalHomePage.module.css'

/* TODO: 최근 연계 환자 목록, 퇴원 예정자 등록 */
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
    </div>
  )
}

export default HospitalHomePage
