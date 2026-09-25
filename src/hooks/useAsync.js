import { useEffect, useState } from 'react'

// 첫 렌더에서는 어떤 요청 결과와도 맞지 않도록 reloadKey를 -1로 둔다
const INITIAL = { status: 'loading', data: null, error: null, param: undefined, reloadKey: -1 }

/**
 * 비동기 조회 상태 관리 (loading → success | error)
 *
 * @param {(signal: AbortSignal, param?: any) => Promise<any>} loader 모듈 레벨에 선언된 조회 함수 (매 렌더 새로 만들지 않기)
 * @param {string|number} [param] 조회 조건 (예: 날짜). 바뀌면 다시 조회한다. 원시값만 넘길 것
 * @returns {{ status: 'loading'|'success'|'error', data: any, error: Error|null, reload: () => void }}
 */
export function useAsync(loader, param) {
  const [state, setState] = useState(INITIAL)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    loader(controller.signal, param).then(
      (data) => setState({ status: 'success', data, error: null, param, reloadKey }),
      (error) => {
        if (controller.signal.aborted) return
        setState({ status: 'error', data: null, error, param, reloadKey })
      },
    )

    return () => controller.abort()
  }, [loader, param, reloadKey])

  const reload = () => setReloadKey((key) => key + 1)

  // 조건이 바뀌었거나 다시 시도 중이면 이전 결과 대신 로딩으로 보여준다
  const isStale = state.param !== param || state.reloadKey !== reloadKey
  const { status, data, error } = isStale ? INITIAL : state

  return { status, data, error, reload }
}
