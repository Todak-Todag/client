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

/** 'YYYY-MM-DD'에 days일을 더한 'YYYY-MM-DD' */
export function addDays(dateString, days) {
  const date = parseLocalDateTime(dateString)
  date.setDate(date.getDate() + days)
  return toLocalDateString(date)
}

/** 시작일과 종료일을 모두 포함한 일수 ('2026-08-01' ~ '2026-08-30' → 30) */
export function countDays(startDate, finishDate) {
  const start = parseLocalDateTime(startDate)
  const finish = parseLocalDateTime(finishDate)
  // 서머타임이 있는 시간대에서도 하루 단위로 떨어지도록 반올림한다
  return Math.round((finish - start) / 86_400_000) + 1
}

/**
 * 달력 한 달치 칸. 앞쪽은 1일의 요일만큼 null로 채운다 (일요일 시작)
 * @param {number} year
 * @param {number} month 1~12
 * @returns {Array<string|null>} 'YYYY-MM-DD' 또는 빈 칸
 */
export function getMonthCells(year, month) {
  const first = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0).getDate()
  const blanks = Array.from({ length: first.getDay() }, () => null)
  const days = Array.from({ length: lastDay }, (_, index) =>
    toLocalDateString(new Date(year, month - 1, index + 1)),
  )
  return [...blanks, ...days]
}
