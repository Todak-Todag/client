import { request } from '../client'

/*
 * care-plan-service (gateway: /care-plans/**, /care-plan-services/**, /service-preferences/**)
 *
 * 공통
 * - 목록 size는 10/30/50만 허용하고 그 외는 10으로 보정 (PageableFactory)
 * - pageInfo: { paginationType: 'OFFSET', page, size, totalElements, totalPages }
 * - 본인 Care Plan이 아니면 403 AUTH_FORBIDDEN, 없거나 논리삭제됐으면 404
 * - 서비스·희망 일정 변경은 모두 UNDER_REVIEW에서만 된다. 그 밖의 상태면 409
 *   (CARE_PLAN_SERVICE_SELECT_NOT_ALLOWED · CARE_PLAN_SERVICE_CANCEL_NOT_ALLOWED ·
 *    SERVICE_PREFERENCE_NOT_ALLOWED · SERVICE_PREFERENCE_DELETE_NOT_ALLOWED)
 */

/**
 * 내 Care Plan 목록 (PATIENT 전용)
 * - 서버가 정렬을 적용하지 않아 순서가 보장되지 않는다. 필요하면 createdAt으로 직접 정렬한다
 * @param {{ status?: 'UNDER_REVIEW'|'CONFIRMED'|'IN_PROGRESS'|'COMPLETED', page?: number,
 *   size?: 10|30|50, signal?: AbortSignal }} params
 * @returns {Promise<{ content: Array<{ carePlanId: string,
 *   status: 'UNDER_REVIEW'|'CONFIRMED'|'IN_PROGRESS'|'COMPLETED',
 *   startDate: string|null, finishDate: string|null, createdAt: string }>, pageInfo: object }>}
 */
export function getCarePlans({ status, page, size, signal } = {}) {
  return request('/care-plans', { query: { status, page, size }, signal })
}

/**
 * Care Plan 단건 (PATIENT는 본인 것만)
 * @returns {Promise<{ carePlanId: string, patientId: string, dischargeId: string,
 *   status: 'UNDER_REVIEW'|'CONFIRMED'|'IN_PROGRESS'|'COMPLETED',
 *   startDate: string|null, finishDate: string|null, note: string|null, createdAt: string }>}
 */
export function getCarePlan(carePlanId, { signal } = {}) {
  return request(`/care-plans/${carePlanId}`, { signal })
}

/**
 * Care Plan 상태 변경. 퇴원 예정자는 UNDER_REVIEW → CONFIRMED(확정)만 할 수 있다.
 * - 다른 전이는 400 CARE_PLAN_INVALID_STATUS_TRANSITION (이미 확정된 경우 포함)
 * - 확정 전에 user-service에서 지역을 조회하므로, 그 호출이 실패하면 5xx
 * @param {'CONFIRMED'} status
 * @returns {Promise<{ carePlanId: string, status: string }>}
 */
export function updateCarePlanStatus(carePlanId, status) {
  return request(`/care-plans/${carePlanId}/status`, { method: 'PATCH', body: { status } })
}

/**
 * Care Plan에 담긴 서비스 목록 (PATIENT 전용, 매칭 여부와 무관, createdAt DESC)
 * - 서비스 이름은 서버가 provider-service에서 채운다. 이름을 못 찾으면 목록 전체가
 *   502 PROVIDER_SERVICE_DATA_MISMATCH로 오므로 호출하는 쪽에서 실패를 감안한다
 * @returns {Promise<{ content: Array<{ planServiceId: string, provideServiceId: string,
 *   provideServiceName: string, createdAt: string }>,
 *   pageInfo: { page: number, size: number, totalElements: number, totalPages: number } }>}
 */
export function getCarePlanServices(carePlanId, { page, size, signal } = {}) {
  return request(`/care-plans/${carePlanId}/services`, { query: { page, size }, signal })
}

/**
 * Care Plan 서비스 단건 (PATIENT 전용). 희망 일정은 페이지 없이 전부, createdAt DESC로 온다
 * - planServiceId가 이 Care Plan 것이 아니거나 빠진 서비스면 404 CARE_PLAN_SERVICE_NOT_FOUND
 * @returns {Promise<{ planServiceId: string, provideServiceId: string,
 *   provideServiceName: string, provideServiceContent: string,
 *   preferences: Array<{ servicePreferenceId: string, preferredDate: string,
 *   preferredTimeSlot: 'MORNING'|'AFTERNOON' }>, createdAt: string }>}
 */
export function getCarePlanService(carePlanId, planServiceId, { signal } = {}) {
  return request(`/care-plans/${carePlanId}/services/${planServiceId}`, { signal })
}

/**
 * Care Plan에 서비스 추가 (PATIENT 전용, UNDER_REVIEW에서만)
 * - 이미 담긴 서비스면 409 CARE_PLAN_SERVICE_ALREADY_EXISTS (뺀 서비스는 다시 담을 수 있다)
 * @returns {Promise<{ provideServiceId: string }>} 새 planServiceId는 내려오지 않는다
 */
export function addCarePlanService(carePlanId, provideServiceId) {
  return request(`/care-plans/${carePlanId}/services`, {
    method: 'POST',
    body: { provideServiceId },
  })
}

/**
 * Care Plan에서 서비스 빼기 (PATIENT 전용, UNDER_REVIEW에서만). 응답 본문 없음(204)
 * - 그 서비스의 희망 일정도 함께 지워진다
 * - 마지막 남은 서비스를 빼면 서버가 Care Plan을 COMPLETED로 바꾼다
 */
export function removeCarePlanService(planServiceId) {
  return request(`/care-plan-services/${planServiceId}`, { method: 'DELETE' })
}

/**
 * Care Plan의 희망 일정 목록 (서비스 구분 없이 전체, preferredDate ASC)
 * - 빠진 서비스의 희망 일정은 포함되지 않는다
 * - planServiceId는 없고 provideServiceId만 온다 (한 Care Plan에 같은 서비스는 하나뿐이라 1:1)
 * @param {{ preferredDate?: string, page?: number, size?: 10|30|50, signal?: AbortSignal }} params
 * @returns {Promise<{ content: Array<{ servicePreferenceId: string, provideServiceId: string,
 *   preferredDate: string, preferredTimeSlot: 'MORNING'|'AFTERNOON', createdAt: string }>,
 *   pageInfo: object }>}
 */
export function getCarePlanPreferences(carePlanId, { preferredDate, page, size, signal } = {}) {
  return request(`/care-plans/${carePlanId}/service-preferences`, {
    query: { preferredDate, page, size },
    signal,
  })
}

/**
 * 서비스 희망 일정 단건 (PATIENT 전용)
 * @returns {Promise<{ servicePreferenceId: string, planServiceId: string,
 *   provideServiceId: string, preferredDate: string,
 *   preferredTimeSlot: 'MORNING'|'AFTERNOON', createdAt: string }>}
 */
export function getServicePreference(servicePreferenceId, { signal } = {}) {
  return request(`/service-preferences/${servicePreferenceId}`, { signal })
}

/**
 * 희망 일정 추가 (PATIENT 전용, UNDER_REVIEW에서만)
 * - preferredDate는 오늘보다 뒤이면서 startDate ~ finishDate 안이어야 한다.
 *   벗어나면 400 SERVICE_PREFERENCE_DATE_OUT_OF_RANGE
 * - 같은 날짜·시간대 중복은 서버가 막지 않는다
 * @param {{ preferredDate: string, preferredTimeSlot: 'MORNING'|'AFTERNOON' }} body
 * @returns {Promise<{ servicePreferenceId: string }>}
 */
export function createServicePreference(planServiceId, body) {
  return request(`/care-plan-services/${planServiceId}/service-preferences`, {
    method: 'POST',
    body,
  })
}

/**
 * 희망 일정 수정. 조건은 추가와 같다
 * @param {{ preferredDate: string, preferredTimeSlot: 'MORNING'|'AFTERNOON' }} body
 * @returns {Promise<{ servicePreferenceId: string }>}
 */
export function updateServicePreference(servicePreferenceId, body) {
  return request(`/service-preferences/${servicePreferenceId}`, { method: 'PATCH', body })
}

/**
 * 희망 일정 삭제 (UNDER_REVIEW에서만). 응답 본문 없음(204)
 * - 이미 지운 일정이면 409 SERVICE_PREFERENCE_ALREADY_DELETED
 */
export function deleteServicePreference(servicePreferenceId) {
  return request(`/service-preferences/${servicePreferenceId}`, { method: 'DELETE' })
}
