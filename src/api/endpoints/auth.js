import { request } from '../client'

/** 로그인. 성공 시 토큰은 HttpOnly 쿠키로 저장되고 응답 본문은 없다. (204) */
export function login({ username, password }) {
  return request('/auth/login', { method: 'POST', body: { username, password } })
}

export function logout() {
  return request('/auth/logout', { method: 'POST' })
}

/**
 * 내 정보 조회
 * @returns {Promise<{ name: string, province: string, district: string, phone: string,
 *   regionId: string, role: string, isAddressActive: boolean }>}
 *   role은 영문 코드가 아니라 한글명(예: '퇴원 예정자')으로 내려온다.
 */
export function getMe({ signal } = {}) {
  return request('/users/me', { signal })
}
