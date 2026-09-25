const pad = (value) => String(value).padStart(2, '0')

/**
 * 기기 로컬 시간 기준 'YYYY-MM-DD'.
 * toISOString()은 UTC로 바뀌어 한국 시간 새벽에 전날 날짜가 나오므로 쓰지 않는다.
 */
export function toLocalDateString(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/**
 * 서버 LocalDateTime('2026-09-01T09:00:00')을 로컬 시간 Date로 바꾼다.
 * 서버 값에는 시간대가 없으므로 한국 시간(기기 로컬)으로 해석한다.
 */
export function parseLocalDateTime(value) {
  const [datePart, timePart = '00:00:00'] = value.split('T')
  const [year, month, day] = datePart.split('-').map(Number)
  const [hour, minute, second = 0] = timePart.split(':').map(Number)
  return new Date(year, month - 1, day, hour, minute, Math.floor(second))
}

/** '2026-09-01T09:00:00' → '09:00' */
export function formatTime(value) {
  return value.slice(11, 16)
}

/** '11:00 ~ 12:00' */
export function formatTimeRange(startedAt, finishedAt) {
  return `${formatTime(startedAt)} ~ ${formatTime(finishedAt)}`
}
