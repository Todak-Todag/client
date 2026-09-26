import { useEffect, useState } from 'react'
import { searchUsers } from '../../api/endpoints/adminUser'

/** 서버가 받는 size는 10/30/50뿐이다 */
export const PAGE_SIZE = 30

const LOADING = { status: 'loading', data: null, error: null }

/**
 * 관리자 사용자 검색 결과.
 *
 * 필터가 바뀌면 처음부터 다시 조회한다.
 * (다음 단계에서 무한 스크롤을 붙일 예정이라 useAsync 대신 직접 관리한다)
 *
 * @param {{ role: number|'', status: number }} filters
 * @returns {{ status: 'loading'|'success'|'error', data: any[]|null, error: Error|null, reload: () => void }}
 */
export function useUserSearch({ role, status }) {
  const [result, setResult] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  // 어떤 조건으로 받아온 결과인지 표시해두고, 조건이 바뀌면 로딩으로 보여준다
  const key = `${role}|${status}|${reloadKey}`

  useEffect(() => {
    const controller = new AbortController()

    searchUsers({
      page: 0,
      size: PAGE_SIZE,
      // 빈 문자열이면 보내지 않아 서버가 '전체'로 처리하게 한다
      role: role === '' ? undefined : role,
      status,
      signal: controller.signal,
    }).then(
      (page) =>
        setResult({
          key,
          status: 'success',
          data: page?.content ?? [],
          error: null,
        }),
      (error) => {
        if (controller.signal.aborted) return
        setResult({ key, status: 'error', data: null, error })
      },
    )

    return () => controller.abort()
  }, [key, role, status])

  const reload = () => setReloadKey((prev) => prev + 1)

  // 아직 이번 조건의 결과가 아니면 로딩으로 취급한다
  return result?.key === key ? { ...result, reload } : { ...LOADING, reload }
}
