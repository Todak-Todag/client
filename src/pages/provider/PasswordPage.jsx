import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getErrorMessage } from '../../api/client'
import { updatePassword } from '../../api/endpoints/auth'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import SubPageLayout from '../../layouts/SubPageLayout'
import { PATHS } from '../../constants/paths'
import styles from './FormPage.module.css'

/** 비밀번호 변경 — 성공하면 서버가 쿠키를 지우므로 다시 로그인해야 한다 */
function PasswordPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const change = (key) => (event) => setForm({ ...form, [key]: event.target.value })

  const mismatch = form.confirm.length > 0 && form.newPassword !== form.confirm
  const valid = form.currentPassword && form.newPassword && !mismatch

  const submit = async (event) => {
    event.preventDefault()
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
      setError(getErrorMessage(caught))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <SubPageLayout title="비밀번호 변경">
      <form onSubmit={submit}>
        <Input
          label="현재 비밀번호"
          type="password"
          autoComplete="current-password"
          value={form.currentPassword}
          onChange={change('currentPassword')}
        />

        <Input
          label="새 비밀번호"
          type="password"
          autoComplete="new-password"
          hint="8~20자이며 영문, 숫자, 특수문자를 각각 하나 이상 포함해야 해요."
          value={form.newPassword}
          onChange={change('newPassword')}
        />

        <Input
          label="새 비밀번호 확인"
          type="password"
          autoComplete="new-password"
          error={mismatch ? '새 비밀번호와 일치하지 않아요.' : ''}
          hint="변경하면 보안을 위해 다시 로그인해야 해요."
          value={form.confirm}
          onChange={change('confirm')}
        />

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        <Button type="submit" disabled={!valid} loading={submitting}>
          변경하기
        </Button>
      </form>
    </SubPageLayout>
  )
}

export default PasswordPage
