import { useState } from 'react'
import BottomSheet from '../../components/ui/BottomSheet'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import styles from './RejectReasonSheet.module.css'

/**
 * 회원가입 거절 사유 입력 시트
 *
 * 서버가 거절 시 사유를 필수로 받는다. (USER_REJECT_CONFLICT)
 *
 * 부모에서 key={user?.userId}로 렌더해, 대상이 바뀌면 입력이 초기화되게 한다.
 *
 * @param {object|null} user 거절할 사용자 (null이면 닫힘)
 * @param {boolean} submitting 처리 중
 * @param {() => void} onClose 닫기
 * @param {(reason: string) => void} onSubmit 사유와 함께 거절
 */
function RejectReasonSheet({ user, submitting = false, onClose, onSubmit }) {
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()

    const trimmed = reason.trim()
    if (!trimmed) {
      setError('거절 사유를 입력해 주세요.')
      return
    }

    onSubmit(trimmed)
  }

  return (
    <BottomSheet open={user !== null} onClose={onClose} title="가입 거절">
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <p className={styles.guide}>
          <span className={styles.name}>{user?.name}</span> 님의 가입을
          거절합니다. 사유는 본인에게 전달됩니다.
        </p>

        <Input
          label="거절 사유"
          value={reason}
          onChange={(event) => {
            setReason(event.target.value)
            setError('')
          }}
          placeholder="예: 제출한 정보가 확인되지 않았어요"
          error={error}
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
            거절하기
          </Button>
        </div>
      </form>
    </BottomSheet>
  )
}

export default RejectReasonSheet
