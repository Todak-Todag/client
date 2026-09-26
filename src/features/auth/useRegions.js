import { getRegions } from '../../api/endpoints/region'
import { useAsync } from '../../hooks/useAsync'

async function loadRegions(signal) {
  const result = await getRegions({ signal });
  return result?.content ?? [];
}

export function useRegions() {
  return useAsync(loadRegions);
}