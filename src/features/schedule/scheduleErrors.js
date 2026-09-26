import { ApiError, getErrorMessage } from '../../api/client'

/** schedule-service ScheduleErrorCode · CommonErrorCode 중 퇴원 예정자 일정 상세에서 만나는 것 */
export const SCHEDULE_ERROR = {
  // 변경 요청 (PATCH /status)
  DELAY_DEADLINE_EXCEEDED: 'SERVICE_SCHEDULE_DELAY_DEADLINE_EXCEEDED',
  INVALID_RESCHEDULE_DATE: 'SERVICE_SCHEDULE_INVALID_RESCHEDULE_DATE',
  RESCHEDULE_TO_TODAY_NOT_ALLOWED: 'SERVICE_SCHEDULE_RESCHEDULE_TO_TODAY_NOT_ALLOWED',
  RESCHEDULE_EXCEEDS_CARE_PLAN_RANGE: 'SERVICE_SCHEDULE_RESCHEDULE_EXCEEDS_CARE_PLAN_RANGE',
  INVALID_STATUS_FOR_RESCHEDULING: 'SERVICE_SCHEDULE_INVALID_STATUS_FOR_RESCHEDULING',
  MATCHING_ATTEMPT_NOT_FOUND: 'SERVICE_MATCHING_ATTEMPT_NOT_FOUND',
  // 취소 (PATCH /cancel)
  CANCEL_DEADLINE_EXCEEDED: 'SERVICE_SCHEDULE_CANCEL_DEADLINE_EXCEEDED',
  INVALID_STATUS_FOR_CANCEL: 'SERVICE_SCHEDULE_INVALID_STATUS_FOR_CANCEL',
  // 공통
  INVALID_PARAMETER: 'INVALID_PARAMETER',
  AUTH_FORBIDDEN: 'AUTH_FORBIDDEN',
}

/**
 * 화면을 연 뒤 일정 상태나 시각이 바뀌어 막힌 요청 (다른 기기에서 처리했거나 마감이 지남).
 * 이때는 오류를 보여주고 상세를 다시 불러와 현재 상태로 맞춘다.
 */
const STALE_CODES = new Set([
  SCHEDULE_ERROR.DELAY_DEADLINE_EXCEEDED,
  SCHEDULE_ERROR.RESCHEDULE_TO_TODAY_NOT_ALLOWED,
  SCHEDULE_ERROR.INVALID_STATUS_FOR_RESCHEDULING,
  SCHEDULE_ERROR.CANCEL_DEADLINE_EXCEEDED,
  SCHEDULE_ERROR.INVALID_STATUS_FOR_CANCEL,
])

// 서버 문구에는 'SCHEDULED 상태', 'Care Plan'처럼 내부 용어가 섞여 있어 화면용으로 바꾼다
const MESSAGE_BY_CODE = {
  [SCHEDULE_ERROR.DELAY_DEADLINE_EXCEEDED]: '시작 24시간 전이 지나 일정을 변경할 수 없어요.',
  [SCHEDULE_ERROR.INVALID_RESCHEDULE_DATE]: '하루 앞당기거나 하루 미루는 날짜만 고를 수 있어요.',
  [SCHEDULE_ERROR.RESCHEDULE_TO_TODAY_NOT_ALLOWED]:
    '오늘 날짜로는 변경할 수 없어요. 하루 미루기를 골라 주세요.',
  [SCHEDULE_ERROR.RESCHEDULE_EXCEEDS_CARE_PLAN_RANGE]:
    '케어 종료일이 지나 하루 미룰 수 없어요. 하루 앞당기기를 골라 주세요.',
  [SCHEDULE_ERROR.INVALID_STATUS_FOR_RESCHEDULING]:
    '이미 변경을 요청했거나 바꿀 수 없는 일정이에요. 현재 상태를 다시 확인해 주세요.',
  [SCHEDULE_ERROR.MATCHING_ATTEMPT_NOT_FOUND]:
    '이 일정의 매칭 기록을 찾지 못해 변경할 수 없어요. 잠시 후 다시 시도해 주세요.',
  [SCHEDULE_ERROR.CANCEL_DEADLINE_EXCEEDED]: '시작 24시간 전이 지나 취소할 수 없어요.',
  [SCHEDULE_ERROR.INVALID_STATUS_FOR_CANCEL]:
    '이미 취소했거나 끝난 일정이라 취소할 수 없어요. 현재 상태를 다시 확인해 주세요.',
  [SCHEDULE_ERROR.INVALID_PARAMETER]: '입력한 내용을 다시 확인해 주세요.',
  // 공통 403 문구는 약관 동의 안내라 일정 화면에 맞게 바꾼다
  [SCHEDULE_ERROR.AUTH_FORBIDDEN]: '볼 수 없는 일정이에요. 일정 목록에서 다시 확인해 주세요.',
}

/**
 * 다시 시도해도 결과가 같은 조회 오류.
 * 서버는 없는 일정도 남의 일정과 똑같이 403 AUTH_FORBIDDEN으로 돌려준다 (404 없음)
 */
export function isScheduleGone(error) {
  return error instanceof ApiError && (error.status === 403 || error.status === 404)
}

/** 화면을 연 뒤 상태·시각이 바뀌어 막힌 변경·취소 요청인지 */
export function isScheduleStale(error) {
  return error instanceof ApiError && STALE_CODES.has(error.code)
}

/** 일정 화면에 보여줄 오류 문구 */
export function getScheduleErrorMessage(error) {
  if (error instanceof ApiError && MESSAGE_BY_CODE[error.code]) return MESSAGE_BY_CODE[error.code]
  return getErrorMessage(error)
}
