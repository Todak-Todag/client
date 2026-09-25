/** 앱 전체에서 사용하는 라우트 경로 */
export const PATHS = {
  login: '/login',
  home: '/',
  schedule: '/schedule',
  matching: '/matching',
  my: '/my',
}

/** 네브바 key <-> 경로 매핑 */
export const NAV_PATH_BY_KEY = {
  home: PATHS.home,
  schedule: PATHS.schedule,
  matching: PATHS.matching,
  my: PATHS.my,
}

/** 경로별 헤더 제목 */
export const TITLE_BY_PATH = {
  [PATHS.home]: '', // 홈은 로고만 표시 (디자인 시안)
  [PATHS.schedule]: '일정 상세',
  [PATHS.matching]: '매칭',
  [PATHS.my]: '마이페이지',
}

/** 현재 경로에서 활성화할 네브바 key를 구한다 */
export function getNavKeyByPath(pathname) {
  const entry = Object.entries(NAV_PATH_BY_KEY).find(([, path]) =>
    path === PATHS.home ? pathname === PATHS.home : pathname.startsWith(path),
  )
  return entry ? entry[0] : 'home'
}
