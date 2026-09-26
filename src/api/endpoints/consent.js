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
