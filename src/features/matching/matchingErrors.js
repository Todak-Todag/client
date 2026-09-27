import { ApiError, getErrorMessage } from '../../api/client'

/** schedule-service ScheduleErrorCode · social-worker-service MatchingErrorCode 중 매칭 화면에서 만나는 것 */
export const MATCHING_ERROR = {
  // 서비스 매칭 다시 요청 (POST /matching-attempts/{id}/retry)
  RETRY_EXCEEDS_CARE_PLAN_RANGE: 'MATCHING_ATTEMPT_RETRY_EXCEEDS_CARE_PLAN_RANGE',
  NOT_RETRYABLE: 'MATCHING_ATTEMPT_NOT_RETRYABLE',
  RETRY_ALREADY_REQUESTED: 'MATCHING_ATTEMPT_RETRY_ALREADY_REQUESTED',
  // 사회복지사 매칭
  SOCIAL_WORKER_ALREADY_IN_PROGRESS: 'SOCIAL_WORKER_MATCHING_ALREADY_IN_PROGRESS',
  SOCIAL_WORKER_FORBIDDEN: 'SOCIAL_WORKER_MATCHING_FORBIDDEN',
  // 공통
  INVALID_PARAMETER: 'INVALID_PARAMETER',
  AUTH_FORBIDDEN: 'AUTH_FORBIDDEN',
}

// 서버 문구에 'FAILED 상태', 'Care Plan' 같은 내부 용어가 섞여 있거나 뭉뚱그려 와서 화면용으로 바꾼다
const MESSAGE_BY_CODE = {
  [MATCHING_ERROR.RETRY_EXCEEDS_CARE_PLAN_RANGE]: '케어 기간 안의 날짜만 고를 수 있어요.',
  [MATCHING_ERROR.NOT_RETRYABLE]:
    '이미 매칭된 일정이라 다시 요청할 수 없어요. 매칭 현황을 새로 불러와 주세요.',
  [MATCHING_ERROR.RETRY_ALREADY_REQUESTED]: '이미 다시 요청한 일정이에요. 결과를 기다려 주세요.',
  [MATCHING_ERROR.SOCIAL_WORKER_ALREADY_IN_PROGRESS]:
    '이미 진행 중이거나 연결된 사회복지사 매칭이 있어요.',
  [MATCHING_ERROR.SOCIAL_WORKER_FORBIDDEN]: '퇴원 예정자만 사회복지사 매칭을 요청할 수 있어요.',
  [MATCHING_ERROR.INVALID_PARAMETER]: '날짜를 다시 골라 주세요.',
  // 공통 403 문구는 약관 동의 안내라 매칭 화면에 맞게 바꾼다
  [MATCHING_ERROR.AUTH_FORBIDDEN]: '지금은 매칭 정보를 볼 수 없어요. 케어플랜 상태를 확인해 주세요.',
}

export function isMatchingError(error, code) {
  return error instanceof ApiError && error.code === code
}

/** 매칭 화면에 보여줄 오류 문구 */
export function getMatchingErrorMessage(error) {
  if (error instanceof ApiError && MESSAGE_BY_CODE[error.code]) return MESSAGE_BY_CODE[error.code]
  return getErrorMessage(error)
}
