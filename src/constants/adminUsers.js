/**
 * 관리자 사용자 검색 필터 코드.
 *
 * 서버(UserSearchRequest)가 문자열이 아닌 정수 코드로 받는다.
 * status는 생략하면 1(승인됨)이 기본이라 "전체" 선택지가 없다.
 */

/** 역할 필터 코드 (없으면 전체) */
export const USER_ROLE_FILTER = {
  ALL: '',
  PATIENT: 1,
  HOSPITAL_STAFF: 2,
  SERVICE_PROVIDER: 3,
  SOCIAL_WORKER: 4,
  ADMIN: 5,
}

/** 상태 필터 코드 */
export const USER_STATUS_FILTER = {
  APPROVED: 1,
  SUSPENDED: 2,
  WITHDRAWN: 3,
  PENDING: 4,
  REJECTED: 5,
}

/** 상태 필터 선택지 (승인 화면이라 '승인 대기'가 먼저) */
export const USER_STATUS_OPTIONS = [
  { value: USER_STATUS_FILTER.PENDING, label: '승인 대기' },
  { value: USER_STATUS_FILTER.APPROVED, label: '승인됨' },
  { value: USER_STATUS_FILTER.REJECTED, label: '거절됨' },
  { value: USER_STATUS_FILTER.SUSPENDED, label: '일시정지' },
  { value: USER_STATUS_FILTER.WITHDRAWN, label: '탈퇴' },
]

/** 역할 필터 선택지 */
export const USER_ROLE_OPTIONS = [
  { value: USER_ROLE_FILTER.ALL, label: '전체 역할' },
  { value: USER_ROLE_FILTER.PATIENT, label: '퇴원 예정자' },
  { value: USER_ROLE_FILTER.HOSPITAL_STAFF, label: '병원 담당자' },
  { value: USER_ROLE_FILTER.SERVICE_PROVIDER, label: '서비스 제공자' },
  { value: USER_ROLE_FILTER.SOCIAL_WORKER, label: '사회복지사' },
  { value: USER_ROLE_FILTER.ADMIN, label: '운영자·관리자' },
]

/** 서버 UserStatus(문자열) -> 화면 표기 */
export const USER_STATUS_LABEL = {
  APPROVED: '승인됨',
  SUSPENDED: '일시정지',
  WITHDRAWN: '탈퇴',
  PENDING: '승인 대기',
  REJECTED: '거절됨',
}

/** 서버 UserStatus -> Badge 색 */
export const USER_STATUS_VARIANT = {
  APPROVED: 'success',
  SUSPENDED: 'warning',
  WITHDRAWN: 'neutral',
  PENDING: 'primary',
  REJECTED: 'danger',
}
