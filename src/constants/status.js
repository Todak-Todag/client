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

/** 매칭 실패 사유 (provider-service ProviderMatchFailedEvent). 현재 이 값 하나뿐이다 */
export const MATCHING_FAILURE_REASON = {
  NO_AVAILABLE_PROVIDER: 'NO_AVAILABLE_PROVIDER',
}

/** 사회복지사 매칭 결과 (social-worker-service MatchingStatus) */
export const SOCIAL_WORKER_MATCHING_STATUS = {
  REQUESTED: 'REQUESTED',
  ACTIVE: 'ACTIVE',
  FAILED: 'FAILED',
  ENDED: 'ENDED',
}

/** 사회복지사 매칭 처리 현황 (social-worker-service MatchingTaskStatus) */
export const SOCIAL_WORKER_MATCHING_TASK_STATUS = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
}

/** 희망 시간대 (care-plan-service PreferredTimeSlot) */
export const PREFERRED_TIME_SLOT = {
  MORNING: 'MORNING',
  AFTERNOON: 'AFTERNOON',
}

export const PREFERRED_TIME_SLOT_LABEL = {
  [PREFERRED_TIME_SLOT.MORNING]: '오전',
  [PREFERRED_TIME_SLOT.AFTERNOON]: '오후',
}
