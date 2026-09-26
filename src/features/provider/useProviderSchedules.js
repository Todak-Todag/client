import { getMyOfferings } from '../../api/endpoints/provider'
import {
  getResult,
  getResults,
  getSchedule,
  getSchedules,
} from '../../api/endpoints/schedule'
import { SCHEDULE_STATUS } from '../../constants/status'
import { useAsync } from '../../hooks/useAsync'
import { getProviderScheduleView } from './providerScheduleStatus'
import { toLocalDateString } from '../../utils/date'

// 내 제공 서비스는 자주 바뀌지 않아 성공한 결과만 보관한다
let offeringCache = null

/** 제공 서비스 ID → 서비스 이름. 실패해도 목록은 보여줄 수 있도록 빈 Map을 돌려준다. */
async function loadOfferingNames(signal) {
  if (offeringCache) return offeringCache

  try {
    const page = await getMyOfferings({ size: 50, signal })
    offeringCache = new Map(
      (page?.content ?? []).map((item) => [item.serviceOfferingId, item.provideServiceName]),
    )
    return offeringCache
  } catch (error) {
    if (signal.aborted) throw error
    return new Map()
  }
}

/**
 * 일정 ID → 수행 결과.
 * 결과 목록 응답에 일정 ID가 없어 건별 상세로 채운다. 한 건이 실패해도 목록은 그대로 보여준다.
 */
async function loadResultMap(signal) {
  try {
    const page = await getResults({ size: 50, signal })
    const details = await Promise.all(
      (page?.content ?? []).map((item) =>
        getResult(item.serviceResultId, { signal }).catch((error) => {
          if (signal.aborted) throw error
          return null
        }),
      ),
    )

    return new Map(details.filter(Boolean).map((detail) => [detail.serviceScheduleId, detail]))
  } catch (error) {
    if (signal.aborted) throw error
    return new Map()
  }
}

/** 일정 → 제공 서비스 ID. 목록 응답에 없어 상세로 확인한다. */
async function findServiceOfferingId(serviceScheduleId, signal) {
  try {
    const detail = await getSchedule(serviceScheduleId, { signal })
    return detail.serviceOfferingId
  } catch (error) {
    if (signal.aborted) throw error
    return null
  }
}

// 화면에 보여줄 순서: 결과 작성 필요 → 수행 완료 필요 → 예정 → 진행 중 → 결과 작성 완료 → 미수행
const BADGE_ORDER = [
  '결과 작성 필요',
  '수행 완료 필요',
  '예정',
  '진행 중',
  '결과 작성 완료',
  '미수행',
]

function badgeOrder(schedule, now) {
  const { label } = getProviderScheduleView(schedule, Boolean(schedule.result), now)
  const index = BADGE_ORDER.indexOf(label)

  return index === -1 ? BADGE_ORDER.length : index
}

/** 특정 날짜에 내가 방문할 일정 (할 일이 남은 순서) */
async function loadSchedulesByDate(signal, date) {
  const page = await getSchedules({ date, size: 50, signal })

  // 제공자가 할 일이 없는 일정은 목록에서 뺀다
  // CHANGED: 재매칭으로 자리를 넘긴 과거 이력
  // CANCELED: 취소된 방문
  // RESCHEDULING: 재매칭 결과를 기다리는 중이라 확정 전까지는 방문하지 않는다
  const hiddenStatuses = [
    SCHEDULE_STATUS.CHANGED,
    SCHEDULE_STATUS.CANCELED,
    SCHEDULE_STATUS.RESCHEDULING,
  ]

  const schedules = (page?.content ?? []).filter(
    (schedule) => !hiddenStatuses.includes(schedule.status),
  )

  if (schedules.length === 0) return []

  const [names, results, offeringIds] = await Promise.all([
    loadOfferingNames(signal),
    loadResultMap(signal),
    Promise.all(
      schedules.map((schedule) => findServiceOfferingId(schedule.serviceScheduleId, signal)),
    ),
  ])

  const now = new Date()

  return schedules
    .map((schedule, index) => ({
      ...schedule,
      serviceOfferingId: offeringIds[index],
      serviceName: names.get(offeringIds[index]) ?? null,
      result: results.get(schedule.serviceScheduleId) ?? null,
    }))
    // 할 일이 남은 카드가 위로 오도록 배지 기준으로 묶고, 같은 묶음 안에서는 시작 시각 순
    .sort((a, b) => {
      const rankA = badgeOrder(a, now)
      const rankB = badgeOrder(b, now)

      return rankA - rankB || a.startedAt.localeCompare(b.startedAt)
    })
}

const loadTodaySchedules = (signal) => loadSchedulesByDate(signal, toLocalDateString())

/**
 * 오늘 방문할 일정
 * @returns {{ status: string, data: Array|null, error: Error|null, reload: () => void }}
 */
export function useTodayProviderSchedules() {
  return useAsync(loadTodaySchedules)
}

/** 선택한 날짜의 일정. 날짜가 바뀌면 다시 조회한다. */
export function useProviderSchedulesByDate(date) {
  return useAsync(loadSchedulesByDate, date)
}

/** 일정 한 건 + 서비스 이름 + 수행 결과 */
async function loadScheduleDetail(signal, serviceScheduleId) {
  const [detail, names, results] = await Promise.all([
    getSchedule(serviceScheduleId, { signal }),
    loadOfferingNames(signal),
    loadResultMap(signal),
  ])

  return {
    ...detail,
    serviceName: names.get(detail.serviceOfferingId) ?? null,
    result: results.get(serviceScheduleId) ?? null,
  }
}

export function useProviderSchedule(serviceScheduleId) {
  return useAsync(loadScheduleDetail, serviceScheduleId)
}
