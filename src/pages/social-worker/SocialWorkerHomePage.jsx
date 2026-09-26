import Badge from "../../components/ui/Badge";
import { CalendarIcon } from "../../components/ui/Icons";
import styles from "./SocialWorkerHomePage.module.css";
import { useState } from "react";

const SORT_OPTIONS = {
  LATEST: "LATEST",
  OLDEST: "OLDEST",
};

const SOCIAL_WORKER = {
  name: "최한솔",
  province: "강원특별자치도",
  district: "영월군",
};

const CARE_TARGETS = [
  {
    patientId: "patient-1",
    name: "김영수",
    dischargeDate: "2026-08-29",
    carePlanStatus: "UNDER_REVIEW",
    createdAt: "2026-09-25T10:00:00Z",
  },
  {
    patientId: "patient-2",
    name: "한영수",
    dischargeDate: "2026-07-29",
    carePlanStatus: "CONFIRMED",
    createdAt: "2026-09-20T10:00:00Z",
  },
];

const CARE_PLAN_STATUS_LABEL = {
  UNDER_REVIEW: "todak-todag 작성 필요",
  CONFIRMED: "todak-todag 작성 완료",
  IN_PROGRESS: "todak-todag 작성 완료",
  COMPLETED: "todak-todag 작성 완료",
};

const TEAM_MEMBERS = [
  "김경민",
  "서주성",
  "최한솔",
  "정수민",
  "원제희",
  "김정석",
];

const PROJECT_STORY =
  "토닥토닥은 퇴원 이후에도 환자의 일상이 끊기지 않도록, 병원과 지역사회의 돌봄을 연결하기 위해 시작된 프로젝트입니다.";

function SocialWorkerHomePage() {
  const profileInitial = SOCIAL_WORKER.name.slice(0, 1);
  const [sortOrder, setSortOrder] = useState(SORT_OPTIONS.LATEST);

  const [easterEggCount, setEasterEggCount] = useState(0);
  const [isCreditsOpen, setIsCreditsOpen] = useState(false);

  const handleEasterEggClick = () => {
    const nextCount = easterEggCount + 1;

    if (nextCount >= 5) {
      setIsCreditsOpen(true);
      setEasterEggCount(0);
      return;
    }

    setEasterEggCount(nextCount);
  };

  const sortedCareTargets = [...CARE_TARGETS].sort((a, b) => {
    const first = new Date(a.createdAt).getTime();
    const second = new Date(b.createdAt).getTime();

    return sortOrder === SORT_OPTIONS.LATEST ? second - first : first - second;
  });

  const toggleSortOrder = () => {
    setSortOrder((prev) =>
      prev === SORT_OPTIONS.LATEST ? SORT_OPTIONS.OLDEST : SORT_OPTIONS.LATEST,
    );
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.srOnly}>사회복지사 홈</h1>

      <section className={styles.profile} aria-label="사회복지사 정보">
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
          <h2 id="care-target-title" className={styles.sectionTitle}>
            케어 대상자
          </h2>

          <button
            type="button"
            className={styles.sortButton}
            onClick={toggleSortOrder}
            aria-label={
              sortOrder === SORT_OPTIONS.LATEST
                ? "오래된순으로 변경"
                : "최신순으로 변경"
            }
          >
            {sortOrder === SORT_OPTIONS.LATEST ? "최신순" : "오래된순"}

            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className={
                sortOrder === SORT_OPTIONS.OLDEST
                  ? styles.sortIconReversed
                  : undefined
              }
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>

        <ul className={styles.patientList}>
          {sortedCareTargets.map((patient) => {
            const badgeLabel = CARE_PLAN_STATUS_LABEL[patient.carePlanStatus];

            return (
              <li key={patient.patientId}>
                <article className={styles.patientCard}>
                  <div className={styles.patientHeader}>
                    <div className={styles.patientInfo}>
                      <strong className={styles.patientName}>
                        {patient.name} 님
                      </strong>
                    </div>

                    <Badge variant="primary" className={styles.statusBadge}>
                      {badgeLabel}
                    </Badge>
                  </div>

                  <div className={styles.divider} />

                  <div className={styles.discharge}>
                    <CalendarIcon className={styles.calendarIcon} />

                    <span>{patient.dischargeDate} 퇴원 예정</span>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
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

      <p className={styles.creditsEyebrow}>EASTER EGG FOUND 🥚</p>

      <h2 id="credits-title" className={styles.creditsTitle}>
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
  );
}

export default SocialWorkerHomePage;
