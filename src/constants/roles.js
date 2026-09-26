import {
  ADMIN_PATHS,
  PATHS,
  PROVIDER_PATHS,
  SOCIAL_WORKER_PATHS,
} from './paths'

/** 서버가 role을 한글명으로 내려준다 (PATIENT, PATIENT_CONSENT 모두 '퇴원 예정자') */
export const ROLE_LABEL = {
  PATIENT: '퇴원 예정자',
  SERVICE_PROVIDER: '서비스 제공자',
  SOCIAL_WORKER: '사회복지사',
  ADMIN: '운영자',
  MASTER: '관리자',
}

/** 운영자·관리자는 같은 화면을 쓴다 (승인 API가 두 역할 모두 허용) */
export const ADMIN_ROLES = [ROLE_LABEL.ADMIN, ROLE_LABEL.MASTER]

/** 역할별 첫 화면. 여기 없는 역할은 퇴원 예정자 홈으로 간다 */
const HOME_PATH_BY_ROLE = {
  [ROLE_LABEL.SERVICE_PROVIDER]: PROVIDER_PATHS.home,
  [ROLE_LABEL.SOCIAL_WORKER]: SOCIAL_WORKER_PATHS.home,
  [ROLE_LABEL.ADMIN]: ADMIN_PATHS.home,
  [ROLE_LABEL.MASTER]: ADMIN_PATHS.home,
}

/**
 * 로그인 직후 이동할 첫 화면.
 * 역할마다 화면 구성이 달라서 /users/me의 role(한글명)로 갈라준다.
 */
export function getHomePathByRole(role) {
  return HOME_PATH_BY_ROLE[role] ?? PATHS.home
}

/** 운영자 또는 관리자인지 */
export function isAdminRole(role) {
  return ADMIN_ROLES.includes(role)
}
