import { useState } from 'react'
import { ApiError } from '../../api/client'
import {
  getSocialWorkerMatching,
  getSocialWorkerMatchingTask,
  requestSocialWorkerMatching,
} from '../../api/endpoints/socialWorkerMatching'
import { SOCIAL_WORKER_MATCHING_TASK_STATUS } from '../../constants/status'
import { useAsync } from '../../hooks/useAsync'
import { getMatchingErrorMessage } from './matchingErrors'
import {
  clearSocialWorkerMatching,
  readSocialWorkerMatching,
  saveSocialWorkerMatching,
} from './matchingStorage'

/**
 * 보관한 ID로 현재 상태를 만든다.
 * - idle: 요청한 적 없음 (또는 기록을 잃음)
 * - searching: task가 PENDING·PROCESSING
 * - taskFailed: 처리 중 오류 (서버가 결과를 FAILED로 돌려 두어 다시 요청할 수 있다)
 * - result: 매칭 결과 { status: REQUESTED|ACTIVE|FAILED|ENDED, assignedAt, … }
 */
async function loadSocialWorkerMatching(signal) {
  const record = readSocialWorkerMatching()
  if (!record) return { phase: 'idle' }

  try {
    let { matchingResultId } = record

    if (!matchingResultId) {
      const task = await getSocialWorkerMatchingTask(record.taskId, { signal })

      if (task.taskStatus === SOCIAL_WORKER_MATCHING_TASK_STATUS.FAILED) {
        clearSocialWorkerMatching()
        return { phase: 'taskFailed' }
      }
      if (task.taskStatus !== SOCIAL_WORKER_MATCHING_TASK_STATUS.COMPLETED || !task.matchingResultId) {
        return { phase: 'searching' }
      }

      // task는 1시간 뒤 사라지므로 결과 ID로 바꿔 보관한다
      matchingResultId = task.matchingResultId
      saveSocialWorkerMatching({ matchingResultId })
    }

    const result = await getSocialWorkerMatching(matchingResultId, { signal })
    return { phase: 'result', result }
  } catch (error) {
    if (signal.aborted) throw error
    // task 만료(404)·다른 계정의 기록(403)은 다시 시도해도 같다. 기록을 지우고 처음 상태로
    if (error instanceof ApiError && (error.status === 403 || error.status === 404)) {
      clearSocialWorkerMatching()
      return { phase: 'idle' }
    }
    throw error
  }
}

/**
 * 사회복지사 매칭 상태와 요청 동작.
 * 푸시가 없어서 결과는 refresh(상태 새로고침)로 다시 확인한다.
 *
 * @returns {{ status: string, data: { phase: string, result?: object } | null, error: Error|null,
 *   refresh: () => void, request: () => Promise<void>, requesting: boolean, requestError: string|null }}
 */
export function useSocialWorkerMatching() {
  const state = useAsync(loadSocialWorkerMatching)
  const [requesting, setRequesting] = useState(false)
  const [requestError, setRequestError] = useState(null)

  const refresh = () => {
    setRequestError(null)
    state.reload()
  }

  const request = async () => {
    setRequesting(true)
    setRequestError(null)
    try {
      const { taskId } = await requestSocialWorkerMatching()
      saveSocialWorkerMatching({ taskId })
      state.reload()
    } catch (caught) {
      setRequestError(getMatchingErrorMessage(caught))
    } finally {
      setRequesting(false)
    }
  }

  return {
    status: state.status,
    data: state.data,
    error: state.error,
    refresh,
    request,
    requesting,
    requestError,
  }
}
