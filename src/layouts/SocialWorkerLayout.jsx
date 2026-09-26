import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Header, { HeaderSpacer } from '../components/layout/Header'
import Navbar, { NavbarSpacer } from '../components/layout/Navbar'
import { NAV_ITEMS } from '../components/layout/navItems'
import {
  SOCIAL_WORKER_NAV_PATH_BY_KEY,
  SOCIAL_WORKER_PATHS,
  getSocialWorkerNavKeyByPath,
  getSocialWorkerTitleByPath,
} from '../constants/paths'
import styles from './AppLayout.module.css'

/**
 * 사회복지사 화면에서 공통으로 사용하는 헤더 + 네브바 레이아웃
 *
 * 아직 구현되지 않은 일정/마이 화면은 노출하지 않고
 * 현재 실제로 이동 가능한 홈/매칭 메뉴만 사용한다.
 */
const SOCIAL_WORKER_NAV_ITEMS = NAV_ITEMS.filter(
  ({ key }) => key === 'home' || key === 'matching',
)

function SocialWorkerLayout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  return (
    <div className={styles.layout}>
      <Header
        title={getSocialWorkerTitleByPath(pathname)}
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