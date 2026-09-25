import { ENV } from '../config/env'

const TOKEN_KEY = 'todak.accessToken'

/** 저장된 액세스 토큰을 읽는다 */
export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

/** 액세스 토큰을 저장한다. null 을 넘기면 삭제한다 */
export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* 사생활 보호 모드 등 저장 불가 환경은 무시 */
  }
}

/** API 에러. status 로 상황을 구분하고 message 는 화면에 그대로 보여줄 수 있다 */
export class ApiError extends Error {
  constructor(message, { status = 0, code = '', data = null } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.data = data
  }
}

function buildUrl(path, params) {
  const url = new URL(
    path.startsWith('http') ? path : `${ENV.apiBaseUrl}${path}`,
  )

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, value)
      }
    })
  }

  return url.toString()
}

async function parseBody(response) {
  if (response.status === 204) return null

  const contentType = response.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    try {
      return await response.json()
    } catch {
      return null
    }
  }

  return response.text()
}

/**
 * 공통 요청 함수.
 *
 * @param {string} path '/auth/login' 처럼 서버 주소를 뺀 경로
 * @param {object} options
 * @param {string} options.method HTTP 메서드 (기본 GET)
 * @param {any} options.body JSON 으로 보낼 본문
 * @param {object} options.params 쿼리 스트링
 * @param {boolean} options.auth 저장된 토큰을 Authorization 헤더에 붙일지 (기본 true)
 * @param {AbortSignal} options.signal 요청 취소 신호
 */
export async function request(
  path,
  { method = 'GET', body, params, headers, auth = true, signal, ...rest } = {},
) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), ENV.apiTimeout)

  // 호출한 쪽에서 준 signal 도 같이 동작하도록 연결
  if (signal) {
    if (signal.aborted) controller.abort()
    else signal.addEventListener('abort', () => controller.abort(), { once: true })
  }

  const token = auth ? getToken() : null
  const isFormData = body instanceof FormData

  try {
    const response = await fetch(buildUrl(path, params), {
      method,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(body && !isFormData ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: isFormData ? body : body ? JSON.stringify(body) : undefined,
      ...rest,
    })

    const data = await parseBody(response)

    if (!response.ok) {
      throw new ApiError(
        data?.message || `요청에 실패했습니다. (${response.status})`,
        { status: response.status, code: data?.code ?? '', data },
      )
    }

    return data
  } catch (error) {
    if (error instanceof ApiError) throw error

    if (error.name === 'AbortError') {
      throw new ApiError('요청 시간이 초과되었습니다. 다시 시도해 주세요.', {
        status: 0,
        code: 'TIMEOUT',
      })
    }

    throw new ApiError('서버에 연결할 수 없습니다. 네트워크를 확인해 주세요.', {
      status: 0,
      code: 'NETWORK',
    })
  } finally {
    clearTimeout(timeoutId)
  }
}

export const api = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  put: (path, body, options) => request(path, { ...options, method: 'PUT', body }),
  patch: (path, body, options) => request(path, { ...options, method: 'PATCH', body }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
}

export default api
