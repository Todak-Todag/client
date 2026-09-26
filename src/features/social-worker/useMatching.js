import {
  MOCK_SOCIAL_WORKER_MATCHINGS
} from '../../pages/social-worker/socialWorkerMatching'

export function useMatching() {
  return {
    status: 'success',
    matchings: MOCK_SOCIAL_WORKER_MATCHINGS,
    error: null,
  }
}