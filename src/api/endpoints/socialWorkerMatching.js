import { request } from '../client'

/*
 * social-worker-service /social-worker-matchings (SocialWorkerMatching*ApiController)
 *
 * 공통
 * - 매칭 요청은 비동기다. 요청하면 taskId를 받고, task가 COMPLETED가 되면 matchingResultId로 결과를 조회한다
 * - task는 Redis에 1시간만 보관된다 (matching.task.ttl). 지나면 404 TASK_NOT_FOUND
 * - '내 매칭 조회' API는 없어서 taskId·matchingResultId를 잃으면 다시 찾을 수 없다
 * - 오류 message는 '사회복지사 매칭 요청 실패'처럼 뭉뚱그려 오므로 화면 문구는 code로 정한다
 */

/**
 * 사회복지사 매칭 요청 (퇴원 예정자 전용, 202 Accepted). 요청 본문 없음
 * - Care Plan 상태와 무관하게 요청할 수 있다
 * - REQUESTED·ACTIVE 매칭이 이미 있으면 409 SOCIAL_WORKER_MATCHING_ALREADY_IN_PROGRESS
 *   (FAILED·ENDED만 있으면 다시 요청할 수 있다)
 * - 퇴원 예정자가 아니면 403 SOCIAL_WORKER_MATCHING_FORBIDDEN
 * @returns {Promise<{ taskId: string }>}
 */
export function requestSocialWorkerMatching() {
  return request('/social-worker-matchings', { method: 'POST' })
}

/**
 * 매칭 처리 현황 (퇴원 예정자 본인 task만)
 * - PENDING → PROCESSING → COMPLETED | FAILED
 * - COMPLETED여도 매칭 결과는 ACTIVE(배정) 또는 FAILED(연결할 사회복지사 없음)일 수 있다
 * - FAILED는 처리 중 오류라 matchingResultId가 null이다
 * - 없거나 만료: 404 TASK_NOT_FOUND, 남의 task: 403 SOCIAL_WORKER_MATCHING_TASK_FORBIDDEN
 * @returns {Promise<{ taskId: string, taskStatus: 'PENDING'|'PROCESSING'|'COMPLETED'|'FAILED',
 *   matchingResultId: string|null }>}
 */
export function getSocialWorkerMatchingTask(taskId, { signal } = {}) {
  return request(`/social-worker-matchings/tasks/${taskId}`, { signal })
}

/**
 * 매칭 결과 (퇴원 예정자는 본인 것만)
 * - status: REQUESTED(매칭 중) · ACTIVE(연결됨) · FAILED(실패) · ENDED(종료)
 * - 사회복지사 이름·연락처는 오지 않는다 (socialWorkerId만)
 * - 없음: 404 MATCHING_RESULT_NOT_FOUND, 남의 결과: 403 SOCIAL_WORKER_MATCHING_QUERY_FORBIDDEN
 * @returns {Promise<{ matchingResultId: string, patientId: string, socialWorkerId: string|null,
 *   status: 'REQUESTED'|'ACTIVE'|'FAILED'|'ENDED', requestedAt: string, assignedAt: string|null }>}
 *   requestedAt·assignedAt은 UTC Instant
 */
export function getSocialWorkerMatching(matchingResultId, { signal } = {}) {
  return request(`/social-worker-matchings/${matchingResultId}`, { signal })
}
