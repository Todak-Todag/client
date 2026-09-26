import { SCHEDULE_STATUS } from '../../constants/status'
import { addDays, parseLocalDateTime, toLocalDateTimeString } from '../../utils/date'

/**
 * 일정 카드에 표시할 배지.
 * 서버에는 '진행중' 상태가 없어서(시작 전·중 모두 SCHEDULED),
 * SCHEDULED 일정만 현재 시각과 시작/종료 시각을 비교해 화면용 상태를 만든다.
 *
 * @returns {{ label: string, variant: 'primary'|'info'|'warning'|'neutral'|'danger' }}
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
      // 주황(진행 중)·파랑(진행 예정)과 구분되는 노랑. 케어플랜 '검토 중'과 같은 '기다리는 중' 색
      return { label: '변경 요청 중', variant: 'warning' }
    // 재매칭이 성사되어 새 일정으로 대체된 이전 일정. 목록에서는 숨기고 예전 링크로 열었을 때만 보인다
    case SCHEDULE_STATUS.CHANGED:
      return { label: '변경됨', variant: 'neutral' }
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

// 변경·취소는 시작 24시간 전까지만 받는다 (서버 CANCEL_DEADLINE_EXCEEDED와 같은 기준)
const CHANGE_DEADLINE_MS = 24 * 60 * 60 * 1000

/**
 * 일정 상세에서 할 수 있는 동작.
 * - SCHEDULED: 시작 전이면 변경·취소 버튼을 보여주고, 24시간 이내면 누를 수 없게 한다
 * - RESCHEDULING: 취소만 (24시간 전까지)
 * - 그 외: 동작 없음
 *
 * @returns {{ show: boolean, canReschedule: boolean, canCancel: boolean, deadline: string }}
 *   deadline은 마감 시각 'YYYY-MM-DDTHH:mm:ss' (시작 시각 - 24시간)
 */
export function getScheduleActions(schedule, now = new Date()) {
  const startedAt = parseLocalDateTime(schedule.startedAt)
  const deadlineDate = new Date(startedAt.getTime() - CHANGE_DEADLINE_MS)
  const beforeDeadline = now < deadlineDate
  const deadline = toLocalDateTimeString(deadlineDate)

  switch (schedule.status) {
    case SCHEDULE_STATUS.SCHEDULED:
      return {
        // 이미 시작한 일정은 바꿀 일이 없어 버튼 자체를 숨긴다
        show: now < startedAt,
        canReschedule: beforeDeadline,
        canCancel: beforeDeadline,
        deadline,
      }
    case SCHEDULE_STATUS.RESCHEDULING:
      return { show: true, canReschedule: false, canCancel: beforeDeadline, deadline }
    default:
      return { show: false, canReschedule: false, canCancel: false, deadline }
  }
}

/**
 * 일정 변경 선택지: 하루 앞당기기(D-1) · 하루 미루기(D+1). 시간대는 바꿀 수 없다.
 * 서버 규칙(ServiceScheduleValidator.validateRescheduleDate)과 같게 막고, 이유를 함께 돌려준다.
 * - 하루 앞당기기: 그 날이 오늘이면 불가 (시작 24시간 전 조건 때문에 오늘보다 앞일 수는 없다)
 * - 하루 미루기: Care Plan 종료일을 넘으면 불가
 *
 * @param {string} date 현재 일정 날짜 'YYYY-MM-DD'
 * @param {string} today 'YYYY-MM-DD'
 * @param {string|null} finishDate 일정이 속한 Care Plan 종료일 (모르면 null, 서버가 최종 판단)
 * @returns {Array<{ key: 'earlier'|'later', label: string, date: string, disabledReason: string|null }>}
 */
export function getRescheduleOptions(date, today, finishDate = null) {
  const earlier = addDays(date, -1)
  const later = addDays(date, 1)

  // 'YYYY-MM-DD'는 문자열 비교가 날짜 비교와 같다
  const earlierReason = earlier <= today ? '오늘 날짜로는 변경할 수 없어요' : null
  const laterReason =
    finishDate && later > finishDate ? '케어 종료일이 지나 변경할 수 없어요' : null

  return [
    { key: 'earlier', label: '하루 앞당기기', date: earlier, disabledReason: earlierReason },
    { key: 'later', label: '하루 미루기', date: later, disabledReason: laterReason },
  ]
}
