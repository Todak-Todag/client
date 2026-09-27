import { useState } from 'react'
import BottomSheet from '../../components/ui/BottomSheet'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { toLocalDateString } from '../../utils/date'
import styles from './DischargeCompleteSheet.module.css'

/**
 * 퇴원 완료 처리 시트
 *
 * 서버는 실제 퇴원일이 미래이면 거절한다. (@PastOrPresent)
 * 다만 테스트 편의를 위해 화면에서는 미래 날짜도 고를 수 있게 두었다.
 * 그 경우 서버가 400으로 돌려주고 시트에 오류 문구가 표시된다.
 *
 * 부모에서 key={discharge?.dischargeId}로 렌더해, 대상이 바뀌면 입력이 초기화되게 한다.
 *
 * @param {object|null} discharge 처리할 퇴원건 (null이면 닫힘)
 * @param {boolean} submitting 처리 중
 * @param {string} error 서버 오류 문구
 * @param {() => void} onClose 닫기
 * @param {(actualDate: string) => void} onSubmit 실제 퇴원일과 함께 완료 처리
 */
function DischargeCompleteSheet({
  discharge,
  submitting = false,
  error = '',
  onClose,
  onSubmit,
}) {
  const today = toLocalDateString()
  const [actualDate, setActualDate] = useState(today)
  const [dateError, setDateError] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!actualDate) {
      setDateError('실제 퇴원일을 선택해 주세요.')
      return
    }

    onSubmit(actualDate)
  }

  return (
    <BottomSheet open={discharge !== null} onClose={onClose} title="퇴원 처리">
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <p className={styles.guide}>
          실제 퇴원일을 입력하면 퇴원 완료로 처리되고, Care Plan을 작성할 수
          있어요.
        </p>

        <Input
          label="실제 퇴원일"
          type="date"
          value={actualDate}
          onChange={(event) => {
            setActualDate(event.target.value)
            setDateError('')
          }}
          error={dateError || error}
          required
        />

        <div className={styles.actions}>
          <Button
            type="button"
            variant="outline"
            className={styles.action}
            disabled={submitting}
            onClick={onClose}
          >
            취소
          </Button>
          <Button type="submit" className={styles.action} loading={submitting}>
            퇴원 완료
          </Button>
        </div>
      </form>
    </BottomSheet>
  )
}

export default DischargeCompleteSheet
