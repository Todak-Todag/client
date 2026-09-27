import { request } from '../client'

/**
 * 퇴원건 목록 조회 (병원 담당자 전용, 본인이 등록한 건만)
 *
 * size는 10/30/50만 받고 그 외 값은 서버가 10으로 보정한다.
 * 정렬 기준은 항상 createdAt이고 sort로는 방향만 바꿀 수 있다. (기본 최신순)
 *
 * @returns {Promise<{ content: Array<{ dischargeId: string, patientId: string,
 *   hospitalName: string,
 *   status: 'SCHEDULED'|'POSTPONED'|'COMPLETED'|'CANCELED',
 *   scheduledDate: string, actualDate: string|null }>, pageInfo: object }>}
 */
export function searchDischarges({
  page,
  size,
  sort,
  status,
  scheduledDate,
  signal,
} = {}) {
  return request('/discharges', {
    query: { page, size, sort, status, scheduledDate },
    signal,
  })
}

/**
 * 퇴원건 생성 (병원 담당자 전용)
 *
 * scheduledDate는 미래 날짜여야 한다. (서버 @Future — 오늘도 거부)
 * @param {{ patientId: string, hospitalName: string, scheduledDate: string }} body
 * @returns {Promise<{ dischargeId: string }>}
 */
export function createDischarge(body) {
  return request('/discharges', { method: 'POST', body })
}

/**
 * 퇴원 완료 처리 (병원 담당자 전용)
 *
 * actualDate는 필수이며 오늘보다 뒤일 수 없다. (서버 @PastOrPresent)
 * 완료되어야 Care Plan을 만들 수 있다.
 *
 * @param {{ actualDate: string }} body 'YYYY-MM-DD'
 * @returns {Promise<{ dischargeId: string, status: string, actualDate: string }>}
 */
export function completeDischarge(dischargeId, body) {
  return request(`/discharges/${dischargeId}/completed`, {
    method: 'PATCH',
    body,
  })
}
