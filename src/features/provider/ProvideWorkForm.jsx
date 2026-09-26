import { useState } from 'react'
import Button from '../../components/ui/Button'
import styles from './ProvideWorkForm.module.css'

// 화면은 일요일부터 보여주고, 서버 day 값은 1(월)~7(일)이다
const DAY_OPTIONS = [
  { day: 7, label: '일' },
  { day: 1, label: '월' },
  { day: 2, label: '화' },
  { day: 3, label: '수' },
  { day: 4, label: '목' },
  { day: 5, label: '금' },
  { day: 6, label: '토' },
]

/**
 * 제공 가능 요일/시간 등록·수정 폼
 *
 * @param {'create'|'edit'} mode 수정은 서버가 한 건씩 처리해서 요일을 하나만 고른다
 * @param {Array} offerings 내가 등록한 제공 서비스 목록
 */
function ProvideWorkForm({ mode = 'create', offerings, initial, submitting, onSubmit }) {
  const [days, setDays] = useState(initial?.days ?? [])
  const [startedAt, setStartedAt] = useState(initial?.startedAt ?? '09:00')
  const [finishedAt, setFinishedAt] = useState(initial?.finishedAt ?? '10:00')
  const [serviceOfferingId, setServiceOfferingId] = useState(initial?.serviceOfferingId ?? '')

  const single = mode === 'edit'
  const invalidTime = startedAt >= finishedAt
  const valid = days.length > 0 && serviceOfferingId && !invalidTime

  const toggleDay = (day) => {
    if (single) {
      setDays([day])
      return
    }
    setDays(days.includes(day) ? days.filter((value) => value !== day) : [...days, day])
  }

  const submit = (event) => {
    event.preventDefault()

    const offering = offerings.find((item) => item.serviceOfferingId === serviceOfferingId)

    onSubmit({
      serviceOfferingId,
      serviceName: offering?.provideServiceName ?? '서비스',
      days,
      startedAt,
      finishedAt,
    })
  }

  return (
    <form className={styles.form} onSubmit={submit}>
      <section className={styles.section}>
        <h2 className={styles.label}>요일 선택 {single ? '' : '(중복 선택 가능)'}</h2>
        <div className={styles.days}>
          {DAY_OPTIONS.map(({ day, label }) => (
            <button
              key={day}
              type="button"
              className={[styles.day, days.includes(day) ? styles.dayOn : '']
                .filter(Boolean)
                .join(' ')}
              aria-pressed={days.includes(day)}
              onClick={() => toggleDay(day)}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.label}>시간 설정</h2>
        <div className={styles.times}>
          <input
            type="time"
            className={styles.time}
            aria-label="시작 시각"
            value={startedAt}
            onChange={(event) => setStartedAt(event.target.value)}
          />
          <span className={styles.tilde}>~</span>
          <input
            type="time"
            className={styles.time}
            aria-label="종료 시각"
            value={finishedAt}
            onChange={(event) => setFinishedAt(event.target.value)}
          />
        </div>
        {invalidTime && <p className={styles.error}>종료 시각이 시작 시각보다 늦어야 해요.</p>}
      </section>

      <section className={styles.section}>
        <h2 className={styles.label}>제공 서비스 선택</h2>

        {offerings.length === 0 ? (
          <p className={styles.hint}>
            등록된 제공 서비스가 없어요. 제공 서비스를 먼저 등록해야 일정을 만들 수 있어요.
          </p>
        ) : (
          <ul className={styles.services}>
            {offerings.map((offering) => {
              const checked = offering.serviceOfferingId === serviceOfferingId

              return (
                <li key={offering.serviceOfferingId}>
                  <button
                    type="button"
                    className={[styles.service, checked ? styles.serviceOn : '']
                      .filter(Boolean)
                      .join(' ')}
                    aria-pressed={checked}
                    onClick={() => setServiceOfferingId(offering.serviceOfferingId)}
                  >
                    <span>{offering.provideServiceName}</span>
                    <span className={styles.check} aria-hidden="true">
                      {checked ? '✓' : ''}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <Button type="submit" disabled={!valid} loading={submitting}>
        {single ? '변경' : '등록'}
      </Button>
    </form>
  )
}

export default ProvideWorkForm
