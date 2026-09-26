import { ApiError, getErrorMessage } from '../../api/client'

const MESSAGE_BY_CODE = {
  USER_NOT_APPROVAL:
    '가입 승인을 기다리고 있어요. 관리자 승인 후 로그인할 수 있어요.',
  USER_SUSPENDED: '이용이 정지된 계정이에요. 고객센터로 문의해 주세요.',
  USER_LOGIN_WITHDRAWN:
    '약관 동의를 철회한 계정이에요. 다시 동의하면 이용할 수 있어요.'
}

export function getAuthErrorMessage(error) {
  if(error instanceof ApiError && MESSAGE_BY_CODE[error.code]) {
    return MESSAGE_BY_CODE[error.code];
  }

  return getErrorMessage(error);
}