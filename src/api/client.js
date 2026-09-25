/**
 * API 공통 클라이언트
 *
 * - 인증은 서버가 내려주는 HttpOnly 쿠키로만 처리한다. (토큰을 JS에서 다루지 않음)
 * - 게이트웨이에 CORS 설정이 없고 쿠키가 SameSite=Strict라서 항상 같은 origin(/api)으로 호출한다.
 *   개발 환경은 vite.config.js의 proxy가 게이트웨이로 넘겨준다.
 * - 성공 응답 { success, code, message, data } 에서 data만 꺼내 돌려준다.
 */

const API_BASE = '/api/v1'
const REISSUE_PATH = '/auth/reissue'

/** 서버 오류를 하나의 형태로 맞춘 에러 */
export class ApiError extends Error {
  /**
   * @param {number} status HTTP 상태 코드 (네트워크 오류는 0)
   * @param {string} code 서버 에러 코드 (예: EXPIRED_ACCESS_TOKEN)
   * @param {string} message 사용자에게 보여줄 수 있는 메시지
   */
  constructor(status, code, message) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

// 동시에 여러 요청이 만료되어도 재발급은 한 번만 보낸다
let reissuePromise = null

function reissue() {
  if (!reissuePromise) {
    reissuePromise = send(REISSUE_PATH, { method: 'POST' }).finally(() => {
      reissuePromise = null
    })
  }
  return reissuePromise
}

async function parseBody(response) {
  if (response.status === 204) return null

  const text = await response.text()
  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

/**
 * 게이트웨이 오류: { success, error: { message, errorCode } }
 * 서비스 오류:   { success, code, message, details }
 */
function toApiError(status, body) {
  const code = body?.error?.errorCode ?? body?.code ?? 'UNKNOWN'
  const message =
    body?.error?.message ?? body?.message ?? '요청을 처리하지 못했어요.'
  return new ApiError(status, String(code), message)
}

async function send(path, { method = 'GET', query, body, signal } = {}) {
  const params = new URLSearchParams()
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value))
    }
  })
  const search = params.toString()
  const url = `${API_BASE}${path}${search ? `?${search}` : ''}`

  let response
  try {
    response = await fetch(url, {
      method,
      credentials: 'same-origin',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal,
    })
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new ApiError(0, 'NETWORK_ERROR', '네트워크 연결을 확인해 주세요.')
  }

  const data = await parseBody(response)

  if (!response.ok) throw toApiError(response.status, data)

  return data?.data ?? null
}

/**
 * API 요청. 액세스 토큰이 만료되면 한 번 재발급한 뒤 같은 요청을 다시 보낸다.
 *
 * @param {string} path '/users/me' 처럼 /api/v1 뒤의 경로
 * @param {{ method?: string, query?: object, body?: object, signal?: AbortSignal }} options
 */
export async function request(path, options = {}) {
  try {
    return await send(path, options)
  } catch (error) {
    const expired =
      error instanceof ApiError && error.code === 'EXPIRED_ACCESS_TOKEN'
    if (!expired || path === REISSUE_PATH) throw error

    await reissue()
    return send(path, options)
  }
}

/** 화면에 보여줄 오류 문구 */
export function getErrorMessage(error) {
  if (!(error instanceof ApiError)) return '잠시 후 다시 시도해 주세요.'
  if (error.status === 0) return error.message
  if (error.status === 403) return '이용 권한이 없어요. 약관 동의를 마쳤다면 다시 로그인해 주세요.'
  if (error.status === 429) return '요청이 많아요. 잠시 후 다시 시도해 주세요.'
  if (error.status >= 500) return '서버에 문제가 생겼어요. 잠시 후 다시 시도해 주세요.'
  return error.message
}
