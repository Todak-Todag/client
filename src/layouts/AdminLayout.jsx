import { Navigate, Outlet } from 'react-router-dom'
import { getErrorMessage } from '../api/client'
import Button from '../components/ui/Button'
import EmptyState from '../components/common/EmptyState'
import { AlertIcon } from '../components/ui/Icons'
import { useAuth } from '../features/auth/useAuth'
import { PATHS } from '../constants/paths'
import { isAdminRole } from '../constants/roles'
import styles from './AdminLayout.module.css'

/**
 * 운영자·관리자 화면 접근 제어.
 *
 * 서버가 @PreAuthorize로 이미 막고 있으므로 이건 보안 장치가 아니라,
 * 권한 없는 사용자에게 빈 관리자 화면을 보여주지 않기 위한 것이다.
 */
function AdminLayout() {
  const me = useAuth()

  // 역할을 알기 전에는 아무것도 그리지 않는다 (잘못된 화면이 잠깐 보이지 않도록)
  if (me.status === 'loading') return null

  if (me.status === 'error') {
    // 비로그인이면 로그인 화면으로
    if (me.error?.status === 401) return <Navigate to={PATHS.login} replace />

    // 일시적인 오류까지 로그아웃처럼 처리하면 관리자가 갇힌다
    return (
      <div className={styles.state}>
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
      </div>
    )
  }

  if (!isAdminRole(me.data.role)) return <Navigate to={PATHS.home} replace />

  return <Outlet />
}

export default AdminLayout
