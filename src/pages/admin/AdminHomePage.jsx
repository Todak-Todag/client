import { useId, useState } from 'react'
import { getErrorMessage } from '../../api/client'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/common/EmptyState'
import Header, { HeaderSpacer } from '../../components/layout/Header'
import { AlertIcon, UserIcon } from '../../components/ui/Icons'
import UserCard from '../../features/admin/UserCard'
import { useUserSearch } from '../../features/admin/useUserSearch'
import {
  USER_ROLE_FILTER,
  USER_ROLE_OPTIONS,
  USER_STATUS_FILTER,
  USER_STATUS_OPTIONS,
} from '../../constants/adminUsers'
import styles from './AdminHomePage.module.css'

/* TODO: 무한 스크롤, 승인·거절 처리 */
function AdminHomePage() {
  const statusId = useId()
  const roleId = useId()

  // 승인 화면이라 '승인 대기'로 시작한다
  const [status, setStatus] = useState(USER_STATUS_FILTER.PENDING)
  const [role, setRole] = useState(USER_ROLE_FILTER.ALL)

  const users = useUserSearch({ role, status })

  const renderList = () => {
    if (users.status === 'loading') {
      return (
        <p className={styles.state} role="status">
          사용자를 불러오는 중이에요…
        </p>
      )
    }

    if (users.status === 'error') {
      return (
        <EmptyState
          tone="error"
          icon={AlertIcon}
          title="사용자를 불러오지 못했어요"
          description={getErrorMessage(users.error)}
          action={
            <Button variant="outline" size="md" block={false} onClick={users.reload}>
              다시 시도
            </Button>
          }
        />
      )
    }

    if (users.data.length === 0) {
      return (
        <EmptyState
          icon={UserIcon}
          title="조건에 맞는 사용자가 없어요"
          description="다른 상태나 역할로 바꿔서 찾아보세요."
        />
      )
    }

    return (
      <>
        <p className={styles.count}>{users.data.length}명</p>
        <ul className={styles.list}>
          {users.data.map((user) => (
            <li key={user.userId}>
              <UserCard user={user} />
            </li>
          ))}
        </ul>
      </>
    )
  }

  return (
    <div className={styles.page}>
      <Header title="관리자 홈" />
      <HeaderSpacer />

      <main className={styles.content}>
        <h1 className={styles.srOnly}>관리자 홈</h1>

        <div className={styles.filters}>
          <div className={styles.filter}>
            <label className={styles.label} htmlFor={statusId}>
              상태
            </label>
            <select
              id={statusId}
              className={styles.select}
              value={status}
              onChange={(event) => setStatus(Number(event.target.value))}
            >
              {USER_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filter}>
            <label className={styles.label} htmlFor={roleId}>
              역할
            </label>
            <select
              id={roleId}
              className={styles.select}
              value={role}
              onChange={(event) => {
                const { value } = event.target
                setRole(value === '' ? USER_ROLE_FILTER.ALL : Number(value))
              }}
            >
              {USER_ROLE_OPTIONS.map((option) => (
                <option key={option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {renderList()}
      </main>
    </div>
  )
}

export default AdminHomePage
