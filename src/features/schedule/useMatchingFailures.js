import { useAsync } from '../../hooks/useAsync'
import { loadFailedAttempts } from '../matching/useMatchingAttempts'
import { readRequestedRetries } from '../matching/matchingStorage'

/**
 * 다시 요청해야 하는 매칭 실패 건수. 매칭 현황 화면과 같은 기준으로 센다.
 * - 같은 희망 일정의 실패가 여러 번 쌓여도 한 건 (가장 최근 실패만 다시 요청할 수 있음)
 * - 이번 탭에서 이미 다시 요청한 건은 빼기 (서버는 결과가 나올 때까지 FAILED로 둔다)
 */
async function loadFailureCount(signal) {
  const failed = await loadFailedAttempts(signal)
  const requested = readRequestedRetries()
  return failed.filter((attempt) => !requested.has(attempt.matchingAttemptId)).length
}

/**
 * 다시 요청해야 하는 매칭 실패 건수.
 * 서버가 CONFIRMED Care Plan에서만 결과를 주고 UNDER_REVIEW·COMPLETED·미존재는 403이므로 CONFIRMED에서만 호출한다.
 */
export function useMatchingFailureCount() {
  return useAsync(loadFailureCount)
}
