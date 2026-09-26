import { searchDischarges } from '../../api/endpoints/discharge'
import { useAsync } from '../../hooks/useAsync'

/** 홈에 보여줄 개수. 서버가 받는 size는 10/30/50뿐이다 */
const RECENT_SIZE = 10

async function loadRecentDischarges(signal) {
  // 기본 정렬이 createdAt DESC라 그대로 최근 등록순이 된다
  const page = await searchDischarges({ size: RECENT_SIZE, signal })
  return page?.content ?? []
}

/** 병원 담당자 홈의 최근 연계 환자 목록 */
export function useRecentDischarges() {
  return useAsync(loadRecentDischarges)
}
