import { useEffect, useRef, useState } from 'react'
import { searchUsers } from '../../api/endpoints/adminUser'

/** 서버가 받는 size는 10/30/50뿐이다 */
export const PAGE_SIZE = 30

const EMPTY = {
  key: null,
  status: 'loading',
  items: [],
  page: -1,
  totalPages: 0,
  total: 0,
  error: null,
  moreStatus: 'idle',
  moreError: null,
}

/** role이 빈 문자열이면 보내지 않아 서버가 '전체'로 처리하게 한다 */
function toQuery(role, status, page) {
  return {
    page,
    size: PAGE_SIZE,
    role: role === '' ? undefined : role,
    status,
  }
}

/**
 * 관리자 사용자 검색 (무한 스크롤).
 *
 * 필터가 바뀌면 처음부터 다시 받고, loadMore로 다음 페이지를 이어붙인다.
 * 서버 pageInfo에 hasNext가 없어 page + 1 < totalPages로 판단한다.
 *
 * @param {{ role: number|'', status: number }} filters
 */
export function useUserSearch({ role, status }) {
  const [reloadKey, setReloadKey] = useState(0)
  const [state, setState] = useState(EMPTY)

  // 어떤 조건으로 받아온 결과인지 표시해두고, 조건이 바뀌면 로딩으로 보여준다
  const key = `${role}|${status}|${reloadKey}`

  // loadMore가 최신 상태를 보도록 따로 담아둔다
  const stateRef = useRef(state)
  useEffect(() => {
    stateRef.current = state
  }, [state])

  useEffect(() => {
    const controller = new AbortController()

    searchUsers({ ...toQuery(role, status, 0), signal: controller.signal }).then(
      (page) =>
        setState({
          ...EMPTY,
          key,
          status: 'success',
          items: page?.content ?? [],
          page: 0,
          totalPages: page?.pageInfo?.totalPages ?? 1,
          total: page?.pageInfo?.totalElements ?? page?.content?.length ?? 0,
        }),
      (error) => {
        if (controller.signal.aborted) return
        setState({ ...EMPTY, key, status: 'error', error })
      },
    )

    return () => controller.abort()
  }, [key, role, status])

  // 아직 이번 조건의 결과가 아니면 로딩으로 취급한다
  const current = state.key === key ? state : { ...EMPTY, key }

  const hasNext =
    current.status === 'success' && current.page + 1 < current.totalPages

  const loadMore = () => {
    const snapshot = stateRef.current

    if (snapshot.key !== key) return
    if (snapshot.status !== 'success') return
    if (snapshot.moreStatus === 'loading') return
    if (snapshot.page + 1 >= snapshot.totalPages) return

    const nextPage = snapshot.page + 1
    setState((prev) => ({ ...prev, moreStatus: 'loading', moreError: null }))

    searchUsers(toQuery(role, status, nextPage)).then(
      (page) =>
        setState((prev) => {
          // 필터가 바뀐 뒤 늦게 도착한 응답은 버린다
          if (prev.key !== key) return prev

          return {
            ...prev,
            items: [...prev.items, ...(page?.content ?? [])],
            page: nextPage,
            totalPages: page?.pageInfo?.totalPages ?? prev.totalPages,
            total: page?.pageInfo?.totalElements ?? prev.total,
            moreStatus: 'idle',
            moreError: null,
          }
        }),
      (error) =>
        setState((prev) =>
          prev.key !== key
            ? prev
            : { ...prev, moreStatus: 'error', moreError: error },
        ),
    )
  }

  const reload = () => setReloadKey((prev) => prev + 1)

  return {
    status: current.status,
    items: current.items,
    total: current.total,
    error: current.error,
    hasNext,
    loadingMore: current.moreStatus === 'loading',
    moreError: current.moreStatus === 'error' ? current.moreError : null,
    loadMore,
    reload,
  }
}
