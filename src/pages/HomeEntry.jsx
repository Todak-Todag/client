import { Navigate } from 'react-router-dom'
import PatientHomePage from './patient/HomePage'
import { useAuth } from '../features/auth/useAuth'
import { PATHS } from '../constants/paths'
import { getHomePathByRole } from '../constants/roles'

/**
 * '/' 진입 시 역할에 맞는 홈으로 보낸다.
 *
 * 로그인 직후에는 LoginPage가 역할을 보고 이동하지만,
 * 이미 로그인된 상태로 '/'에 직접 들어오면 갈라줄 곳이 없어 여기서 처리한다.
 */
function HomeEntry() {
  const me = useAuth()

  // 내 정보를 받기 전에는 아무것도 그리지 않는다 (잘못된 화면이 잠깐 보이지 않도록)
  if (me.status === 'loading') return null

  // 비로그인(401)이면 로그인 화면으로
  if (me.status === 'error') return <Navigate to={PATHS.login} replace />

  const homePath = getHomePathByRole(me.data.role)

  return homePath === PATHS.home ? <PatientHomePage /> : <Navigate to={homePath} replace />
}

export default HomeEntry
