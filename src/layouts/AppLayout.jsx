import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Header, { HeaderSpacer } from '../components/layout/Header'
import Navbar, { NavbarSpacer } from '../components/layout/Navbar'
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
