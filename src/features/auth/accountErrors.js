import { ApiError, getErrorMessage } from '../../api/client'

/**
 * user-service UserErrorCode · CommonErrorCode 중 마이페이지(내 정보 수정 · 비밀번호 변경 · 탈퇴)에서 만나는 것
 * - 요청 본문 검증(@Pattern · @NotBlank · @Size) 실패는 필드 문구 없이 400 INVALID_PARAMETER 하나로 온다
 */
export const ACCOUNT_ERROR = {
  // 비밀번호 변경 · 탈퇴에서 현재 비밀번호가 틀림 (409)
  INVALID_CURRENT_PASSWORD: 'USER_INVALID_CURRENT_PASSWORD',
  // 내 정보 수정은 APPROVED 계정만 가능 (User.validateApproved, 403)
  SERVICE_ACCESS_DENIED: 'SERVICE_ACCESS_DENIED',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  INVALID_PARAMETER: 'INVALID_PARAMETER',
}

const MESSAGE_BY_CODE = {
  [ACCOUNT_ERROR.INVALID_CURRENT_PASSWORD]: '현재 비밀번호가 맞지 않아요. 다시 입력해 주세요.',
  [ACCOUNT_ERROR.SERVICE_ACCESS_DENIED]: '지금은 내 정보를 바꿀 수 없는 계정 상태예요.',
  [ACCOUNT_ERROR.USER_NOT_FOUND]: '계정 정보를 찾지 못했어요. 다시 로그인해 주세요.',
  [ACCOUNT_ERROR.INVALID_PARAMETER]: '입력한 내용을 다시 확인해 주세요.',
}

/** 현재 비밀번호 입력란 아래에 보여줄 오류인지 */
export function isInvalidCurrentPassword(error) {
  return error instanceof ApiError && error.code === ACCOUNT_ERROR.INVALID_CURRENT_PASSWORD
}

/** 계정 화면에 보여줄 오류 문구 */
export function getAccountErrorMessage(error) {
  if (error instanceof ApiError && MESSAGE_BY_CODE[error.code]) return MESSAGE_BY_CODE[error.code]
  return getErrorMessage(error)
}
