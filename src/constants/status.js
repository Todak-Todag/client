/**
 * 서비스 일정 상태 (schedule-service ScheduleStatus)
 * CHANGED는 재매칭으로 새 일정에 자리를 넘긴 과거 이력이라 화면에 보여주지 않는다.
 */
export const SCHEDULE_STATUS = {
  SCHEDULED: 'SCHEDULED',
  RESCHEDULING: 'RESCHEDULING',
  CHANGED: 'CHANGED',
  COMPLETED: 'COMPLETED',
  CANCELED: 'CANCELED',
  NO_SHOW: 'NO_SHOW',
}

/** Care Plan 상태 (care-plan-service CarePlanStatus) */
export const CARE_PLAN_STATUS = {
  UNDER_REVIEW: 'UNDER_REVIEW',
  CONFIRMED: 'CONFIRMED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
}

/**
 * 매칭 시도 결과 (schedule-service MatchingAttemptStatus)
 * EXPIRED는 재매칭하지 않은 채 Care Plan 기간이 끝나 종결된 실패라 다시 요청할 수 없다.
 */
export const MATCHING_ATTEMPT_STATUS = {
  MATCHED: 'MATCHED',
  FAILED: 'FAILED',
  EXPIRED: 'EXPIRED',
}
