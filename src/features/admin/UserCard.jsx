import Badge from '../../components/ui/Badge'
import {
  USER_STATUS_LABEL,
  USER_STATUS_VARIANT,
} from '../../constants/adminUsers'
import styles from './UserCard.module.css'

/**
 * 관리자 사용자 목록의 한 줄
 *
 * @param {object} user /admin/users/search 응답 항목
 */
function UserCard({ user }) {
  const region = [user.province, user.district].filter(Boolean).join(' ')

  return (
    <div className={styles.card}>
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
  )
}

export default UserCard
