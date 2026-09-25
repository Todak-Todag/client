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
