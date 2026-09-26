import { getServicePreference } from '../../api/endpoints/carePlan'
import { getProvideServices } from '../../api/endpoints/provider'
import { getSchedule, getSchedules } from '../../api/endpoints/schedule'
import { toLocalDateString } from '../../utils/date'
import { SCHEDULE_STATUS } from '../../constants/status'
import { useAsync } from '../../hooks/useAsync'

/**
 * 일정 → 서비스 종류 ID
 * 목록 응답에는 서비스 이름이 없어서 상세(servicePreferenceId) → 희망 일정(provideServiceId) 순으로 찾는다.
 * 한 건이 실패해도 목록 전체를 실패시키지 않고 이름만 비워 둔다.
 */
async function findProvideServiceId(serviceScheduleId, signal) {
  try {
    const detail = await getSchedule(serviceScheduleId, { signal })
    const preference = await getServicePreference(detail.servicePreferenceId, { signal })
    return preference.provideServiceId
  } catch (error) {
    if (signal.aborted) throw error
    return null
  }
}

// 서비스 종류는 앱을 쓰는 동안 바뀌지 않아서, 날짜를 바꿀 때마다 다시 받지 않도록 성공한 결과만 보관한다
let serviceInfoCache = null

/** 서비스 종류 ID → { name, content }. 실패해도 목록은 보여줄 수 있도록 빈 Map을 돌려준다. */
async function loadServiceInfos(signal) {
  if (serviceInfoCache) return serviceInfoCache

  try {
    // 서비스 종류는 수가 적어 한 페이지(최대 50)로 충분하다
    const page = await getProvideServices({ size: 50, signal })
    serviceInfoCache = new Map(
      (page?.content ?? []).map((item) => [
        item.provideServiceId,
        { name: item.provideServiceName, content: item.content },
      ]),
    )
    return serviceInfoCache
  } catch (error) {
    if (signal.aborted) throw error
    return new Map()
  }
}

/**
 * 특정 날짜의 서비스 일정 (시작 시각 순)
 * @param {string} date 'YYYY-MM-DD'
 */
async function loadSchedulesByDate(signal, date) {
  // size는 서버가 10/30/50만 허용한다. 하루 일정이 50건을 넘는 경우는 없다고 본다
  const page = await getSchedules({ date, size: 50, signal })

  const schedules = (page?.content ?? [])
    .filter((schedule) => schedule.status !== SCHEDULE_STATUS.CHANGED)
    // 서버 정렬은 createdAt만 지원해서 시작 시각 순으로 다시 정렬한다
    .sort((a, b) => a.startedAt.localeCompare(b.startedAt))

  if (schedules.length === 0) return []

  const [infos, provideServiceIds] = await Promise.all([
    loadServiceInfos(signal),
    Promise.all(
      schedules.map((schedule) => findProvideServiceId(schedule.serviceScheduleId, signal)),
    ),
  ])

  return schedules.map((schedule, index) => {
    const info = infos.get(provideServiceIds[index])
    return {
      ...schedule,
      serviceName: info?.name ?? null,
      serviceContent: info?.content ?? null,
    }
  })
}

const loadTodaySchedules = (signal) => loadSchedulesByDate(signal, toLocalDateString())

/**
 * 오늘 받을 서비스 일정 (시작 시각 순)
 * @returns {{ status: string, data: Array<{ serviceScheduleId: string, status: string,
 *   startedAt: string, finishedAt: string, serviceName: string|null,
 *   serviceContent: string|null }> | null,
 *   error: Error|null, reload: () => void }}
 */
export function useTodaySchedules() {
  return useAsync(loadTodaySchedules)
}

/**
 * 선택한 날짜의 서비스 일정 (시작 시각 순). 날짜가 바뀌면 다시 조회한다.
 * @param {string} date 'YYYY-MM-DD'
 * @returns 반환 형태는 useTodaySchedules와 같다
 */
export function useSchedulesByDate(date) {
  return useAsync(loadSchedulesByDate, date)
}
