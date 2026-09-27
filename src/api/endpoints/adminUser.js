import { request } from '../client'

/**
 * 관리자 사용자 검색 (운영자·관리자 전용)
 *
 * role을 생략하면 전체, status를 생략하면 승인됨(1)이 기본이다.
 * size는 10/30/50만 받고 그 외 값은 서버가 10으로 보정한다.
 *
 * @returns {Promise<{ content: Array<{ userId: string, name: string, phone: string,
 *   province: string, district: string, regionId: string,
 *   status: 'APPROVED'|'SUSPENDED'|'WITHDRAWN'|'PENDING'|'REJECTED',
 *   role: string, isDeleted: boolean }>, pageInfo: object }>}
 */
export function searchUsers({ page, size, role, status, signal } = {}) {
  return request('/admin/users/search', {
    query: { page, size, role, status },
    signal,
  })
}

/**
 * 회원가입 승인 (운영자·관리자 전용)
 *
 * 승인에는 사유를 보내면 안 된다. (서버: USER_APPROVAL_CONFLICT)
 */
export function approveUser(userId) {
  return request(`/admin/users/${userId}/status`, {
    method: 'PATCH',
    body: { accept: true },
  })
}

/**
 * 회원가입 거절 (운영자·관리자 전용)
 *
 * 거절에는 사유가 반드시 필요하다. (서버: USER_REJECT_CONFLICT)
 */
export function rejectUser(userId, rejectReason) {
  return request(`/admin/users/${userId}/status`, {
    method: 'PATCH',
    body: { accept: false, rejectReason },
  })
}
