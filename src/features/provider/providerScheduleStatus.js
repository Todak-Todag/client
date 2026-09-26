import { SCHEDULE_STATUS } from '../../constants/status'
import { parseLocalDateTime } from '../../utils/date'

/** 카드에서 제공할 동작 */
export const SCHEDULE_ACTION = {
  NONE: 'NONE',
  COMPLETE: 'COMPLETE',
  WRITE_RESULT: 'WRITE_RESULT',
  VIEW_RESULT: 'VIEW_RESULT',
}

/**
 * 서비스 제공자 관점의 일정 배지와 동작.
 *
 * 제공자는 두 단계로 일정을 마무리한다.
 *  1) 수행 완료 처리 — 방문이 끝났음을 확정 (SCHEDULED → COMPLETED)
 *  2) 결과 작성 — 수행 시간과 특이사항 기록
 *
 * @param {object} schedule 일정
 * @param {boolean} hasResult 수행 결과가 등록되어 있는지
 * @returns {{ label: string, variant: 'primary'|'info'|'success'|'neutral'|'danger',
 *   action: string, disabled?: boolean }}
 */
export function getProviderScheduleView(schedule, hasResult = false, now = new Date()) {
  switch (schedule.status) {
    case SCHEDULE_STATUS.SCHEDULED: {
      const startedAt = parseLocalDateTime(schedule.startedAt)
      const finishedAt = parseLocalDateTime(schedule.finishedAt)

      // 방문 전·중에는 버튼을 보여주되 아직 누를 수 없게 둔다
      if (now < startedAt) {
        return {
          label: '예정',
          variant: 'primary',
          action: SCHEDULE_ACTION.COMPLETE,
          disabled: true,
        }
      }

      if (now < finishedAt) {
        return {
          label: '진행 중',
          variant: 'primary',
          action: SCHEDULE_ACTION.COMPLETE,
          disabled: true,
        }
      }

      return { label: '수행 완료 필요', variant: 'danger', action: SCHEDULE_ACTION.COMPLETE }
    }

    case SCHEDULE_STATUS.COMPLETED:
      return hasResult
        ? { label: '결과 작성 완료', variant: 'success', action: SCHEDULE_ACTION.VIEW_RESULT }
        : { label: '결과 작성 필요', variant: 'danger', action: SCHEDULE_ACTION.WRITE_RESULT }

    case SCHEDULE_STATUS.NO_SHOW:
      return hasResult
        ? { label: '미수행', variant: 'neutral', action: SCHEDULE_ACTION.VIEW_RESULT }
        : { label: '결과 작성 필요', variant: 'danger', action: SCHEDULE_ACTION.WRITE_RESULT }

    case SCHEDULE_STATUS.RESCHEDULING:
      return { label: '일정 변경 중', variant: 'info', action: SCHEDULE_ACTION.NONE }

    case SCHEDULE_STATUS.CANCELED:
      return { label: '취소됨', variant: 'neutral', action: SCHEDULE_ACTION.NONE }

    default:
      return { label: '확인 필요', variant: 'neutral', action: SCHEDULE_ACTION.NONE }
  }
}
