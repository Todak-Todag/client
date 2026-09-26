import { request } from '../client'

/**
 * 서비스 일정 목록 조회 (퇴원 예정자는 본인 일정만 내려온다)
 *
 * @param {{ date?: string, status?: string, page?: number, size?: 10|30|50, signal?: AbortSignal }} params
 *   date는 'YYYY-MM-DD' 정확히 일치, 정렬은 서버에서 createdAt 기준만 지원
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
 * @returns {Promise<{ serviceScheduleId: string, servicePreferenceId: string,
 *   serviceOfferingId: string, status: string, date: string, startedAt: string,
 *   finishedAt: string, cancelReason: string|null, canceledAt: string|null }>}
 */
export function getSchedule(serviceScheduleId, { signal } = {}) {
  return request(`/service-schedules/${serviceScheduleId}`, { signal })
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
