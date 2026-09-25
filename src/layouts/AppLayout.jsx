import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import '../styles/tokens.css'
import Header, { HeaderSpacer } from '../components/common/Header'
import Navbar, { NavbarSpacer } from '../components/common/Navbar'
import {
  NAV_PATH_BY_KEY,
  PATHS,
  TITLE_BY_PATH,
  getNavKeyByPath,
} from '../routes/paths'
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
