import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getErrorMessage } from '../../api/client'
import { logout, updateMe, withdraw } from '../../api/endpoints/auth'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { useAuth } from '../../features/auth/useAuth'
import { PATHS, PROVIDER_PATHS } from '../../constants/paths'
import styles from './MyPage.module.css'

const PHONE_HINT = '숫자만 입력해 주세요 (9~11자리, 하이픈 없이)'
const NAME_HINT = '한글 또는 영문만 입력할 수 있어요.'

/** 마이페이지 — 내 정보 확인/수정, 계정 관리 */
function MyPage() {
  const navigate = useNavigate()
  const me = useAuth()
  const [editing, setEditing] = useState(null) // 'name' | 'phone'
  const [value, setValue] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const openEdit = (field) => {
    setEditing(field)
    setValue(field === 'name' ? me.data.name : me.data.phone)
    setError('')
  }

  const save = async () => {
    setSubmitting(true)
    setError('')

    try {
      await updateMe({ [editing]: value })
      me.reload()
      setEditing(null)
    } catch (caught) {
      setError(getErrorMessage(caught))
    } finally {
      setSubmitting(false)
    }
  }

  const signOut = async () => {
    await logout().catch(() => {})
    navigate(PATHS.login, { replace: true })
  }

  // 탈퇴는 비밀번호 확인이 필요한데 별도 화면이 없어 prompt로 받는다
  const removeAccount = async () => {
    const currentPassword = window.prompt('본인 확인을 위해 현재 비밀번호를 입력해 주세요.')
    if (!currentPassword) return

    try {
      await withdraw({ currentPassword })
      navigate(PATHS.login, { replace: true })
    } catch (caught) {
      window.alert(getErrorMessage(caught))
    }
  }

  if (me.status !== 'success') {
    return (
      <p className={styles.state} role="status">
        {me.status === 'error' ? getErrorMessage(me.error) : '내 정보를 불러오는 중이에요'}
      </p>
    )
  }

  return (
    <section className={styles.page}>
      <h2 className={styles.heading}>내 정보</h2>

      <div className={styles.card}>
        <div className={styles.row}>
          <span className={styles.label}>이름</span>
          <span className={styles.value}>{me.data.name}</span>
          <Button size="sm" variant="ghost" block={false} onClick={() => openEdit('name')}>
            수정
          </Button>
        </div>

        <div className={styles.row}>
          <span className={styles.label}>연락처</span>
          <span className={styles.value}>{me.data.phone}</span>
          <Button size="sm" variant="ghost" block={false} onClick={() => openEdit('phone')}>
            수정
          </Button>
        </div>

        <div className={styles.row}>
          <span className={styles.label}>지역</span>
          <span className={styles.value}>
            {[me.data.province, me.data.district].filter(Boolean).join(' ') || '-'}
          </span>
        </div>
      </div>

      {editing && (
        <div className={styles.card}>
          <div className={styles.editBox}>
            <Input
              label={editing === 'name' ? '이름' : '연락처'}
              value={value}
              error={error}
              hint={editing === 'name' ? NAME_HINT : PHONE_HINT}
              onChange={(event) => setValue(event.target.value)}
            />

            <div className={styles.editActions}>
              <Button variant="outline" onClick={() => setEditing(null)}>
                취소
              </Button>
              <Button loading={submitting} onClick={save}>
                저장하기
              </Button>
            </div>
          </div>
        </div>
      )}

      <h2 className={styles.heading}>계정 관리</h2>

      <div className={styles.card}>
        <Button variant="ghost" className={styles.link} onClick={() => navigate(PROVIDER_PATHS.password)}>
          비밀번호 변경
        </Button>
      </div>

      <div className={styles.actions}>
        <Button size="sm" variant="ghost" block={false} onClick={signOut}>
          로그아웃
        </Button>
        <Button
          size="sm"
          variant="ghost"
          block={false}
          className={styles.danger}
          onClick={removeAccount}
        >
          탈퇴하기
        </Button>
      </div>
    </section>
  )
}

export default MyPage
