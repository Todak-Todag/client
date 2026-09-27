import { ApiError, getErrorMessage } from '../../api/client'

/**
 * 수행 결과 상세 오류 문구
 * 서버는 없는 결과도 남의 결과와 똑같이 403 AUTH_FORBIDDEN으로 돌려준다 (ServiceResultFacade.detail, 404 없음).
 * 공통 403 문구는 약관 동의 안내라 상세 화면에서만 바꾼다. 목록의 403은 권한(약관 동의 전 계정) 문제라 공통 문구를 쓴다.
 */
export function getServiceResultDetailErrorMessage(error) {
  if (error instanceof ApiError && error.code === 'AUTH_FORBIDDEN') {
    return '볼 수 없는 수행 결과예요. 목록에서 다시 확인해 주세요.'
  }
  return getErrorMessage(error)
}

/** 다시 시도해도 결과가 같은 상세 조회 오류 (없는 결과 · 남의 결과) */
export function isServiceResultGone(error) {
  return error instanceof ApiError && error.status === 403
}
