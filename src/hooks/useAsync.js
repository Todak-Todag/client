import { useEffect, useState } from 'react'

const LOADING = { status: 'loading', data: null, error: null }

/**
 * 비동기 조회 상태 관리 (loading → success | error)
 *
 * @param {(signal: AbortSignal) => Promise<any>} loader 모듈 레벨에 선언된 조회 함수 (매 렌더 새로 만들지 않기)
 * @returns {{ status: 'loading'|'success'|'error', data: any, error: Error|null, reload: () => void }}
 */
export function useAsync(loader) {
  const [state, setState] = useState(LOADING)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    loader(controller.signal).then(
      (data) => setState({ status: 'success', data, error: null }),
      (error) => {
        if (controller.signal.aborted) return
        setState({ status: 'error', data: null, error })
      },
    )

    return () => controller.abort()
  }, [loader, reloadKey])

  const reload = () => {
    setState(LOADING)
    setReloadKey((key) => key + 1)
  }

  return { ...state, reload }
}
