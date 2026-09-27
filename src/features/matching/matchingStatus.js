import {
  MATCHING_FAILURE_REASON,
  PREFERRED_TIME_SLOT,
  PREFERRED_TIME_SLOT_LABEL,
  SOCIAL_WORKER_MATCHING_STATUS,
} from '../../constants/status'
import { formatMonthDay } from '../../utils/date'

const FAILURE_REASON_TEXT = {
  [MATCHING_FAILURE_REASON.NO_AVAILABLE_PROVIDER]:
    '해당 날짜·시간대에 가능한 서비스 제공자가 없어요.',
}

/** 실패 사유 코드 → 화면 문구. 모르는 코드여도 다시 요청할 수 있다는 흐름은 같다 */
export function getFailureReasonText(failureReason) {
  return FAILURE_REASON_TEXT[failureReason] ?? '서비스 제공자를 찾지 못했어요.'
}

/**
 * '8월 12일 (수) · 오전'. 시간대가 없으면(MATCHED 기록) 날짜만.
 * 좁은 화면에서 시간대만 다음 줄로 떨어지지 않도록 줄바꿈 없는 공백으로 붙인다 (formatMonthDay와 같은 규칙)
 */
export function formatAttemptDate(attempt) {
  const slot = PREFERRED_TIME_SLOT_LABEL[attempt.preferredTimeSlot]
  return slot ? `${formatMonthDay(attempt.date)}\u00A0·\u00A0${slot}` : formatMonthDay(attempt.date)
}

const time = (value) => Date.parse(value) || 0

/**
 * 희망 일정마다 가장 최근 기록 하나만 남긴다.
 * 매칭 기록은 결과를 받을 때마다 쌓여서, 다시 요청했다 또 실패하면 같은 희망 일정의 FAILED가 여러 건이 된다.
 * 이미 다시 요청한 예전 기록은 서버가 409로 막으므로 가장 최근 것만 요청할 수 있다.
 *
 * @param {Array<{ servicePreferenceId: string }>} attempts
 * @param {'failedAt'|'matchedAt'} timeKey 무엇이 최근인지 비교할 시각 (UTC Instant)
 */
export function pickLatestByPreference(attempts, timeKey) {
  const latest = new Map()
  for (const attempt of attempts) {
    const previous = latest.get(attempt.servicePreferenceId)
    if (!previous || time(attempt[timeKey]) > time(previous[timeKey])) {
      latest.set(attempt.servicePreferenceId, attempt)
    }
  }
  return [...latest.values()]
}

const SLOT_ORDER = [PREFERRED_TIME_SLOT.MORNING, PREFERRED_TIME_SLOT.AFTERNOON]

/** 날짜 → 시간대(오전 먼저, 시간대 없음은 마지막) 순 */
export function sortByDate(attempts) {
  const slotIndex = (slot) => (SLOT_ORDER.includes(slot) ? SLOT_ORDER.indexOf(slot) : SLOT_ORDER.length)
  return [...attempts].sort(
    (a, b) =>
      a.date.localeCompare(b.date) || slotIndex(a.preferredTimeSlot) - slotIndex(b.preferredTimeSlot),
  )
}

/**
 * 사회복지사 매칭 배지. 색은 일정 배지와 같은 약속을 따른다
 * (기다리는 중 = 노랑 · 끝난 상태 = 회색 · 실패 = 빨강 · 연결 = 초록)
 */
const SOCIAL_WORKER_BADGE = {
  [SOCIAL_WORKER_MATCHING_STATUS.REQUESTED]: { label: '매칭 중', variant: 'warning' },
  [SOCIAL_WORKER_MATCHING_STATUS.ACTIVE]: { label: '연결됨', variant: 'success' },
  [SOCIAL_WORKER_MATCHING_STATUS.FAILED]: { label: '매칭 실패', variant: 'danger' },
  [SOCIAL_WORKER_MATCHING_STATUS.ENDED]: { label: '종료', variant: 'neutral' },
}

/** @returns {{ label: string, variant: string } | null} */
export function getSocialWorkerBadge(status) {
  return SOCIAL_WORKER_BADGE[status] ?? null
}

/**
 * 사회복지사를 찾는 중이거나 연결된 상태인지. 이때는 매칭 현황 화면 위쪽(매칭 완료 앞)에 둔다
 * @param {{ status: string, data: { phase: string, result?: { status: string } } | null }} matching
 */
export function isSocialWorkerInProgress(matching) {
  if (matching.status !== 'success') return false
  const { phase, result } = matching.data
  return (
    phase === 'searching' ||
    result?.status === SOCIAL_WORKER_MATCHING_STATUS.REQUESTED ||
    result?.status === SOCIAL_WORKER_MATCHING_STATUS.ACTIVE
  )
}
