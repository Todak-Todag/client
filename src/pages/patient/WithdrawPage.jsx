import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { withdraw } from '../../api/endpoints/auth'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { AlertIcon } from '../../components/ui/Icons'
import { getAccountErrorMessage } from '../../features/auth/accountErrors'
import SubPageLayout from '../../layouts/SubPageLayout'
import { PATHS } from '../../constants/paths'
import layout from './CarePlanPage.module.css'
import styles from './AccountForm.module.css'

/**
 * 회원 탈퇴 — 현재 비밀번호로 본인을 확인한다. 성공하면 서버가 쿠키를 지우므로 로그인 화면으로 보낸다.
 * 되돌릴 수 없는 동작이라 버튼을 따라다니게 두지 않고 본문 맨 끝(dangerZone)에 둔다.
 */
function WithdrawPage() {
  const navigate = useNavigate()
  const [currentPassword, setCurrentPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const submit = async (event) => {
    event.preventDefault()
    if (!currentPassword) return

    setSubmitting(true)
    setError('')

    try {
      await withdraw({ currentPassword })
      navigate(PATHS.login, { replace: true })
    } catch (caught) {
      setError(getAccountErrorMessage(caught))
      setSubmitting(false)
    }
  }

  return (
    <SubPageLayout title="회원 탈퇴">
      <form className={layout.page} onSubmit={submit} noValidate>
        <div className={layout.lead}>
          <h2 className={layout.leadTitle}>정말 탈퇴하시겠어요?</h2>
        </div>

        <p className={`${layout.note} ${layout.noteDanger}`}>
          <AlertIcon className={layout.noteIcon} />
          탈퇴하면 계정 정보가 삭제되고 이 계정으로 다시 로그인할 수 없어요.
        </p>

        <div className={styles.fields}>
          <Input
            label="현재 비밀번호"
            type="password"
            autoComplete="current-password"
            hint="본인 확인을 위해 현재 비밀번호를 입력해 주세요."
            error={error}
            value={currentPassword}
            onChange={(event) => {
              setCurrentPassword(event.target.value)
              setError('')
            }}
          />
        </div>

        <div className={layout.dangerZone}>
          <Button type="submit" variant="danger" disabled={!currentPassword} loading={submitting}>
            탈퇴하기
          </Button>
        </div>
      </form>
    </SubPageLayout>
  )
}

export default WithdrawPage
