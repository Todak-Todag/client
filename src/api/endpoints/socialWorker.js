import { request } from '../client'

/**
 * 사회복지사 매칭 처리 현황 조회
 *
 * @param {string} taskId
 * @returns {Promise<{
 *   taskId: string,
 *   taskStatus: 'PENDING'|'PROCESSING'|'COMPLETED'|'FAILED',
 *   matchingResultId: string|null
 * }>}
 */
export function getMatchingTaskStatus(taskId, { signal } = {}) {
  return request(`/social-worker-matchings/tasks/${taskId}`, {
    signal,
  })
}

/**
 * 사회복지사 매칭 결과 조회
 *
 * @param {string} matchingResultId
 * @returns {Promise<{
 *   matchingResultId: string,
 *   patientId: string,
 *   socialWorkerId: string|null,
 *   status: 'REQUESTED'|'ACTIVE'|'FAILED'|'ENDED',
 *   requestedAt: string,
 *   assignedAt: string|null
 * }>}
 */
export function getMatchingResult(matchingResultId, { signal } = {}) {
  return request(`/social-worker-matchings/${matchingResultId}`, {
    signal,
  })
}