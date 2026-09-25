import { request } from '../client'

/**
 * 내 Care Plan 목록 조회 (퇴원 예정자 전용)
 * @returns {Promise<{ content: Array<{ carePlanId: string,
 *   status: 'UNDER_REVIEW'|'CONFIRMED'|'IN_PROGRESS'|'COMPLETED',
 *   startDate: string|null, finishDate: string|null, createdAt: string }>, pageInfo: object }>}
 */
export function getCarePlans({ status, page, size, signal } = {}) {
  return request('/care-plans', { query: { status, page, size }, signal })
}

/**
 * 서비스 희망 일정 단건 조회 (퇴원 예정자 전용)
 * @returns {Promise<{ servicePreferenceId: string, planServiceId: string,
 *   provideServiceId: string, preferredDate: string,
 *   preferredTimeSlot: 'MORNING'|'AFTERNOON', createdAt: string }>}
 */
export function getServicePreference(servicePreferenceId, { signal } = {}) {
  return request(`/service-preferences/${servicePreferenceId}`, { signal })
}
