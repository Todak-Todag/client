/**
 * 목록 API의 모든 페이지를 모아 content 배열 하나로 돌려준다.
 *
 * 서버 목록 API는 size를 10/30/50만 받고(그 외는 10으로 보정) pageInfo.totalPages를 내려준다.
 * 한 화면에서 전체 개수로 계산해야 하는 목록(예: 서비스별 희망 일정 수)에만 쓴다.
 *
 * @param {(params: { page: number, size: number, signal?: AbortSignal }) => Promise<{ content: any[], pageInfo: { totalPages: number } }>} fetchPage
 * @param {{ size?: 10|30|50, signal?: AbortSignal }} options
 * @returns {Promise<any[]>}
 */
export async function fetchAllPages(fetchPage, { size = 50, signal } = {}) {
  const first = await fetchPage({ page: 0, size, signal })
  const totalPages = first?.pageInfo?.totalPages ?? 1
  const content = [...(first?.content ?? [])]

  if (totalPages <= 1) return content

  const rest = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) =>
      fetchPage({ page: index + 1, size, signal }),
    ),
  )
  for (const page of rest) content.push(...(page?.content ?? []))
  return content
}
