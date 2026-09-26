import { getConsentDocuments } from '../../api/endpoints/consent'
import { useAsync } from '../../hooks/useAsync'

async function loadConsentDocuments(signal) {
  const page = await getConsentDocuments({signal});
  return page?.content ?? [];
}

export function useConsentDocuments() {
  return useAsync(loadConsentDocuments);
}