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

  /**
   * 요청 중인 페이지를 동기적으로 기록한다.
   *
   * stateRef는 렌더 이후에 갱신되므로, 감지 콜백이 같은 틱에 두 번 불리면
   * 둘 다 같은 페이지를 요청해 목록에 같은 항목이 두 번 들어간다.
   * (React key 중복 경고의 원인)
   */
  const pendingRef = useRef(null)

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

    return () => {
      controller.abort()
      pendingRef.current = null
    }
  }, [key, role, status])

  // 아직 이번 조건의 결과가 아니면 로딩으로 취급한다
  const current = state.key === key ? state : { ...EMPTY, key }

  const hasNext =
    current.status === 'success' && current.page + 1 < current.totalPages

  const loadMore = () => {
    const snapshot = stateRef.current

    if (pendingRef.current !== null) return
    if (snapshot.key !== key) return
    if (snapshot.status !== 'success') return
    if (snapshot.moreStatus === 'loading') return
    if (snapshot.page + 1 >= snapshot.totalPages) return

    const nextPage = snapshot.page + 1
    pendingRef.current = `${key}|${nextPage}`
    setState((prev) => ({ ...prev, moreStatus: 'loading', moreError: null }))

    searchUsers(toQuery(role, status, nextPage)).finally(() => {
      pendingRef.current = null
    }).then(
      (page) =>
        setState((prev) => {
          // 필터가 바뀐 뒤 늦게 도착한 응답은 버린다
          if (prev.key !== key) return prev

          // OFFSET 페이지네이션이라 정렬이 흔들리면 같은 항목이 넘어올 수 있다
          const seen = new Set(prev.items.map((item) => item.userId))
          const added = (page?.content ?? []).filter(
            (item) => !seen.has(item.userId),
          )

          return {
            ...prev,
            items: [...prev.items, ...added],
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

  /**
   * 승인·거절한 사용자를 목록에서 뺀다.
   * 전체를 다시 불러오면 스크롤 위치가 날아가서 해당 항목만 지운다.
   */
  const removeItem = (userId) =>
    setState((prev) => {
      if (prev.key !== key) return prev

      const items = prev.items.filter((item) => item.userId !== userId)
      if (items.length === prev.items.length) return prev

      return { ...prev, items, total: Math.max(0, prev.total - 1) }
    })

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
    removeItem,
  }
}
