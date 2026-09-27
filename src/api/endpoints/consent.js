import { request } from '../client'

/**
 * 동의서 목록 조회
 */
export function getConsentDocuments({ signal } = {}) {
  return request('/consent-documents', { signal });
}

export function getConsentDocument(consentDocumentVersionId, { signal } = {}) {
  return request(`/consent-documents/${consentDocumentVersionId}`, { signal });
}

/**
 * 약관 동의 (로그인 상태에서 호출)
 *
 * 동의 주체는 요청 본문이 아니라 토큰의 userId로 정해진다.
 * 그래서 동의 전 퇴원 예정자의 임시 토큰으로도 호출할 수 있다.
 *
 * 서버는 현재 버전의 필수 약관을 모두 동의해야 계정을 승인한다.
 * 일부만 보내면 동의 기록만 남고 승인되지 않으며, 다음 로그인은
 * 403 USER_LOGIN_WITHDRAWN으로 막힌다. (동의 이력이 생겨 임시 토큰 분기를 벗어남)
 *
 * @param {string[]} consentDocumentVersionIds 최소 1개
 * @returns {Promise<{ consentIds: string[] }>}
 */
export function createConsent(consentDocumentVersionIds) {
  return request('/consents', {
    method: 'POST',
    body: { consentDocumentVersionIds },
  })
}
