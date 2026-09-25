import { getCarePlans } from '../../api/endpoints/carePlan'
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
