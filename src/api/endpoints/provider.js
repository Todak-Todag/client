import { request } from '../client'

/**
 * 서비스 종류 목록 조회 (방문간호, 방문목욕 등)
 * @returns {Promise<{ content: Array<{ provideServiceId: string, provideServiceName: string,
 *   content: string, createdAt: string }>, pageInfo: object }>}
 */
export function getProvideServices({ page, size, signal } = {}) {
  return request('/provide-services', { query: { page, size }, signal })
}

/**
 * 내가 등록한 제공 서비스 목록 (서비스 제공자 전용)
 * @returns {Promise<{ content: Array<{ serviceOfferingId: string, provideServiceId: string,
 *   provideServiceName: string, createdAt: string }>, pageInfo: object }>}
 */
export function getMyOfferings({ page, size, signal } = {}) {
  return request('/service-offerings', { query: { page, size }, signal })
}

/**
 * 제공 가능 요일/시간 등록
 * @param {{ day: number, startedAt: string, finishedAt: string }} body
 *   day는 1(월)~7(일), 시각은 'HH:mm'
 */
export function createProvideWork(serviceOfferingId, body) {
  return request(`/service-offerings/${serviceOfferingId}/provide-works`, {
    method: 'POST',
    body,
  })
}

/** 제공 가능 요일/시간 수정 */
export function updateProvideWork(serviceOfferingId, provideWorkId, body) {
  return request(`/service-offerings/${serviceOfferingId}/provide-works/${provideWorkId}`, {
    method: 'PATCH',
    body,
  })
}

/** 제공 가능 요일/시간 삭제 */
export function deleteProvideWork(serviceOfferingId, provideWorkId) {
  return request(`/service-offerings/${serviceOfferingId}/provide-works/${provideWorkId}`, {
    method: 'DELETE',
  })
}
