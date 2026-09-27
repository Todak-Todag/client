import { getMyOfferings, getProvideServices } from '../../api/endpoints/provider'
import { useAsync } from '../../hooks/useAsync'

/** 내가 등록한 제공 서비스 (일정 등록 화면의 선택지) */
const loadMyOfferings = async (signal) => {
  const page = await getMyOfferings({ size: 50, signal })
  return page?.content ?? []
}

export function useMyOfferings() {
  return useAsync(loadMyOfferings)
}

/** 내 제공 서비스 + 고를 수 있는 전체 서비스 종류 (관리 화면에서 함께 쓴다) */
const loadOfferingChoices = async (signal) => {
  const [mine, all] = await Promise.all([
    loadMyOfferings(signal),
    getProvideServices({ size: 50, signal }),
  ])

  return { mine, all: all?.content ?? [] }
}

export function useOfferingChoices() {
  return useAsync(loadOfferingChoices)
}
