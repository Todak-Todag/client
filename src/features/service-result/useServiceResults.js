import { getResult, getResults, getSchedule } from '../../api/endpoints/schedule'
import { fetchAllPages } from '../../api/paging'
import { useAsync } from '../../hooks/useAsync'
import {
  findProvideServiceIdByPreference,
  loadServiceInfos,
} from '../schedule/useSchedules'

/** 수행 결과 목록. 서버 정렬은 createdAt만 지원해서 수행 시각이 최근인 순으로 다시 정렬한다 */
async function loadResults(signal) {
  const results = await fetchAllPages(getResults, { signal })
  return results.sort((a, b) => b.startedAt.localeCompare(a.startedAt))
}

/**
 * 내 서비스 수행 결과 목록 (GET /service-results. 퇴원 예정자는 본인 Care Plan의 결과만 내려온다)
 * 목록 응답(ServiceResultSearchResponse)에는 서비스 이름·상태·특이사항이 없어 날짜와 수행 시간만 보여준다.
 * @returns {{ status: string, data: Array<{ serviceResultId: string, startedAt: string,
 *   finishedAt: string }> | null, error: Error|null, reload: () => void }}
 */
export function useServiceResults() {
  return useAsync(loadResults)
}

/**
 * 결과 → 일정(상태) → 희망 일정 → 서비스 이름 순으로 찾는다.
 * 상세 응답(ServiceResultDetailResponse)에는 serviceScheduleId와 note만 더 있고 상태·서비스 이름이 없다.
 * 결과는 COMPLETED·NO_SHOW 일정에만 등록되므로 상태는 둘 중 하나다.
 * 결과 조회가 실패하면 화면 전체를 오류로 보여주고, 일정 조회가 실패하면 이름·상태만 비워 둔다.
 */
async function loadResultDetail(signal, serviceResultId) {
  const result = await getResult(serviceResultId, { signal })

  let schedule = null
  try {
    schedule = await getSchedule(result.serviceScheduleId, { signal })
  } catch (error) {
    if (signal.aborted) throw error
  }

  const [infos, provideServiceId] = await Promise.all([
    loadServiceInfos(signal),
    schedule
      ? findProvideServiceIdByPreference(schedule.servicePreferenceId, signal)
      : Promise.resolve(null),
  ])

  return {
    ...result,
    scheduleStatus: schedule?.status ?? null,
    serviceName: infos.get(provideServiceId)?.name ?? null,
  }
}

/**
 * 수행 결과 상세
 * @param {string} serviceResultId
 * @returns {{ status: string, data: { serviceResultId: string, serviceScheduleId: string,
 *   startedAt: string, finishedAt: string, note: string|null,
 *   scheduleStatus: string|null, serviceName: string|null } | null,
 *   error: Error|null, reload: () => void }}
 */
export function useServiceResultDetail(serviceResultId) {
  return useAsync(loadResultDetail, serviceResultId)
}
