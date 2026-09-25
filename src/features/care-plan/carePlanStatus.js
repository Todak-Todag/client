import { CARE_PLAN_STATUS } from '../../constants/status'

/**
 * 인사 카드 아래 안내 문구.
 * 서버에 전용 필드가 없어 Care Plan 상태로 문구를 정한다. (문구는 기획 확정 시 교체)
 */
const CARE_PLAN_MESSAGE = {
  [CARE_PLAN_STATUS.UNDER_REVIEW]: '케어 플랜을 검토하고 있어요',
  [CARE_PLAN_STATUS.CONFIRMED]: '맞춤 케어 서비스 제공자 연계 진행 중',
  [CARE_PLAN_STATUS.IN_PROGRESS]: '케어 서비스를 받고 있어요',
  [CARE_PLAN_STATUS.COMPLETED]: '케어 서비스가 모두 끝났어요',
}

export function getCarePlanMessage(carePlanStatus) {
  return CARE_PLAN_MESSAGE[carePlanStatus] ?? '아직 케어 플랜이 없어요'
}

/** 여러 Care Plan 중 홈에 기준으로 쓸 것: 진행 중인 계획을 우선한다 */
const CARE_PLAN_PRIORITY = [
  CARE_PLAN_STATUS.IN_PROGRESS,
  CARE_PLAN_STATUS.CONFIRMED,
  CARE_PLAN_STATUS.UNDER_REVIEW,
  CARE_PLAN_STATUS.COMPLETED,
]

export function pickCurrentCarePlan(carePlans) {
  for (const status of CARE_PLAN_PRIORITY) {
    const found = carePlans.find((plan) => plan.status === status)
    if (found) return found
  }
  return null
}

/**
 * 케어 종료 예정 안내에 쓸 종료일.
 * 끝난 Care Plan이거나 종료일이 없거나 이미 지났으면 null
 *
 * @param {{ status: string, finishDate: string|null } | null} carePlan
 * @param {string} today 'YYYY-MM-DD'
 */
export function getUpcomingFinishDate(carePlan, today) {
  if (!carePlan?.finishDate || carePlan.status === CARE_PLAN_STATUS.COMPLETED) return null
  // 'YYYY-MM-DD'는 문자열 비교가 날짜 비교와 같다
  return carePlan.finishDate >= today ? carePlan.finishDate : null
}
