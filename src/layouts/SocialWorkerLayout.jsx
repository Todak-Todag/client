import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Header, { HeaderSpacer } from '../components/layout/Header'
import Navbar, { NavbarSpacer } from '../components/layout/Navbar'
import { NAV_ITEMS } from '../components/layout/navItems'
import {
  SOCIAL_WORKER_NAV_PATH_BY_KEY,
  SOCIAL_WORKER_PATHS,
  SOCIAL_WORKER_TITLE_BY_PATH,
  getSocialWorkerNavKeyByPath,
} from '../constants/paths'
import styles from './AppLayout.module.css'

/**
 * 사회복지사 화면의 공통 헤더 + 네브바 레이아웃
 *
 * ProviderLayout과 동일한 공통 Header/Navbar를 사용하되,
 * 현재 실제 구현된 홈/마이 메뉴만 노출한다.
 */
const SOCIAL_WORKER_NAV_ITEMS = NAV_ITEMS.filter(
  ({ key }) => key === 'home' || key === 'my',
)

function SocialWorkerLayout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  return (
    <div className={styles.layout}>
      <Header
        title={SOCIAL_WORKER_TITLE_BY_PATH[pathname] ?? '토닥토닥'}
        onLogoClick={() => navigate(SOCIAL_WORKER_PATHS.home)}
      />

      <HeaderSpacer />

      <main className={styles.content}>
        <Outlet />
      </main>

      <NavbarSpacer />

      <Navbar
        items={SOCIAL_WORKER_NAV_ITEMS}
        active={getSocialWorkerNavKeyByPath(pathname)}
        onChange={(key) =>
          navigate(SOCIAL_WORKER_NAV_PATH_BY_KEY[key])
        }
      />
    </div>
  )
}

export default SocialWorkerLayout