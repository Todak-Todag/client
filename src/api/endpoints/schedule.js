import { request } from '../client'

/*
 * schedule-service /service-schedules (ServiceScheduleApiController)
 *
 * 공통
 * - 목록 size는 10/30/50만 허용하고 그 외는 10, 정렬은 createdAt만 (PageableFactory)
 * - 시각은 시간대 없는 LocalDateTime 'YYYY-MM-DDTHH:mm:ss', 날짜는 'YYYY-MM-DD'
 * - 없는 일정·남의 일정은 모두 403 AUTH_FORBIDDEN (404를 내려주지 않는다)
 * - 요청 본문 검증 실패(@NotNull·@NotBlank)는 400 INVALID_PARAMETER
 * - 상태: SCHEDULED · RESCHEDULING · CHANGED · COMPLETED · CANCELED · NO_SHOW (ScheduleStatus)
 */

/**
 * 서비스 일정 목록 조회 (퇴원 예정자는 본인 Care Plan 전체의 일정이 내려온다)
 *
 * @param {{ date?: string, status?: string, page?: number, size?: 10|30|50, signal?: AbortSignal }} params
 *   date는 'YYYY-MM-DD' 정확히 일치, 비우면 전체 기간. status는 ScheduleStatus 이름 그대로
 *   (그 외 값은 400 SERVICE_SCHEDULE_INVALID_STATUS_FILTER). 논리삭제된 일정은 빠진다
 * @returns {Promise<{ content: Array<{ serviceScheduleId: string, status: string, date: string,
 *   startedAt: string, finishedAt: string }>, pageInfo: object }>}
 */
export function getSchedules({ date, status, page, size, signal } = {}) {
  return request('/service-schedules', {
    query: { date, status, page, size },
    signal,
  })
}

/**
 * 서비스 일정 상세 조회
 * cancelReason·canceledAt은 CANCELED일 때만 값이 있다
 * @returns {Promise<{ serviceScheduleId: string, servicePreferenceId: string,
 *   serviceOfferingId: string, status: string, date: string, startedAt: string,
 *   finishedAt: string, cancelReason: string|null, canceledAt: string|null }>}
 */
export function getSchedule(serviceScheduleId, { signal } = {}) {
  return request(`/service-schedules/${serviceScheduleId}`, { signal })
}

/**
 * 일정 날짜 변경 요청 (퇴원 예정자 전용, PATCH /service-schedules/{id}/status)
 * 시간대는 그대로 두고 날짜만 바꾼다. 성공하면 RESCHEDULING이 되고 서버가 비동기로 다시 매칭한다
 * (성사되면 이 일정은 CHANGED가 되고 새 일정이 생기며, 실패하면 SCHEDULED로 돌아온다).
 *
 * 서버 검증 (ServiceScheduleValidator · ServiceSchedule.rescheduling)
 * - 시작 24시간 이내: 400 SERVICE_SCHEDULE_DELAY_DEADLINE_EXCEEDED
 * - 기존 날짜의 하루 전·하루 뒤가 아님: 400 SERVICE_SCHEDULE_INVALID_RESCHEDULE_DATE
 * - 하루 전이 오늘: 400 SERVICE_SCHEDULE_RESCHEDULE_TO_TODAY_NOT_ALLOWED
 * - 하루 뒤가 Care Plan 종료일 초과: 400 SERVICE_SCHEDULE_RESCHEDULE_EXCEEDS_CARE_PLAN_RANGE
 * - SCHEDULED가 아님: 400 SERVICE_SCHEDULE_INVALID_STATUS_FOR_RESCHEDULING
 * - 매칭 기록 없음: 404 SERVICE_MATCHING_ATTEMPT_NOT_FOUND
 *
 * @param {string} date 'YYYY-MM-DD'
 * @returns {Promise<{ serviceScheduleId: string, status: 'RESCHEDULING' }>}
 */
export function requestReschedule(serviceScheduleId, date) {
  return request(`/service-schedules/${serviceScheduleId}/status`, {
    method: 'PATCH',
    body: { date },
  })
}

/**
 * 일정 취소 (퇴원 예정자 전용, PATCH /service-schedules/{id}/cancel)
 *
 * 서버 검증 (ServiceScheduleValidator · ServiceSchedule.cancel)
 * - 시작 24시간 이내: 409 SERVICE_SCHEDULE_CANCEL_DEADLINE_EXCEEDED
 * - SCHEDULED·RESCHEDULING이 아님: 409 SERVICE_SCHEDULE_INVALID_STATUS_FOR_CANCEL
 * - 사유가 비었거나 공백뿐: 400 INVALID_PARAMETER
 *
 * @param {string} cancelReason
 * @returns {Promise<{ serviceScheduleId: string, canceledAt: string }>}
 */
export function cancelSchedule(serviceScheduleId, cancelReason) {
  return request(`/service-schedules/${serviceScheduleId}/cancel`, {
    method: 'PATCH',
    body: { cancelReason },
  })
}

/**
 * 서비스 수행 여부 확정 (서비스 제공자 전용)
 * @param {'COMPLETED'|'NO_SHOW'} status
 */
export function completeSchedule(serviceScheduleId, status) {
  return request(`/service-schedules/${serviceScheduleId}/result`, {
    method: 'PATCH',
    body: { status },
  })
}

/**
 * 서비스 수행 결과 등록 (서비스 제공자 전용)
 * @param {{ startedAt: string, finishedAt: string, note?: string }} body
 *   시각은 'YYYY-MM-DDTHH:mm:ss'
 */
export function registerResult(serviceScheduleId, body) {
  return request(`/service-results/${serviceScheduleId}`, { method: 'POST', body })
}

/**
 * 수행 결과 목록 조회
 * @returns {Promise<{ content: Array<{ serviceResultId: string, startedAt: string,
 *   finishedAt: string }>, pageInfo: object }>}
 *   목록에는 일정 ID가 없어 어떤 일정의 결과인지는 상세로 확인해야 한다.
 */
export function getResults({ page, size, signal } = {}) {
  return request('/service-results', { query: { page, size }, signal })
}

/**
 * 수행 결과 상세 조회
 * @returns {Promise<{ serviceResultId: string, serviceScheduleId: string,
 *   startedAt: string, finishedAt: string, note: string|null }>}
 */
export function getResult(serviceResultId, { signal } = {}) {
  return request(`/service-results/${serviceResultId}`, { signal })
}

/**
 * 내 매칭 시도 내역 조회 (퇴원 예정자 전용, schedule-service MatchingAttemptApiController)
 *
 * - status를 비우면 서버가 FAILED로 조회한다. FAILED는 아직 일정이 하나도 만들어지지 않은
 *   '재매칭이 필요한 실패'만 내려온다. (재시도로 해소된 과거 실패는 빠짐)
 * - Care Plan이 CONFIRMED일 때만 결과가 있다. IN_PROGRESS는 빈 목록,
 *   Care Plan이 없거나 UNDER_REVIEW·COMPLETED면 403 AUTH_FORBIDDEN.
 *   (schedule-service가 조회하는 care-plan 내부 API가 CONFIRMED/IN_PROGRESS만 찾고, 못 찾은 404를 403으로 바꾼다)
 * - size는 10/30/50만 허용하고 그 외는 10. 정렬은 createdAt 고정(기본 DESC).
 *
 * @param {{ status?: 'MATCHED'|'FAILED'|'EXPIRED', page?: number, size?: 10|30|50, signal?: AbortSignal }} params
 * @returns {Promise<{ content: Array<{ matchingAttemptId: string, servicePreferenceId: string,
 *   provideServiceId: string, date: string, preferredTimeSlot: 'MORNING'|'AFTERNOON'|null,
 *   status: 'MATCHED'|'FAILED'|'EXPIRED', failureReason: string|null,
 *   failedAt: string|null, matchedAt: string|null }>,
 *   pageInfo: { page: number, size: number, totalElements: number, totalPages: number } }>}
 *   failureReason은 현재 'NO_AVAILABLE_PROVIDER' 코드 문자열 그대로 온다. failedAt/matchedAt은 UTC Instant
 */
export function getMatchingAttempts({ status, page, size, signal } = {}) {
  return request('/matching-attempts', { query: { status, page, size }, signal })
}
