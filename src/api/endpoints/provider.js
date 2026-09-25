import { request } from '../client'

/**
 * 서비스 종류 목록 조회 (방문간호, 방문목욕 등)
 * @returns {Promise<{ content: Array<{ provideServiceId: string, provideServiceName: string,
 *   content: string, createdAt: string }>, pageInfo: object }>}
 */
export function getProvideServices({ page, size, signal } = {}) {
  return request('/provide-services', { query: { page, size }, signal })
}
