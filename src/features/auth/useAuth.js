import { getMe } from '../../api/endpoints/auth'
import { useAsync } from '../../hooks/useAsync'

const loadMe = (signal) => getMe({ signal })

/**
 * 로그인한 사용자 정보
 * @returns {{ status: string, data: { name: string, role: string } | null, error: Error|null, reload: () => void }}
 */
export function useAuth() {
  return useAsync(loadMe)
}
