import { getMatchingAttempts } from '../../api/endpoints/schedule'
import { MATCHING_ATTEMPT_STATUS } from '../../constants/status'
import { useAsync } from '../../hooks/useAsync'

async function loadFailureCount(signal) {
  const page = await getMatchingAttempts({
    status: MATCHING_ATTEMPT_STATUS.FAILED,
    size: 10,
    signal,
  })
  return page?.pageInfo?.totalElements ?? page?.content?.length ?? 0
}

/**
 * 다시 요청해야 하는 매칭 실패 건수 (한 페이지만 받고 전체 건수는 pageInfo로 센다).
 * 서버가 CONFIRMED Care Plan에서만 결과를 주고 UNDER_REVIEW·COMPLETED·미존재는 403이므로 CONFIRMED에서만 호출한다.
 */
export function useMatchingFailureCount() {
  return useAsync(loadFailureCount)
}
