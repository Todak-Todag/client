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

/**
 * Care Plan에 신청된 서비스 목록 (퇴원 예정자 전용, 매칭 여부와 무관)
 *
 * - 본인 Care Plan만 조회 가능. 없으면 404 CARE_PLAN_NOT_FOUND, 남의 것이면 403
 * - 서비스 이름은 서버가 provider-service에서 채운다. 이름을 못 찾으면 목록 전체가 오류
 *   (PROVIDER_SERVICE_DATA_MISMATCH)로 오므로 호출하는 쪽에서 실패를 감안한다
 * - size는 10/30/50만 허용하고 그 외는 10. 정렬은 createdAt DESC 고정
 *
 * @returns {Promise<{ content: Array<{ planServiceId: string, provideServiceId: string,
 *   provideServiceName: string, createdAt: string }>,
 *   pageInfo: { page: number, size: number, totalElements: number, totalPages: number } }>}
 */
export function getCarePlanServices(carePlanId, { page, size, signal } = {}) {
  return request(`/care-plans/${carePlanId}/services`, { query: { page, size }, signal })
}
