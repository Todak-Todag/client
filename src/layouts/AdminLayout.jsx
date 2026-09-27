import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { getErrorMessage } from '../api/client'
import Button from '../components/ui/Button'
import EmptyState from '../components/common/EmptyState'
import Header, { HeaderSpacer } from '../components/layout/Header'
import Navbar, { NavbarSpacer } from '../components/layout/Navbar'
import { ADMIN_NAV_ITEMS } from '../components/layout/adminNavItems'
import { AlertIcon } from '../components/ui/Icons'
import { useAuth } from '../features/auth/useAuth'
import {
  ADMIN_NAV_PATH_BY_KEY,
  ADMIN_PATHS,
  ADMIN_TITLE_BY_PATH,
  PATHS,
  getAdminNavKeyByPath,
} from '../constants/paths'
import { isAdminRole } from '../constants/roles'
import styles from './AppLayout.module.css'

/**
 * 운영자·관리자 화면의 접근 제어 + 공통 헤더/네브바
 *
 * 서버가 @PreAuthorize로 이미 막고 있으므로 역할 확인은 보안 장치가 아니라,
 * 권한 없는 사용자에게 빈 관리자 화면을 보여주지 않기 위한 것이다.
 */
function AdminLayout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const me = useAuth()

  // 역할을 알기 전에는 아무것도 그리지 않는다 (잘못된 화면이 잠깐 보이지 않도록)
  if (me.status === 'loading') return null

  if (me.status === 'error') {
    // 비로그인이면 로그인 화면으로
    if (me.error?.status === 401) return <Navigate to={PATHS.login} replace />

    // 일시적인 오류까지 로그아웃처럼 처리하면 관리자가 갇힌다
    return (
      <div className={styles.layout}>
        <main className={styles.content}>
          <EmptyState
            tone="error"
            icon={AlertIcon}
            title="내 정보를 불러오지 못했어요"
            description={getErrorMessage(me.error)}
            action={
              <Button variant="outline" size="md" block={false} onClick={me.reload}>
                다시 시도
              </Button>
            }
          />
        </main>
      </div>
    )
  }

  if (!isAdminRole(me.data.role)) return <Navigate to={PATHS.home} replace />

  return (
    <div className={styles.layout}>
      <Header
        title={ADMIN_TITLE_BY_PATH[pathname] ?? '관리자'}
        onLogoClick={() => navigate(ADMIN_PATHS.home)}
      />
      <HeaderSpacer />

      <main className={styles.content}>
        <Outlet />
      </main>

      <NavbarSpacer />
      <Navbar
        items={ADMIN_NAV_ITEMS}
        active={getAdminNavKeyByPath(pathname)}
        onChange={(key) => navigate(ADMIN_NAV_PATH_BY_KEY[key])}
      />
    </div>
  )
}

export default AdminLayout
