import { useMemo, useState } from 'react'
import { useMatching } from '../../features/social-worker/useMatching'
import {
  MATCHING_STATUS,
  MATCHING_STATUS_LABEL,
} from '../../features/social-worker/matchingStatus'
import styles from './MatchingPage.module.css'

const FILTER = {
  ACTIVE: 'ACTIVE',
  ENDED: 'ENDED',
}

function formatDate(value) {
  if (!value) {
    return '-'
  }

  return new Date(value).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

function MatchingPage() {
  const { status, matchings, error } = useMatching()
  const [filter, setFilter] = useState(FILTER.ACTIVE)

  const filteredMatchings = useMemo(
    () =>
      matchings.filter((matching) =>
        filter === FILTER.ACTIVE
          ? matching.status === MATCHING_STATUS.ACTIVE
          : matching.status === MATCHING_STATUS.ENDED,
      ),
    [matchings, filter],
  )

  if (status === 'loading') {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>매칭 현황</h1>
        <p className={styles.message}>매칭 정보를 불러오는 중이에요.</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>매칭 현황</h1>
        <p className={styles.message}>매칭 정보를 불러오지 못했어요.</p>
        <p className={styles.errorMessage}>{error?.message}</p>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.heading}>
        <h1 className={styles.title}>매칭 현황</h1>

        <p className={styles.description}>
          배정된 퇴원 예정자를 확인할 수 있어요.
        </p>
      </div>

      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tab} ${
            filter === FILTER.ACTIVE ? styles.tabActive : ''
          }`}
          onClick={() => setFilter(FILTER.ACTIVE)}
        >
          담당 중
        </button>

        <button
          type="button"
          className={`${styles.tab} ${
            filter === FILTER.ENDED ? styles.tabActive : ''
          }`}
          onClick={() => setFilter(FILTER.ENDED)}
        >
          종료
        </button>
      </div>

      {filteredMatchings.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>✓</div>

          <h2 className={styles.emptyTitle}>
            {filter === FILTER.ACTIVE
              ? '현재 담당 중인 대상자가 없어요'
              : '종료된 매칭이 없어요'}
          </h2>

          <p className={styles.emptyDescription}>
            새로운 매칭이 배정되면 이곳에서 확인할 수 있어요.
          </p>
        </div>
      ) : (
        <div className={styles.list}>
          {filteredMatchings.map((matching) => (
            <article
              key={matching.matchingResultId}
              className={styles.card}
            >
              <div className={styles.cardHeader}>
                <div>
                  <p className={styles.patientLabel}>퇴원 예정자</p>

                  <h2 className={styles.patientName}>
                    {matching.patientName}
                  </h2>
                </div>

                <span
                  className={`${styles.badge} ${
                    matching.status === MATCHING_STATUS.ACTIVE
                      ? styles.badgeActive
                      : styles.badgeEnded
                  }`}
                >
                  {MATCHING_STATUS_LABEL[matching.status]}
                </span>
              </div>

              <div className={styles.divider} />

              <dl className={styles.infoList}>
                <div className={styles.infoRow}>
                  <dt>매칭 요청일</dt>
                  <dd>{formatDate(matching.requestedAt)}</dd>
                </div>

                <div className={styles.infoRow}>
                  <dt>배정일</dt>
                  <dd>{formatDate(matching.assignedAt)}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

export default MatchingPage