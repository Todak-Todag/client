import { getMyOfferings } from '../../api/endpoints/provider'
import { useAsync } from '../../hooks/useAsync'

/** 내가 등록한 제공 서비스 (일정 등록 화면의 선택지) */
const loadMyOfferings = async (signal) => {
  const page = await getMyOfferings({ size: 50, signal })
  return page?.content ?? []
}

export function useMyOfferings() {
  return useAsync(loadMyOfferings)
}
