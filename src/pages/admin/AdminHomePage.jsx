import { useId, useState } from 'react'
import { getErrorMessage } from '../../api/client'
import { approveUser, rejectUser } from '../../api/endpoints/adminUser'
import Button from '../../components/ui/Button'
import ConfirmSheet from '../../components/ui/ConfirmSheet'
import EmptyState from '../../components/common/EmptyState'
import { AlertIcon, UserIcon } from '../../components/ui/Icons'
import RejectReasonSheet from '../../features/admin/RejectReasonSheet'
import UserCard from '../../features/admin/UserCard'
import { useUserSearch } from '../../features/admin/useUserSearch'
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll'
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

  const [approveTarget, setApproveTarget] = useState(null)
  const [rejectTarget, setRejectTarget] = useState(null)
  const [processingId, setProcessingId] = useState(null)
  const [notice, setNotice] = useState('')
  const [actionError, setActionError] = useState('')

  const sentinelRef = useInfiniteScroll({
    enabled: users.hasNext && !users.loadingMore && !users.moreError,
    onLoadMore: users.loadMore,
  })

  /** 승인·거절 공통 처리: 성공하면 그 카드만 빼고 안내를 남긴다 */
  const handleAction = async (user, run, message) => {
    setProcessingId(user.userId)
    setActionError('')
    setNotice('')

    try {
      await run()
      users.removeItem(user.userId)
      setApproveTarget(null)
      setRejectTarget(null)
      setNotice(message)
    } catch (error) {
      setActionError(getErrorMessage(error))
    } finally {
      setProcessingId(null)
    }
  }

  const handleApprove = () =>
    handleAction(
      approveTarget,
      () => approveUser(approveTarget.userId),
      `${approveTarget.name} 님을 승인했어요`,
    )

  const handleReject = (reason) =>
    handleAction(
      rejectTarget,
      () => rejectUser(rejectTarget.userId, reason),
      `${rejectTarget.name} 님의 가입을 거절했어요`,
    )

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

    if (users.items.length === 0) {
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
        <p className={styles.count}>총 {users.total}명</p>

        <ul className={styles.list}>
          {users.items.map((user) => (
            <li key={user.userId}>
              <UserCard
                user={user}
                processing={processingId === user.userId}
                onApprove={setApproveTarget}
                onReject={setRejectTarget}
              />
            </li>
          ))}
        </ul>

        {/* 화면에 들어오면 다음 페이지를 불러오는 감지 지점 */}
        {users.hasNext && <div ref={sentinelRef} aria-hidden="true" />}

        <p className={styles.more} role="status" aria-live="polite">
          {users.loadingMore && '더 불러오는 중이에요…'}
          {!users.hasNext && '모두 불러왔어요'}
        </p>

        {users.moreError && (
          <div className={styles.moreError}>
            <p className={styles.moreErrorText} role="alert">
              {getErrorMessage(users.moreError)}
            </p>
            <Button
              variant="outline"
              size="md"
              block={false}
              onClick={users.loadMore}
            >
              다시 시도
            </Button>
          </div>
        )}
      </>
    )
  }

  return (
    <div className={styles.page}>
      <h2 className={styles.sectionTitle}>사용자 승인/대기 목록</h2>

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

      {notice && (
        <p className={styles.notice} role="status" aria-live="polite">
          {notice}
        </p>
      )}

      {actionError && (
        <p className={styles.actionError} role="alert">
          {actionError}
        </p>
      )}

      {renderList()}

      <ConfirmSheet
        open={approveTarget !== null}
        title="가입 승인"
        description={`${approveTarget?.name ?? ''} 님의 가입을 승인할까요? 승인하면 바로 로그인할 수 있게 됩니다.`}
        confirmLabel="승인하기"
        submitting={processingId === approveTarget?.userId}
        onClose={() => setApproveTarget(null)}
        onConfirm={handleApprove}
      />

      <RejectReasonSheet
        key={rejectTarget?.userId}
        user={rejectTarget}
        submitting={processingId === rejectTarget?.userId}
        onClose={() => setRejectTarget(null)}
        onSubmit={handleReject}
      />
    </div>
  )
}

export default AdminHomePage
