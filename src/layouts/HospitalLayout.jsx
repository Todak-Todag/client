import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Header, { HeaderSpacer } from '../components/layout/Header'
import Navbar, { NavbarSpacer } from '../components/layout/Navbar'
import { BellIcon } from '../components/ui/Icons'
import {
  HOSPITAL_NAV_PATH_BY_KEY,
  HOSPITAL_PATHS,
  HOSPITAL_TITLE_BY_PATH,
  getHospitalNavKeyByPath,
} from '../constants/paths'
import styles from './AppLayout.module.css'

/** 병원 담당자 화면의 헤더 + 네브바 레이아웃 */
function HospitalLayout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  return (
    <div className={styles.layout}>
      <Header
        title={HOSPITAL_TITLE_BY_PATH[pathname] ?? '토닥토닥'}
        onLogoClick={() => navigate(HOSPITAL_PATHS.home)}
        // 알림 기능은 아직 없어 시안의 모양만 둔다. 누를 수 없으므로 버튼이 아닌 장식 요소
        right={
          pathname === HOSPITAL_PATHS.home ? (
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
        active={getHospitalNavKeyByPath(pathname)}
        onChange={(key) => navigate(HOSPITAL_NAV_PATH_BY_KEY[key])}
      />
    </div>
  )
}

export default HospitalLayout
