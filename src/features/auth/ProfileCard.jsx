import Badge from '../../components/ui/Badge'
import styles from './ProfileCard.module.css'

/**
 * 홈 상단 인사 카드
 * 서버에 프로필 사진 필드가 없어 이름 첫 글자를 아바타로 쓴다.
 *
 * @param {string} name 사용자 이름
 * @param {{ label: string, variant: string } | null} badge 이름 아래 상태 배지 (없으면 숨김)
 * @param {string} meta 배지 옆 보조 문구 (예: 8월 30일 (일) 종료 예정)
 * @param {string} message 이름 아래 강조 안내 문구 (예: 서비스 제공자 홈의 소속 안내). 없으면 숨김
 */
function ProfileCard({ name, badge, meta, message }) {
  // 한글 조합형·이모지도 한 글자로 자르도록 코드 포인트 기준
  const initial = Array.from(name.trim())[0] ?? ''

  return (
    <section className={styles.card} aria-label="내 정보">
      <div className={styles.avatar} aria-hidden="true">
        {initial}
      </div>
      <div className={styles.text}>
        <p className={styles.greeting}>반갑습니다</p>
        <p className={styles.name}>{name} 님</p>
        {(badge || meta) && (
          <p className={styles.status}>
            {badge && <Badge variant={badge.variant}>{badge.label}</Badge>}
            {meta && <span className={styles.meta}>{meta}</span>}
          </p>
        )}
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
