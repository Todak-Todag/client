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
