import { PATHS, PROVIDER_PATHS, SOCIAL_WORKER_PATHS } from './paths'

/** 서버가 role을 한글명으로 내려준다 (PATIENT, PATIENT_CONSENT 모두 '퇴원 예정자') */
export const ROLE_LABEL = {
  PATIENT: '퇴원 예정자',
  SERVICE_PROVIDER: '서비스 제공자',
  SOCIAL_WORKER: '사회복지사',
  ADMIN: '운영자',
  MASTER: '관리자'
}

/**
 * 로그인 직후 이동할 첫 화면.
 * 역할마다 화면 구성이 달라서 /users/me의 role(한글명)로 갈라준다.
 */
export function getHomePathByRole(role) {
  return role === ROLE_LABEL.SERVICE_PROVIDER ? PROVIDER_PATHS.home 
  : role === ROLE_LABEL.SOCIAL_WORKER ? SOCIAL_WORKER_PATHS.home
  : PATHS.home
}
