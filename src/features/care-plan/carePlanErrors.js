import { ApiError, getErrorMessage } from '../../api/client'

/** care-plan-service ErrorCode 중 퇴원 예정자 화면에서 만나는 것 */
export const CARE_PLAN_ERROR = {
  CARE_PLAN_NOT_FOUND: 'CARE_PLAN_NOT_FOUND',
  CARE_PLAN_SERVICE_NOT_FOUND: 'CARE_PLAN_SERVICE_NOT_FOUND',
  CARE_PLAN_SERVICE_ALREADY_EXISTS: 'CARE_PLAN_SERVICE_ALREADY_EXISTS',
  CARE_PLAN_SERVICE_ALREADY_DELETED: 'CARE_PLAN_SERVICE_ALREADY_DELETED',
  CARE_PLAN_SERVICE_SELECT_NOT_ALLOWED: 'CARE_PLAN_SERVICE_SELECT_NOT_ALLOWED',
  CARE_PLAN_SERVICE_CANCEL_NOT_ALLOWED: 'CARE_PLAN_SERVICE_CANCEL_NOT_ALLOWED',
  CARE_PLAN_INVALID_STATUS_TRANSITION: 'CARE_PLAN_INVALID_STATUS_TRANSITION',
  SERVICE_PREFERENCE_NOT_FOUND: 'SERVICE_PREFERENCE_NOT_FOUND',
  SERVICE_PREFERENCE_ALREADY_DELETED: 'SERVICE_PREFERENCE_ALREADY_DELETED',
  SERVICE_PREFERENCE_DATE_OUT_OF_RANGE: 'SERVICE_PREFERENCE_DATE_OUT_OF_RANGE',
  SERVICE_PREFERENCE_NOT_ALLOWED: 'SERVICE_PREFERENCE_NOT_ALLOWED',
  SERVICE_PREFERENCE_DELETE_NOT_ALLOWED: 'SERVICE_PREFERENCE_DELETE_NOT_ALLOWED',
}

/**
 * 케어플랜이 더 이상 UNDER_REVIEW가 아니라서(다른 기기에서 확정했거나 종료됨) 막힌 요청.
 * 확정을 두 번 누른 경우도 여기에 든다 (UNDER_REVIEW → CONFIRMED 외 전이는 400)
 */
const LOCKED_CODES = new Set([
  CARE_PLAN_ERROR.CARE_PLAN_SERVICE_SELECT_NOT_ALLOWED,
  CARE_PLAN_ERROR.CARE_PLAN_SERVICE_CANCEL_NOT_ALLOWED,
  CARE_PLAN_ERROR.CARE_PLAN_INVALID_STATUS_TRANSITION,
  CARE_PLAN_ERROR.SERVICE_PREFERENCE_NOT_ALLOWED,
  CARE_PLAN_ERROR.SERVICE_PREFERENCE_DELETE_NOT_ALLOWED,
])

// 서버 문구에는 'UNDER_REVIEW', 'Care Plan 조회 실패'처럼 내부 용어가 섞여 있어 화면용으로 바꾼다
const MESSAGE_BY_CODE = {
  [CARE_PLAN_ERROR.CARE_PLAN_NOT_FOUND]: '케어플랜을 찾을 수 없어요. 홈에서 다시 확인해 주세요.',
  [CARE_PLAN_ERROR.CARE_PLAN_SERVICE_NOT_FOUND]:
    '케어플랜에서 이미 빠진 서비스예요. 케어플랜 확인 화면에서 다시 확인해 주세요.',
  [CARE_PLAN_ERROR.CARE_PLAN_SERVICE_ALREADY_DELETED]:
    '케어플랜에서 이미 빠진 서비스예요. 케어플랜 확인 화면에서 다시 확인해 주세요.',
  [CARE_PLAN_ERROR.CARE_PLAN_SERVICE_ALREADY_EXISTS]: '이미 케어플랜에 담긴 서비스예요.',
  [CARE_PLAN_ERROR.SERVICE_PREFERENCE_NOT_FOUND]: '이미 지워진 희망 일정이에요.',
  [CARE_PLAN_ERROR.SERVICE_PREFERENCE_ALREADY_DELETED]: '이미 지워진 희망 일정이에요.',
  [CARE_PLAN_ERROR.SERVICE_PREFERENCE_DATE_OUT_OF_RANGE]:
    // 서버 규칙: 오늘보다 뒤 · 케어 시작일 이후 · 케어 종료일까지
    '고를 수 없는 날짜예요. 케어 기간 안에서 내일 이후 날짜를 골라 주세요.',
}

const LOCKED_MESSAGE = '케어플랜이 이미 확정되었거나 종료되어 더 바꿀 수 없어요. 홈에서 현재 상태를 확인해 주세요.'

/** 케어플랜이 확정·종료되어 변경이 막힌 오류인지 */
export function isCarePlanLocked(error) {
  return error instanceof ApiError && LOCKED_CODES.has(error.code)
}

/** 다시 시도해도 결과가 같은 오류(없음·권한 없음)인지. 이때는 '다시 시도' 대신 다른 화면으로 안내한다 */
export function isCarePlanGone(error) {
  return error instanceof ApiError && (error.status === 404 || error.status === 403)
}

/** 케어플랜 화면에 보여줄 오류 문구 */
export function getCarePlanErrorMessage(error) {
  if (isCarePlanLocked(error)) return LOCKED_MESSAGE
  if (error instanceof ApiError && MESSAGE_BY_CODE[error.code]) return MESSAGE_BY_CODE[error.code]
  return getErrorMessage(error)
}
