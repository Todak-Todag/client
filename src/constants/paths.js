/** 앱 전체에서 사용하는 라우트 경로 */
export const PATHS = {
  login: '/login',
  signup: '/signup',
  signupConsent: '/signup/consent',
  signupForm: '/signup/form',
  home: '/',
  schedule: '/schedule',
  matching: '/matching',
  my: '/my',
  // 케어플랜 검토·확정 (UNDER_REVIEW 전용, 네브바 없는 하위 화면)
  carePlan: '/care-plans/:carePlanId',
  carePlanServiceNew: '/care-plans/:carePlanId/services/new',
  carePlanService: '/care-plans/:carePlanId/services/:planServiceId',
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

/** 서비스 제공자 화면 경로 (역할이 달라 화면 구성이 겹치지 않으므로 /provider 아래로 둔다) */
export const PROVIDER_PATHS = {
  home: '/provider',
  schedule: '/provider/schedule',
  scheduleNew: '/provider/schedule/new',
  scheduleEdit: '/provider/schedule/:provideWorkId/edit',
  matching: '/provider/matching',
  my: '/provider/my',
  password: '/provider/my/password',
  result: '/provider/results/:serviceScheduleId',
  resultDetail: '/provider/results/:serviceScheduleId/detail',
}

/** 서비스 제공자 네브바 key <-> 경로 매핑 */
export const PROVIDER_NAV_PATH_BY_KEY = {
  home: PROVIDER_PATHS.home,
  schedule: PROVIDER_PATHS.schedule,
  matching: PROVIDER_PATHS.matching,
  my: PROVIDER_PATHS.my,
}

/** 서비스 제공자 경로별 헤더 제목 */
export const PROVIDER_TITLE_BY_PATH = {
  [PROVIDER_PATHS.home]: '',
  [PROVIDER_PATHS.schedule]: '내 일정',
  [PROVIDER_PATHS.matching]: '매칭',
  [PROVIDER_PATHS.my]: '마이페이지',
}

/** 서비스 제공자 화면에서 활성화할 네브바 key를 구한다 */
export function getProviderNavKeyByPath(pathname) {
  const entry = Object.entries(PROVIDER_NAV_PATH_BY_KEY).find(([, path]) =>
    path === PROVIDER_PATHS.home ? pathname === PROVIDER_PATHS.home : pathname.startsWith(path),
  )
  return entry ? entry[0] : 'home'
}

/** ':provideWorkId' 같은 자리를 실제 값으로 바꾼다 */
export function toPath(path, params) {
  return Object.entries(params).reduce(
    (result, [key, value]) => result.replace(`:${key}`, value),
    path,
  )
}


/**
 * 사회복지사 화면 경로
 *
 * 현재 구현된 사회복지사 화면만 정의한다.
 * 서버에 매칭 목록 조회 API가 없으므로 목록용 별도 API 경로는 만들지 않는다.
 */
export const SOCIAL_WORKER_PATHS = {
  home: '/social-worker',
  matching: '/social-worker/matching',
  matchingDetail: '/social-worker/matching/:matchingResultId',
}

/** 사회복지사 네브바에서 실제로 이동 가능한 경로만 관리한다 */
export const SOCIAL_WORKER_NAV_PATH_BY_KEY = {
  home: SOCIAL_WORKER_PATHS.home,
  matching: SOCIAL_WORKER_PATHS.matching,
}

/** 현재 사회복지사 경로에서 활성화할 네브바 key를 구한다 */
export function getSocialWorkerNavKeyByPath(pathname) {
  if (pathname.startsWith(SOCIAL_WORKER_PATHS.matching)) {
    return 'matching'
  }

  return 'home'
}

/** 사회복지사 경로에 맞는 헤더 제목을 반환한다 */
export function getSocialWorkerTitleByPath(pathname) {
  if (pathname.startsWith(SOCIAL_WORKER_PATHS.matching)) {
    return '매칭'
  }

  return ''
}