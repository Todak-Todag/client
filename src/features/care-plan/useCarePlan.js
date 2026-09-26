import { getCarePlanServices, getCarePlans } from '../../api/endpoints/carePlan'
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
 * Care Plan에 신청된 서비스 개수
 * @param {string} carePlanId
 */
export function useCarePlanServiceCount(carePlanId) {
  return useAsync(loadServiceCount, carePlanId)
}
