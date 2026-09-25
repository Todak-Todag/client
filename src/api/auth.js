import api, { setToken } from './client'

/**
 * 로그인
 *
 * @param {{ username: string, password: string }} credentials
 * @returns 서버 응답 (accessToken, user 등)
 */
export async function login({ username, password }) {
  const data = await api.post(
    '/api/v1/auth/login',
    { username, password },
    { auth: false },
  )

  if (data?.accessToken) setToken(data.accessToken)

  return data
}

/** 로그아웃. 서버 호출이 실패해도 로컬 토큰은 지운다 */
export async function logout() {
  try {
    await api.post('/auth/logout')
  } finally {
    setToken(null)
  }
}

/** 내 정보 조회 */
export function getMe() {
  return api.get('/auth/me')
}
