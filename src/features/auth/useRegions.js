import { getRegions } from '../../api/endpoints/region'
import { useAsync } from '../../hooks/useAsync'

export function formatRegion(region) {
  return `${region.province} ${region.district}`;
}

async function loadRegions(signal) {
  const result = await getRegions({ signal });
  return result?.content ?? [];
}

export function useRegions() {
  return useAsync(loadRegions);
}