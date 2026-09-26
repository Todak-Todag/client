import { CARE_PLAN_STATUS } from '../../constants/status'

/**
 * 인사 카드 이름 아래 상태 배지. Care Plan이 없으면 배지를 표시하지 않는다.
 * CONFIRMED(매칭 진행)와 IN_PROGRESS는 사용자 입장에서 같은 단계라 문구를 합친다.
 */
const CARE_PLAN_BADGE = {
  [CARE_PLAN_STATUS.UNDER_REVIEW]: { label: '케어플랜 검토 중', variant: 'warning' },
  [CARE_PLAN_STATUS.CONFIRMED]: { label: '케어 진행 중', variant: 'primary' },
  [CARE_PLAN_STATUS.IN_PROGRESS]: { label: '케어 진행 중', variant: 'primary' },
  [CARE_PLAN_STATUS.COMPLETED]: { label: '케어 종료', variant: 'neutral' },
}

/** @returns {{ label: string, variant: string } | null} */
export function getCarePlanBadge(carePlanStatus) {
  return CARE_PLAN_BADGE[carePlanStatus] ?? null
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
