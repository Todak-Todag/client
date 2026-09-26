import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Header, { HeaderSpacer } from '../components/layout/Header'
import Navbar, { NavbarSpacer } from '../components/layout/Navbar'
import {
  PROVIDER_NAV_PATH_BY_KEY,
  PROVIDER_PATHS,
  PROVIDER_TITLE_BY_PATH,
  getProviderNavKeyByPath,
} from '../constants/paths'
import styles from './AppLayout.module.css'

/** 서비스 제공자 화면의 헤더 + 네브바 레이아웃 */
function ProviderLayout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  return (
    <div className={styles.layout}>
      <Header
        title={PROVIDER_TITLE_BY_PATH[pathname] ?? '토닥토닥'}
        onLogoClick={() => navigate(PROVIDER_PATHS.home)}
      />
      <HeaderSpacer />

      <main className={styles.content}>
        <Outlet />
      </main>

      <NavbarSpacer />
      <Navbar
        active={getProviderNavKeyByPath(pathname)}
        onChange={(key) => navigate(PROVIDER_NAV_PATH_BY_KEY[key])}
      />
    </div>
  )
}

export default ProviderLayout
