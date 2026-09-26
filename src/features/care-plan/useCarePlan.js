import {
  getCarePlan,
  getCarePlanPreferences,
  getCarePlanService,
  getCarePlanServices,
  getCarePlans,
} from '../../api/endpoints/carePlan'
import { getProvideServices } from '../../api/endpoints/provider'
import { fetchAllPages } from '../../api/paging'
import { pickCurrentCarePlan } from './carePlanStatus'
import { useAsync } from '../../hooks/useAsync'

async function loadCurrentCarePlan(signal) {
  const page = await getCarePlans({ size: 50, signal })
  return pickCurrentCarePlan(page?.content ?? [])
}

/**
 * 홈 화면 기준 Care Plan (진행 중 > 확정 > 검토 중 > 완료 순으로 하나)
 * 없으면 data가 null
 */
export function useCurrentCarePlan() {
  return useAsync(loadCurrentCarePlan)
}

async function loadServiceCount(signal, carePlanId) {
  const page = await getCarePlanServices(carePlanId, { size: 10, signal })
  return page?.pageInfo?.totalElements ?? page?.content?.length ?? 0
}

/**
 * Care Plan에 담긴 서비스 개수. 뺀 서비스는 서버가 논리삭제하므로 세지 않는다
 * @param {string} carePlanId
 */
export function useCarePlanServiceCount(carePlanId) {
  return useAsync(loadServiceCount, carePlanId)
}

/**
 * 선택한 서비스 + 서비스별 희망 일정 수 (홈 요약과 케어플랜 확인 화면이 같이 쓴다)
 * 희망 일정은 서비스 수 × 케어 일수만큼 늘어 한 페이지(최대 50)를 넘을 수 있어 전부 모은다
 */
async function loadServicesWithPreferenceCount(carePlanId, signal) {
  const [services, preferences] = await Promise.all([
    fetchAllPages((params) => getCarePlanServices(carePlanId, params), { signal }),
    fetchAllPages((params) => getCarePlanPreferences(carePlanId, params), { signal }),
  ])

  // 희망 일정 목록에는 planServiceId가 없어 서비스 종류(provideServiceId)로 센다.
  // 한 Care Plan에 같은 서비스 종류는 한 번만 담기므로 둘은 1:1이다
  const countByService = new Map()
  for (const preference of preferences) {
    const key = preference.provideServiceId
    countByService.set(key, (countByService.get(key) ?? 0) + 1)
  }

  return services.map((service) => ({
    ...service,
    preferenceCount: countByService.get(service.provideServiceId) ?? 0,
  }))
}

async function loadCarePlanReview(signal, carePlanId) {
  const [carePlan, services] = await Promise.all([
    getCarePlan(carePlanId, { signal }),
    loadServicesWithPreferenceCount(carePlanId, signal),
  ])
  return { carePlan, services }
}

async function loadReviewSummary(signal, carePlanId) {
  const services = await loadServicesWithPreferenceCount(carePlanId, signal)
  return {
    serviceCount: services.length,
    // 희망 일정이 없는 서비스는 확정해도 매칭되지 않는다
    unscheduledCount: services.filter((service) => service.preferenceCount === 0).length,
  }
}

/**
 * 홈 '케어플랜 도착' 카드 요약: 선택한 서비스 수와 희망 일정이 없는 서비스 수
 * @param {string} carePlanId
 * @returns {{ status: string, data: { serviceCount: number, unscheduledCount: number } | null }}
 */
export function useCarePlanReviewSummary(carePlanId) {
  return useAsync(loadReviewSummary, carePlanId)
}

/**
 * 케어플랜 확인 화면: Care Plan + 선택한 서비스(서비스별 희망 일정 수 포함)
 * @param {string} carePlanId
 */
export function useCarePlanReview(carePlanId) {
  return useAsync(loadCarePlanReview, carePlanId)
}

// useAsync는 원시값 하나만 받으므로 두 ID를 한 문자열로 넘긴다
const SERVICE_KEY_SEPARATOR = '/'

async function loadCarePlanService(signal, key) {
  const [carePlanId, planServiceId] = key.split(SERVICE_KEY_SEPARATOR)
  const [carePlan, service, services] = await Promise.all([
    getCarePlan(carePlanId, { signal }),
    getCarePlanService(carePlanId, planServiceId, { signal }),
    getCarePlanServices(carePlanId, { size: 10, signal }),
  ])

  return {
    carePlan,
    service,
    // 마지막 남은 서비스를 빼면 케어플랜이 종료되므로 경고 문구를 바꾼다
    isLastService: (services?.pageInfo?.totalElements ?? services?.content?.length ?? 0) <= 1,
  }
}

/**
 * 서비스 상세 화면: Care Plan(기간·상태) + 서비스(희망 일정 포함)
 * @param {string} carePlanId
 * @param {string} planServiceId
 */
export function useCarePlanService(carePlanId, planServiceId) {
  return useAsync(loadCarePlanService, `${carePlanId}${SERVICE_KEY_SEPARATOR}${planServiceId}`)
}

async function loadServiceOptions(signal, carePlanId) {
  const [carePlan, selected, all] = await Promise.all([
    getCarePlan(carePlanId, { signal }),
    fetchAllPages((params) => getCarePlanServices(carePlanId, params), { signal }),
    fetchAllPages(getProvideServices, { signal }),
  ])
  const selectedIds = new Set(selected.map((service) => service.provideServiceId))

  return {
    carePlan,
    options: all.map((service) => ({
      ...service,
      selected: selectedIds.has(service.provideServiceId),
    })),
  }
}

/**
 * 서비스 추가 화면: 전체 서비스 종류 + 이미 고른 서비스 표시
 * @param {string} carePlanId
 */
export function useCarePlanServiceOptions(carePlanId) {
  return useAsync(loadServiceOptions, carePlanId)
}
