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
