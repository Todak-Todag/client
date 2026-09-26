import { request } from '../client'

/**
 * 현재 서비스 가능한 지역 목록 조회
 */
export function getRegions({ signal } = {}) {
  return request('/regions', { signal })
}