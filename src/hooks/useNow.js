import { useEffect, useState } from 'react'

/** 일정 시간을 기준으로 바뀌는 표시(진행 예정 → 진행중)를 위해 현재 시각을 주기적으로 갱신한다 */
export function useNow(intervalMs = 60_000) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])

  return now
}
