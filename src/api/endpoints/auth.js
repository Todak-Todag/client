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

/**
 * 내 정보 수정. 바꿀 필드만 담아 보낸다.
 * @param {{ name?: string, phone?: string, regionId?: string, address?: string }} body
 */
export function updateMe(body) {
  return request('/users/me', { method: 'PATCH', body })
}

/** 비밀번호 변경. 성공하면 서버가 쿠키를 지우므로 다시 로그인해야 한다. */
export function updatePassword({ currentPassword, newPassword }) {
  return request('/users/me/password', {
    method: 'PATCH',
    body: { currentPassword, newPassword },
  })
}

/** 회원 탈퇴 */
export function withdraw({ currentPassword }) {
  return request('/users/me', { method: 'DELETE', body: { currentPassword } })
}
