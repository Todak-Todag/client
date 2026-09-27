import { useEffect, useRef } from 'react'

/**
 * 목록 끝에 둔 요소가 화면에 들어오면 onLoadMore를 부른다.
 *
 * 스크롤 위치를 직접 계산하지 않고 IntersectionObserver에 맡긴다.
 * enabled가 false면 관찰을 끊어 중복 요청을 막는다.
 *
 * @param {{ enabled: boolean, onLoadMore: () => void, rootMargin?: string }} options
 * @returns {import('react').RefObject} 목록 끝 요소에 걸어줄 ref
 */
export function useInfiniteScroll({
  enabled,
  onLoadMore,
  rootMargin = '200px',
}) {
  const sentinelRef = useRef(null)
  const callbackRef = useRef(onLoadMore)

  // 매 렌더 새로 만들어지는 콜백 때문에 관찰이 다시 걸리지 않도록 ref에 담아둔다
  useEffect(() => {
    callbackRef.current = onLoadMore
  }, [onLoadMore])

  useEffect(() => {
    const target = sentinelRef.current
    if (!enabled || !target) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) callbackRef.current()
      },
      // 바닥에 닿기 전에 미리 불러와 끊김을 줄인다
      { rootMargin },
    )

    observer.observe(target)

    return () => observer.disconnect()
  }, [enabled, rootMargin])

  return sentinelRef
}
