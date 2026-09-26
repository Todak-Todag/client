import { useParams } from 'react-router-dom'
import { useMatching } from '../../features/social-worker/useMatching'
import {
  MATCHING_STATUS,
  MATCHING_STATUS_LABEL,
} from '../../features/social-worker/matchingStatus'
import styles from './MatchingPage.module.css'

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

function getMatchingMessage(status) {
  switch (status) {
    case MATCHING_STATUS.REQUESTED:
      return {
        title: '사회복지사를 찾고 있어요',
        description: '매칭이 완료되면 결과를 확인할 수 있어요.',
      }

    case MATCHING_STATUS.ACTIVE:
      return {
        title: '매칭이 완료되었어요',
        description: '담당 사회복지사와 연결되었습니다.',
      }

    case MATCHING_STATUS.FAILED:
      return {
        title: '매칭에 실패했어요',
        description: '현재 매칭 가능한 사회복지사를 찾지 못했어요.',
      }

    case MATCHING_STATUS.ENDED:
      return {
        title: '매칭이 종료되었어요',
        description: '사회복지사 매칭이 종료되었습니다.',
      }

    default:
      return {
        title: '매칭 결과',
        description: '',
      }
  }
}

function MatchingPage() {
  const { matchingResultId } = useParams()

  const {
    status,
    data: matching,
    error,
  } = useMatching(matchingResultId)

  if (!matchingResultId) {
    return (
      <div className={styles.page}>
        <div className={styles.empty}>
          <h1 className={styles.title}>매칭 결과</h1>
          <p className={styles.emptyDescription}>
            확인할 매칭 결과가 없어요.
          </p>
        </div>
      </div>
    )
  }

  if (status === 'loading') {
    return (
      <div className={styles.page}>
        <p className={styles.message}>
          매칭 결과를 불러오는 중이에요.
        </p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className={styles.page}>
        <p className={styles.message}>
          매칭 결과를 불러오지 못했어요.
        </p>

        {error?.message && (
          <p className={styles.errorMessage}>
            {error.message}
          </p>
        )}
      </div>
    )
  }

  if (!matching) {
    return null
  }

  const message = getMatchingMessage(matching.status)

  return (
    <div className={styles.page}>
      <div className={styles.heading}>
        <h1 className={styles.title}>매칭 결과</h1>
        <p className={styles.description}>
          {message.description}
        </p>
      </div>

      <article className={styles.card}>
        <div className={styles.resultHeader}>
          <div>
            <h2 className={styles.resultTitle}>
              {message.title}
            </h2>

            <p className={styles.resultDescription}>
              {message.description}
            </p>
          </div>

          <span className={styles.badge}>
            {MATCHING_STATUS_LABEL[matching.status] ??
              matching.status}
          </span>
        </div>

        <div className={styles.divider} />

        <dl className={styles.infoList}>
          <div className={styles.infoRow}>
            <dt>매칭 요청일</dt>
            <dd>{formatDate(matching.requestedAt)}</dd>
          </div>

          <div className={styles.infoRow}>
            <dt>매칭 완료일</dt>
            <dd>{formatDate(matching.assignedAt)}</dd>
          </div>
        </dl>
      </article>
    </div>
  )
}

export default MatchingPage