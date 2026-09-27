import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import {
  USER_STATUS_LABEL,
  USER_STATUS_VARIANT,
} from '../../constants/adminUsers'
import styles from './UserCard.module.css'

/**
 * 관리자 사용자 목록의 한 줄
 *
 * 승인 대기(PENDING)일 때만 승인·거절 버튼을 보여준다.
 *
 * @param {object} user /admin/users/search 응답 항목
 * @param {(user: object) => void} onApprove 승인 클릭
 * @param {(user: object) => void} onReject 거절 클릭
 * @param {boolean} processing 이 사용자를 처리하는 중
 */
function UserCard({ user, onApprove, onReject, processing = false }) {
  const region = [user.province, user.district].filter(Boolean).join(' ')
  const isPending = user.status === 'PENDING'

  return (
    <div className={styles.card}>
      <div className={styles.top}>
        <div className={styles.body}>
          <p className={styles.name}>{user.name}</p>
          <p className={styles.meta}>
            {[user.role, region].filter(Boolean).join(' · ')}
          </p>
          {user.phone && <p className={styles.phone}>{user.phone}</p>}
        </div>

        <Badge variant={USER_STATUS_VARIANT[user.status] ?? 'neutral'}>
          {USER_STATUS_LABEL[user.status] ?? user.status}
        </Badge>
      </div>

      {isPending && (
        <div className={styles.actions}>
          <Button
            variant="outline"
            size="sm"
            block={false}
            disabled={processing}
            onClick={() => onReject?.(user)}
          >
            거절
          </Button>
          <Button
            size="sm"
            block={false}
            loading={processing}
            onClick={() => onApprove?.(user)}
          >
            승인
          </Button>
        </div>
      )}
    </div>
  )
}

export default UserCard
