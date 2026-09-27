import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { updatePassword } from '../../api/endpoints/auth'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import {
  getAccountErrorMessage,
  isInvalidCurrentPassword,
} from '../../features/auth/accountErrors'
import { PASSWORD_PATTERN } from '../../features/auth/signupValidation'
import SubPageLayout from '../../layouts/SubPageLayout'
import { PATHS } from '../../constants/paths'
import layout from './CarePlanPage.module.css'
import styles from './AccountForm.module.css'

const PASSWORD_RULE = '8~20자, 영문·숫자·특수문자를 모두 포함하고 공백은 쓸 수 없어요.'
const PASSWORD_MAX = 20

const isValidPassword = (value) => value.length <= PASSWORD_MAX && PASSWORD_PATTERN.test(value)

/**
 * 퇴원 예정자 비밀번호 변경
 * 성공하면 서버가 토큰 쿠키를 지우므로 로그인 화면으로 보낸다.
 * (서비스 제공자·사회복지사는 pages/provider/PasswordPage를 그대로 쓴다)
 */
function PasswordPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [touched, setTouched] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [currentPasswordError, setCurrentPasswordError] = useState('')

  const change = (key) => (event) => {
    setForm({ ...form, [key]: event.target.value })
    setError('')
    if (key === 'currentPassword') setCurrentPasswordError('')
  }
  const touch = (key) => () => setTouched({ ...touched, [key]: true })

  // 형식 오류는 입력을 마친 뒤(blur)부터, 확인 불일치는 확인란에 입력하는 즉시 보여준다
  const ruleError =
    touched.newPassword && form.newPassword && !isValidPassword(form.newPassword)
      ? PASSWORD_RULE
      : ''
  const mismatch = form.confirm.length > 0 && form.newPassword !== form.confirm
  const valid =
    form.currentPassword !== '' &&
    isValidPassword(form.newPassword) &&
    form.newPassword === form.confirm

  const submit = async (event) => {
    event.preventDefault()
    if (!valid) return

    setSubmitting(true)
    setError('')

    try {
      await updatePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      })

      window.alert('비밀번호가 변경되었어요. 다시 로그인해 주세요.')
      navigate(PATHS.login, { replace: true })
    } catch (caught) {
      if (isInvalidCurrentPassword(caught)) {
        setCurrentPasswordError(getAccountErrorMessage(caught))
      } else {
        setError(getAccountErrorMessage(caught))
      }
      setSubmitting(false)
    }
  }

  return (
    <SubPageLayout title="비밀번호 변경">
      <form className={layout.page} onSubmit={submit} noValidate>
        <div className={layout.lead}>
          <h2 className={layout.leadTitle}>비밀번호를 변경해 주세요</h2>
          <p className={layout.leadText}>
            개인 정보를 안전하게 지키기 위해 새 비밀번호를 사용해 주세요.
          </p>
        </div>

        <div className={styles.fields}>
          <Input
            label="현재 비밀번호"
            type="password"
            autoComplete="current-password"
            error={currentPasswordError}
            value={form.currentPassword}
            onChange={change('currentPassword')}
          />

          <Input
            label="새 비밀번호"
            type="password"
            autoComplete="new-password"
            maxLength={PASSWORD_MAX}
            hint={PASSWORD_RULE}
            error={ruleError}
            value={form.newPassword}
            onChange={change('newPassword')}
            onBlur={touch('newPassword')}
          />

          <Input
            label="새 비밀번호 확인"
            type="password"
            autoComplete="new-password"
            maxLength={PASSWORD_MAX}
            error={mismatch ? '새 비밀번호와 일치하지 않아요.' : ''}
            value={form.confirm}
            onChange={change('confirm')}
          />

          {error && (
            <p className={layout.error} role="alert">
              {error}
            </p>
          )}
        </div>

        <div className={layout.actionBar}>
          <p className={layout.actionNote}>변경하면 보안을 위해 다시 로그인해야 해요.</p>
          <Button type="submit" disabled={!valid} loading={submitting}>
            변경하기
          </Button>
        </div>
      </form>
    </SubPageLayout>
  )
}

export default PasswordPage
