/**
 * 환경 설정 모음.
 *
 * 값은 .env.development / .env.production 에서 읽어오며,
 * .env.local 을 만들면 개인 설정으로 덮어쓸 수 있습니다.
 * 코드 안에 서버 주소를 직접 쓰지 말고 항상 이 파일을 통해 가져다 쓰세요.
 */

/** 끝에 붙은 / 를 제거해 주소를 일관되게 만든다 */
function normalizeBaseUrl(url) {
  return String(url ?? '').replace(/\/+$/, '')
}

const API_BASE_URL = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL)

if (!API_BASE_URL) {
  throw new Error(
    'VITE_API_BASE_URL 이 설정되지 않았습니다. .env.development 또는 .env.local 을 확인해 주세요.',
  )
}

export const ENV = {
  /** API 서버 주소 (예: http://localhost:8080) */
  apiBaseUrl: API_BASE_URL,
  /** API 요청 타임아웃(ms) */
  apiTimeout: Number(import.meta.env.VITE_API_TIMEOUT ?? 10000),
  /** 개발 모드 여부 (npm run dev) */
  isDev: import.meta.env.DEV,
  /** 운영 빌드 여부 (npm run build) */
  isProd: import.meta.env.PROD,
  /** 현재 모드 이름: 'development' | 'production' | 그 외 커스텀 모드 */
  mode: import.meta.env.MODE,
}

export default ENV
