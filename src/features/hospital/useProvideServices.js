import { getProvideServices } from '../../api/endpoints/provider'
import { useAsync } from '../../hooks/useAsync'

/** 서버가 받는 size는 10/30/50뿐이다. 서비스 종류는 많지 않아 한 번에 받는다 */
const PAGE_SIZE = 50

async function loadProvideServices(signal) {
  const page = await getProvideServices({ size: PAGE_SIZE, signal })
  return page?.content ?? []
}

/** 권고할 수 있는 서비스 종류 (방문간호, 방문목욕 등) */
export function useProvideServices() {
  return useAsync(loadProvideServices)
}
