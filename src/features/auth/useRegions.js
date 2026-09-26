import { getRegions } from '../../api/endpoints/region'
import { useAsync } from '../../hooks/useAsync'

const loadRegions = (signal) => getRegions({ signal })

/**
 * 서비스 가능한 지역 목록 조회
 *
 * 회원정보의 소속 지역 변경 시 사용한다.
 */
export function useRegions() {
  return useAsync(loadRegions)
}