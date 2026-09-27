import { getMatchingAttempts } from '../../api/endpoints/schedule'
import { fetchAllPages } from '../../api/paging'
import { MATCHING_ATTEMPT_STATUS } from '../../constants/status'
import { useAsync } from '../../hooks/useAsync'
import { loadServiceInfos } from '../schedule/useSchedules'
import { pickLatestByPreference, sortByDate } from './matchingStatus'

const fetchAttempts = (status, signal) =>
  fetchAllPages((params) => getMatchingAttempts({ status, ...params }), { signal })

/**
 * 다시 요청해야 하는 실패 건 (희망 일정마다 가장 최근 FAILED 하나).
 * 서버가 이미 일정이 생긴 희망 일정의 실패는 빼고 준다.
 */
export async function loadFailedAttempts(signal) {
  const failed = await fetchAttempts(MATCHING_ATTEMPT_STATUS.FAILED, signal)
  return pickLatestByPreference(failed, 'failedAt')
}

async function loadMatchingAttempts(signal) {
  const [failed, matched, infos] = await Promise.all([
    loadFailedAttempts(signal),
    fetchAttempts(MATCHING_ATTEMPT_STATUS.MATCHED, signal),
    loadServiceInfos(signal),
  ])

  const withName = (attempt) => ({
    ...attempt,
    serviceName: infos.get(attempt.provideServiceId)?.name ?? null,
  })

  return {
    failed: sortByDate(failed).map(withName),
    // 일정 변경으로 다시 매칭되면 같은 희망 일정의 MATCHED가 또 쌓이므로 최근 것(현재 일정 날짜)만 남긴다
    matched: sortByDate(pickLatestByPreference(matched, 'matchedAt')).map(withName),
  }
}

/**
 * 매칭 현황: 다시 요청이 필요한 실패 건 + 매칭 완료 건 (날짜순, 서비스 이름 포함).
 * 서버가 CONFIRMED Care Plan에서만 결과를 주고 UNDER_REVIEW·COMPLETED·미존재는 403이므로 CONFIRMED에서만 호출한다.
 *
 * @returns {{ status: string, data: { failed: Array<object>, matched: Array<object> } | null,
 *   error: Error|null, reload: () => void }}
 *   각 항목: { matchingAttemptId, servicePreferenceId, provideServiceId, date,
 *   preferredTimeSlot(MATCHED는 항상 null), status, failureReason, failedAt, matchedAt, serviceName }
 */
export function useMatchingAttempts() {
  return useAsync(loadMatchingAttempts)
}
