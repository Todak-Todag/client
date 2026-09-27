/*
 * 서버에 '조회' API가 없는 매칭 상태를 브라우저에 보관한다.
 * 보관은 편의일 뿐이라 읽기·쓰기가 실패해도(사생활 보호 모드 등) 화면은 그대로 동작해야 한다.
 */

// ── 서비스 매칭: 다시 요청한 매칭 기록 ────────────────────
// 서버는 '재요청 중' 상태를 내려주지 않아서(원래 FAILED 기록이 그대로 남음) 이번 탭에서 요청한 것만 기억한다.
// 탭을 닫은 뒤 다시 누르면 서버가 409 RETRY_ALREADY_REQUESTED로 알려준다.
const RETRY_KEY = 'todak:matching-retry-requested'

/**
 * @returns {Map<string, { date: string, preferredTimeSlot: string|null } | null>}
 *   다시 요청한 matchingAttemptId → 새로 요청한 일정 (다른 탭에서 요청해 409로 안 경우는 null)
 */
export function readRequestedRetries() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(RETRY_KEY) ?? '{}')
    return new Map(saved && typeof saved === 'object' && !Array.isArray(saved) ? Object.entries(saved) : [])
  } catch {
    return new Map()
  }
}

export function saveRequestedRetry(matchingAttemptId, requestedSchedule = null) {
  const requested = readRequestedRetries()
  requested.set(matchingAttemptId, requestedSchedule)
  try {
    sessionStorage.setItem(RETRY_KEY, JSON.stringify(Object.fromEntries(requested)))
  } catch {
    // 보관하지 못해도 이번 화면에서는 상태로 기억한다
  }
  return requested
}

// ── 사회복지사 매칭: taskId → matchingResultId ────────────
// '내 매칭 조회' API가 없어 요청할 때 받은 ID를 잃으면 결과를 다시 볼 수 없다.
// 결과 ID는 서버에 계속 남으므로 탭을 닫아도 유지되게 localStorage에 둔다.
// 다른 계정으로 로그인한 기기라면 조회가 403이 되어 기록을 지운다 (useSocialWorkerMatching).
const SOCIAL_WORKER_KEY = 'todak:social-worker-matching'

/** @returns {{ taskId?: string, matchingResultId?: string } | null} */
export function readSocialWorkerMatching() {
  try {
    const record = JSON.parse(localStorage.getItem(SOCIAL_WORKER_KEY) ?? 'null')
    return record && (record.taskId || record.matchingResultId) ? record : null
  } catch {
    return null
  }
}

export function saveSocialWorkerMatching(record) {
  try {
    localStorage.setItem(SOCIAL_WORKER_KEY, JSON.stringify(record))
  } catch {
    // 보관하지 못하면 이번 화면을 벗어난 뒤에는 결과를 다시 찾을 수 없다 (서버 한계)
  }
}

export function clearSocialWorkerMatching() {
  try {
    localStorage.removeItem(SOCIAL_WORKER_KEY)
  } catch {
    // 지우지 못해도 다음 조회에서 다시 403/404를 받아 같은 처리를 한다
  }
}
