import styles from './SocialWorkerHomePage.module.css'
import { useState } from 'react'

const SOCIAL_WORKER = {
  name: '최한솔',
  province: '강원특별자치도',
  district: '영월군',
}

const TEAM_MEMBERS = [
  '김경민',
  '서주성',
  '최한솔',
  '정수민',
  '원제희',
  '김정석',
]

const PROJECT_STORY =
  '토닥토닥은 퇴원 이후에도 환자의 일상이 끊기지 않도록, 병원과 지역사회의 돌봄을 연결하기 위해 시작된 프로젝트입니다.'

function SocialWorkerHomePage() {
  const profileInitial = SOCIAL_WORKER.name.slice(0, 1)

  const [easterEggCount, setEasterEggCount] = useState(0)
  const [isCreditsOpen, setIsCreditsOpen] = useState(false)

  const handleEasterEggClick = () => {
    const nextCount = easterEggCount + 1

    if (nextCount >= 5) {
      setIsCreditsOpen(true)
      setEasterEggCount(0)
      return
    }

    setEasterEggCount(nextCount)
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.srOnly}>사회복지사 홈</h1>

      <section
        className={styles.profile}
        aria-label="사회복지사 정보"
      >
        <button
          type="button"
          className={styles.avatar}
          onClick={handleEasterEggClick}
          aria-label="프로필"
        >
          {profileInitial}
        </button>

        <div className={styles.profileText}>
          <p className={styles.workerName}>
            {SOCIAL_WORKER.name} <span>사회복지사님</span>
          </p>

          <p className={styles.affiliation}>
            {SOCIAL_WORKER.province} {SOCIAL_WORKER.district} 소속
          </p>
        </div>
      </section>

      <section
        className={styles.careTargetSection}
        aria-labelledby="care-target-title"
      >
        <div className={styles.sectionHeader}>
          <h2
            id="care-target-title"
            className={styles.sectionTitle}
          >
            케어 대상자
          </h2>
        </div>

        <div className={styles.patientCard}>
          <div className={styles.comingSoonContent}>
            <strong className={styles.comingSoonTitle}>
              케어 대상자 관리 기능은 추후 제공될 예정입니다.
            </strong>

            <p className={styles.comingSoonDescription}>
              배정 대상자 조회 및 관리 기능을 준비하고 있어요.
            </p>
          </div>
        </div>
      </section>

      {isCreditsOpen && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setIsCreditsOpen(false)}
        >
          <section
            className={styles.creditsModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="credits-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className={styles.closeButton}
              onClick={() => setIsCreditsOpen(false)}
              aria-label="닫기"
            >
              ×
            </button>

            <p className={styles.creditsEyebrow}>
              EASTER EGG FOUND 🥚
            </p>

            <h2
              id="credits-title"
              className={styles.creditsTitle}
            >
              Todak-Todag
            </h2>

            <p className={styles.projectStory}>
              {PROJECT_STORY}
            </p>

            <div className={styles.creditsDivider} />

            <p className={styles.creditsLabel}>Developed by</p>

            <ul className={styles.teamList}>
              {TEAM_MEMBERS.map((member) => (
                <li key={member}>{member}</li>
              ))}
            </ul>

            <p className={styles.creditsMessage}>
              퇴원 이후의 일상까지 이어지도록.
            </p>
          </section>
        </div>
      )}
    </div>
  )
}

export default SocialWorkerHomePage