import { SCHEDULE_STATUS } from '../../constants/status'
import { parseLocalDateTime } from '../../utils/date'

/** 카드에서 제공할 동작 */
export const SCHEDULE_ACTION = {
  NONE: 'NONE',
  WRITE_RESULT: 'WRITE_RESULT',
  VIEW_RESULT: 'VIEW_RESULT',
}

/**
 * 서비스 제공자 관점의 일정 배지와 동작.
 *
 * 퇴원 예정자 화면(scheduleStatus.js)과 달리, 종료 시각이 지난 SCHEDULED 일정은
 * 제공자가 직접 수행 여부를 확정해야 하므로 결과 작성으로 이어진다.
 *
 * @param {object} schedule 일정
 * @param {boolean} hasResult 수행 결과가 등록되어 있는지
 * @returns {{ label: string, variant: 'primary'|'info'|'neutral'|'danger', action: string }}
 */
export function getProviderScheduleView(schedule, hasResult = false, now = new Date()) {
  switch (schedule.status) {
    case SCHEDULE_STATUS.SCHEDULED: {
      const startedAt = parseLocalDateTime(schedule.startedAt)
      const finishedAt = parseLocalDateTime(schedule.finishedAt)

      if (now < startedAt) {
        return { label: '진행 예정', variant: 'info', action: SCHEDULE_ACTION.NONE }
      }
      if (now < finishedAt) {
        return { label: '진행중', variant: 'primary', action: SCHEDULE_ACTION.NONE }
      }
      return { label: '결과 작성 필요', variant: 'danger', action: SCHEDULE_ACTION.WRITE_RESULT }
    }

    case SCHEDULE_STATUS.COMPLETED:
    case SCHEDULE_STATUS.NO_SHOW: {
      const label = schedule.status === SCHEDULE_STATUS.NO_SHOW ? '미수행' : '수행 완료'

      return hasResult
        ? { label: '결과 작성 완료', variant: 'neutral', action: SCHEDULE_ACTION.VIEW_RESULT }
        : { label: `${label} · 결과 작성 필요`, variant: 'danger', action: SCHEDULE_ACTION.WRITE_RESULT }
    }

    case SCHEDULE_STATUS.RESCHEDULING:
      return { label: '일정 변경 중', variant: 'info', action: SCHEDULE_ACTION.NONE }

    case SCHEDULE_STATUS.CANCELED:
      return { label: '취소됨', variant: 'neutral', action: SCHEDULE_ACTION.NONE }

    default:
      return { label: '확인 필요', variant: 'neutral', action: SCHEDULE_ACTION.NONE }
  }
}
