import { getCarePlans, getServicePreference } from '../../api/endpoints/carePlan'
import { getProvideServices } from '../../api/endpoints/provider'
import { getSchedule, getSchedules } from '../../api/endpoints/schedule'
import { fetchAllPages } from '../../api/paging'
import { SCHEDULE_STATUS } from '../../constants/status'
import { useAsync } from '../../hooks/useAsync'

/**
 * 희망 일정 → 서비스 종류 ID. 실패하면 이름만 비워 두도록 null
 */
async function findProvideServiceIdByPreference(servicePreferenceId, signal) {
  try {
    const preference = await getServicePreference(servicePreferenceId, { signal })
    return preference.provideServiceId
  } catch (error) {
    if (signal.aborted) throw error
    return null
  }
}

/**
 * 일정 → 서비스 종류 ID
 * 목록 응답에는 서비스 이름이 없어서 상세(servicePreferenceId) → 희망 일정(provideServiceId) 순으로 찾는다.
 * 한 건이 실패해도 목록 전체를 실패시키지 않고 이름만 비워 둔다.
 */
async function findProvideServiceId(serviceScheduleId, signal) {
  try {
    const detail = await getSchedule(serviceScheduleId, { signal })
    return await findProvideServiceIdByPreference(detail.servicePreferenceId, signal)
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

/**
 * 선택한 날짜의 서비스 일정 (시작 시각 순). 날짜가 바뀌면 다시 조회한다.
 * @param {string} date 'YYYY-MM-DD'
 * @returns {{ status: string, data: Array<{ serviceScheduleId: string, status: string,
 *   startedAt: string, finishedAt: string, serviceName: string|null,
 *   serviceContent: string|null }> | null,
 *   error: Error|null, reload: () => void }}
 */
export function useSchedulesByDate(date) {
  return useAsync(loadSchedulesByDate, date)
}

/**
 * 일정이 속한 Care Plan의 종료일 (하루 미루기 제한용).
 * 일정 응답에는 carePlanId가 없어서, 내 Care Plan 중 기간 안에 일정 날짜가 드는 것을 쓴다.
 * 못 찾거나 실패하면 null — 화면에서 막지 못해도 서버가 400으로 거절한다.
 */
async function findCarePlanFinishDate(date, signal) {
  try {
    const page = await getCarePlans({ size: 50, signal })
    // 'YYYY-MM-DD'는 문자열 비교가 날짜 비교와 같다
    const carePlan = (page?.content ?? []).find(
      (plan) => plan.startDate && plan.finishDate && plan.startDate <= date && date <= plan.finishDate,
    )
    return carePlan?.finishDate ?? null
  } catch (error) {
    if (signal.aborted) throw error
    return null
  }
}

/** 일정 상세 + 서비스 이름·내용 + Care Plan 종료일. 상세 조회가 실패하면 화면 전체를 오류로 보여준다 */
async function loadScheduleDetail(signal, serviceScheduleId) {
  const detail = await getSchedule(serviceScheduleId, { signal })
  const [infos, provideServiceId, carePlanFinishDate] = await Promise.all([
    loadServiceInfos(signal),
    findProvideServiceIdByPreference(detail.servicePreferenceId, signal),
    findCarePlanFinishDate(detail.date, signal),
  ])
  const info = infos.get(provideServiceId)

  return {
    ...detail,
    serviceName: info?.name ?? null,
    serviceContent: info?.content ?? null,
    carePlanFinishDate,
  }
}

/**
 * 일정 상세 (취소 사유·일시 포함)
 * @param {string} serviceScheduleId
 * @returns {{ status: string, data: { serviceScheduleId: string, servicePreferenceId: string,
 *   serviceOfferingId: string, status: string, date: string, startedAt: string, finishedAt: string,
 *   cancelReason: string|null, canceledAt: string|null, serviceName: string|null,
 *   serviceContent: string|null, carePlanFinishDate: string|null } | null,
 *   error: Error|null, reload: () => void }}
 */
export function useScheduleDetail(serviceScheduleId) {
  return useAsync(loadScheduleDetail, serviceScheduleId)
}

/** 일정이 있는 날짜 모음. 목록에서 숨기는 CHANGED는 빼서 목록과 점 표시가 어긋나지 않게 한다 */
async function loadScheduleDates(signal) {
  const schedules = await fetchAllPages(getSchedules, { signal })
  return new Set(
    schedules
      .filter((schedule) => schedule.status !== SCHEDULE_STATUS.CHANGED)
      .map((schedule) => schedule.date),
  )
}

/**
 * 주간 날짜 바의 점 표시용: 일정이 있는 날짜 Set ('YYYY-MM-DD')
 * 보조 정보라 실패해도 화면은 점 없이 보여준다.
 */
export function useScheduleDates() {
  return useAsync(loadScheduleDates)
}
