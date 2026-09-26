import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Header, { HeaderSpacer } from '../components/layout/Header'
import Navbar, { NavbarSpacer } from '../components/layout/Navbar'
import { BellIcon } from '../components/ui/Icons'
import {
  NAV_PATH_BY_KEY,
  PATHS,
  TITLE_BY_PATH,
  getNavKeyByPath,
} from '../constants/paths'
import styles from './AppLayout.module.css'

/** 헤더 + 네브바가 붙는 기본 레이아웃 */
function AppLayout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const activeKey = getNavKeyByPath(pathname)

  return (
    <div className={styles.layout}>
      <Header
        title={TITLE_BY_PATH[pathname] ?? '토닥토닥'}
        onLogoClick={() => navigate(PATHS.home)}
        // 알림 기능은 아직 없어 시안의 모양만 둔다. 누를 수 없으므로 버튼이 아닌 장식 요소
        right={
          pathname === PATHS.home ? (
            <span className={styles.bell} aria-hidden="true">
              <BellIcon className={styles.bellIcon} />
            </span>
          ) : null
        }
      />
      <HeaderSpacer />

      <main className={styles.content}>
        <Outlet />
      </main>

      <NavbarSpacer />
      <Navbar
        active={activeKey}
        onChange={(key) => navigate(NAV_PATH_BY_KEY[key])}
      />
    </div>
  )
}

export default AppLayout
