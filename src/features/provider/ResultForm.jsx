import { useState } from 'react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { SCHEDULE_STATUS } from '../../constants/status'
import { formatDateLabel, formatTime } from '../../utils/date'
import styles from './ResultForm.module.css'

/**
 * 서비스 수행 결과 등록 폼
 *
 * 저장은 두 번 호출한다.
 *  1) PATCH /service-schedules/{id}/result — 수행 여부 확정
 *  2) POST  /service-results/{id}          — 수행 시간과 메모 기록
 */
function ResultForm({ schedule, submitting, onSubmit }) {
  const [status, setStatus] = useState(
    schedule.status === SCHEDULE_STATUS.NO_SHOW
      ? SCHEDULE_STATUS.NO_SHOW
      : SCHEDULE_STATUS.COMPLETED,
  )
  const [startedAt, setStartedAt] = useState(formatTime(schedule.startedAt))
  const [finishedAt, setFinishedAt] = useState(formatTime(schedule.finishedAt))
  const [note, setNote] = useState('')

  const done = status === SCHEDULE_STATUS.COMPLETED

  const submit = (event) => {
    event.preventDefault()
    onSubmit({ status, startedAt, finishedAt, note })
  }

  return (
    <form className={styles.form} onSubmit={submit}>
      <h2 className={styles.date}>{formatDateLabel(schedule.date)}</h2>

      <Input
        label="제공 서비스"
        value={schedule.serviceName ?? '서비스 일정'}
        readOnly
        reserveMessage={false}
      />

      <section className={styles.section}>
        <span className={styles.label}>시간</span>
        <div className={styles.times}>
          <Input
            type="time"
            aria-label="수행 시작 시각"
            value={startedAt}
            reserveMessage={false}
            onChange={(event) => setStartedAt(event.target.value)}
          />
          <span className={styles.tilde} aria-hidden="true">
            ~
          </span>
          <Input
            type="time"
            aria-label="수행 종료 시각"
            value={finishedAt}
            reserveMessage={false}
            onChange={(event) => setFinishedAt(event.target.value)}
          />
        </div>
      </section>

      {/* 수행 여부가 아직 확정되지 않은 일정에서만 고를 수 있다 */}
      {schedule.status === SCHEDULE_STATUS.SCHEDULED && (
      <section className={styles.section}>
        <span className={styles.label}>수행 여부</span>
        <div className={styles.toggle}>
          <Button
            variant={done ? 'ghost' : 'primary'}
            size="md"
            aria-pressed={!done}
            onClick={() => setStatus(SCHEDULE_STATUS.NO_SHOW)}
          >
            미수행
          </Button>
          <Button
            variant={done ? 'primary' : 'ghost'}
            size="md"
            aria-pressed={done}
            onClick={() => setStatus(SCHEDULE_STATUS.COMPLETED)}
          >
            수행
          </Button>
          </div>
        </section>
      )}

      <section className={styles.section}>
        <label className={styles.label} htmlFor="result-note">
          방문 기록 및 특이사항 메모
        </label>
        <textarea
          id="result-note"
          className={styles.textarea}
          rows={5}
          placeholder="수행 내용 및 환자 상태 등 특이사항을 작성해 주세요."
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
      </section>

      <Button type="submit" loading={submitting}>
        등록하기
      </Button>
    </form>
  )
}

export default ResultForm
