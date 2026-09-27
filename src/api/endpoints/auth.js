import { request } from '../client'

/** 로그인. 성공 시 토큰은 HttpOnly 쿠키로 저장되고 응답 본문은 없다. (204) */
export function login({ username, password }) {
  return request('/auth/login', { method: 'POST', body: { username, password } })
}

/** 로그아웃 (204). 서버가 토큰 쿠키를 지운다 */
export function logout() {
  return request('/auth/logout', { method: 'POST' })
}

/**
 * 내 정보 조회 (user-service UserInfoResponse)
 * @returns {Promise<{ name: string, province: string|null, district: string|null, phone: string,
 *   regionId: string|null, role: string, isAddressActive: boolean }>}
 *   role은 영문 코드가 아니라 한글명(예: '퇴원 예정자')으로 내려온다.
 *   지역이 없는 계정은 province·district가 null이고, isAddressActive는 지역이 활성일 때만 true.
 */
export function getMe({ signal } = {}) {
  return request('/users/me', { signal })
}

/**
 * 내 정보 수정. 바꿀 필드만 담아 보낸다. (user-service UserUpdateRequest · User.changeMyInfo)
 * - null·빈 문자열 필드는 무시된다 (지울 수 없음)
 * - name: /^[A-Za-z가-힣]+$/, phone: /^\d{9,11}$/ — 어기면 400 INVALID_PARAMETER (필드별 문구 없음)
 * - regionId 없이 address만 보내면 409 USER_INVALID_CREATE_PATIENT_REGION
 * - APPROVED가 아닌 계정은 403 SERVICE_ACCESS_DENIED
 * @param {{ name?: string, phone?: string, regionId?: string, address?: string }} body
 * @returns {Promise<{ userId: string, name: string, phone: string, regionId: string|null,
 *   address: string|null }>} 수정 후 값
 */
export function updateMe(body) {
  return request('/users/me', { method: 'PATCH', body })
}

/**
 * 비밀번호 변경. 성공하면 서버가 모든 세션을 끊고 쿠키를 지우므로 다시 로그인해야 한다.
 * - newPassword: 8~20자, 영문·숫자·특수문자 각 1개 이상, 공백 없음 — 어기면 400 INVALID_PARAMETER
 * - 현재 비밀번호 불일치: 409 USER_INVALID_CURRENT_PASSWORD
 * @returns {Promise<{ userId: string }>}
 */
export function updatePassword({ currentPassword, newPassword }) {
  return request('/users/me/password', {
    method: 'PATCH',
    body: { currentPassword, newPassword },
  })
}

/**
 * 회원 탈퇴 (204). 성공하면 서버가 모든 세션을 끊고 쿠키를 지운다.
 * - 현재 비밀번호 불일치: 409 USER_INVALID_CURRENT_PASSWORD
 */
export function withdraw({ currentPassword }) {
  return request('/users/me', { method: 'DELETE', body: { currentPassword } })
}

/**
 * 퇴원 예정자 계정 생성 (병원 담당자 전용)
 *
 * 지역을 보내면 주소도 함께 보내야 한다. (서버가 짝을 맞춰 검증한다)
 * @param {{ username: string, password: string, name: string, phone: string,
 *   regionId?: string, address?: string }} body
 * @returns {Promise<{ patientId: string, hospitalStaffId: string, name: string,
 *   phone: string, regionId: string|null }>}
 */
export function createPatient(body) {
  return request('/users/patient', { method: 'POST', body })
}
