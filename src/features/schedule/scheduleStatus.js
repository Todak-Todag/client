import { SCHEDULE_STATUS } from '../../constants/status'
import { parseLocalDateTime } from '../../utils/date'

/**
 * 일정 카드에 표시할 배지.
 * 서버에는 '진행중' 상태가 없어서(시작 전·중 모두 SCHEDULED),
 * SCHEDULED 일정만 현재 시각과 시작/종료 시각을 비교해 화면용 상태를 만든다.
 *
 * @returns {{ label: string, variant: 'primary'|'info'|'neutral'|'danger' }}
 */
export function getScheduleBadge(schedule, now = new Date()) {
  switch (schedule.status) {
    case SCHEDULE_STATUS.SCHEDULED: {
      const startedAt = parseLocalDateTime(schedule.startedAt)
      const finishedAt = parseLocalDateTime(schedule.finishedAt)
      if (now < startedAt) return { label: '진행 예정', variant: 'info' }
      if (now < finishedAt) return { label: '진행 중', variant: 'primary' }
      // 종료 시각이 지났지만 제공자가 아직 완료 처리하지 않은 상태
      return { label: '완료 확인 중', variant: 'neutral' }
    }
    case SCHEDULE_STATUS.RESCHEDULING:
      return { label: '일정 변경 중', variant: 'info' }
    case SCHEDULE_STATUS.COMPLETED:
      return { label: '완료', variant: 'neutral' }
    case SCHEDULE_STATUS.NO_SHOW:
      return { label: '미수행', variant: 'danger' }
    case SCHEDULE_STATUS.CANCELED:
      return { label: '취소됨', variant: 'neutral' }
    default:
      return { label: '확인 필요', variant: 'neutral' }
  }
}
