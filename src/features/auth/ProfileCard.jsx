import { UserIcon } from '../../components/ui/Icons'
import styles from './ProfileCard.module.css'

/**
 * 홈 상단 인사 카드
 * 서버에 프로필 사진 필드가 없어 기본 아바타를 사용한다.
 *
 * @param {string} name 사용자 이름
 * @param {string} message 이름 아래 상태 안내 문구 (없으면 숨김)
 */
function ProfileCard({ name, message }) {
  return (
    <section className={styles.card} aria-label="내 정보">
      <div className={styles.avatar} aria-hidden="true">
        <UserIcon className={styles.avatarIcon} />
      </div>
      <div className={styles.text}>
        <p className={styles.greeting}>반갑습니다</p>
        <p className={styles.name}>{name} 님</p>
        {message && <p className={styles.message}>{message}</p>}
      </div>
    </section>
  )
}

/** 인사 카드 로딩 자리표시 */
export function ProfileCardSkeleton() {
  return (
    <div className={`${styles.card} ${styles.skeleton}`} aria-hidden="true">
      <div className={styles.avatar} />
      <div className={styles.text}>
        <span className={`${styles.block} ${styles.blockShort}`} />
        <span className={`${styles.block} ${styles.blockName}`} />
        <span className={`${styles.block} ${styles.blockLong}`} />
      </div>
    </div>
  )
}

export default ProfileCard
