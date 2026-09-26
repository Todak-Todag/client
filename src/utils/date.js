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

/** 요일 표시 (Date.getDay() 순서) */
export const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']

/** '2026-09-27' → '9월 27일 일요일' */
export function formatDateLabel(dateString) {
  const date = parseLocalDateTime(dateString)
  return `${date.getMonth() + 1}월 ${date.getDate()}일 ${WEEKDAY_LABELS[date.getDay()]}요일`
}

/** 'YYYY-MM-DD' 형식이면서 실제로 있는 날짜인지 (예: 2026-02-30은 false) */
export function isDateString(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  return toLocalDateString(parseLocalDateTime(value)) === value
}

/** 'YYYY-MM-DD'가 속한 주의 일요일~토요일 Date 7개 */
export function getWeekDates(dateString) {
  const date = parseLocalDateTime(dateString)
  const sunday = date.getDate() - date.getDay()
  return Array.from(
    { length: 7 },
    (_, index) => new Date(date.getFullYear(), date.getMonth(), sunday + index),
  )
}

/**
 * 'YYYY-MM-DD' → '8월 1일 (토)'. weekday가 false면 '8월 1일'
 * @param {string} dateString
 * @param {{ weekday?: boolean }} options
 */
export function formatMonthDay(dateString, { weekday = true } = {}) {
  const date = parseLocalDateTime(dateString)
  const label = `${date.getMonth() + 1}월 ${date.getDate()}일`
  return weekday ? `${label} (${WEEKDAY_LABELS[date.getDay()]})` : label
}

/** '8월 1일 (토) – 8월 30일 (일)'. 둘 중 하나라도 없으면 null */
export function formatDateRange(startDate, finishDate, options) {
  if (!startDate || !finishDate) return null
  return `${formatMonthDay(startDate, options)} – ${formatMonthDay(finishDate, options)}`
}
