import { getMatchingResult } from '../../api/endpoints/socialWorker'
import { useAsync } from '../../hooks/useAsync'

/**
 * matchingResultId로 사회복지사 매칭 결과 한 건을 조회한다.
 *
 * 서버에는 현재 사회복지사 자신의 매칭 목록 조회 API가 없으므로
 * matchingResultId가 없는 경우 별도의 API 요청을 만들지 않는다.
 */
async function loadMatching(signal, matchingResultId) {
  if (!matchingResultId) {
    return null
  }

  return getMatchingResult(matchingResultId, { signal })
}

/**
 * 사회복지사 매칭 결과 단건 조회
 *
 * @param {string|undefined} matchingResultId
 */
export function useMatching(matchingResultId) {
  return useAsync(loadMatching, matchingResultId)
}