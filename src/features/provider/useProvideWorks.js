import { useCallback, useEffect, useState } from 'react'
import {
  createProvideWork,
  deleteProvideWork,
  updateProvideWork,
} from '../../api/endpoints/provider'

/**
 * 제공 가능 요일/시간 목록
 *
 * 서버에 목록 조회 API가 없어서 화면에 보여줄 값은 예시 데이터로 채우고,
 * 등록·수정·삭제만 실제 API를 호출한다. 결과는 이 기기에만 남는다.
 * GET /service-offerings/{id}/provide-works 가 생기면 이 파일만 교체하면 된다.
 */
const STORAGE_KEY = 'todak.provider.provideWorks'

// 빈 화면만 보이지 않도록 넣어둔 예시 (서버에 없는 값이다)
const SAMPLE_WORKS = [
  {
    provideWorkId: 'sample-1',
    serviceOfferingId: null,
    serviceName: '방문간호',
    day: 1,
    startedAt: '11:00',
    finishedAt: '12:00',
  },
  {
    provideWorkId: 'sample-2',
    serviceOfferingId: null,
    serviceName: '방문간호',
    day: 3,
    startedAt: '11:00',
    finishedAt: '12:00',
  },
  {
    provideWorkId: 'sample-3',
    serviceOfferingId: null,
    serviceName: '방문요양 / 방문목욕',
    day: 5,
    startedAt: '14:00',
    finishedAt: '16:00',
  },
]

function read() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : SAMPLE_WORKS
  } catch {
    return SAMPLE_WORKS
  }
}

function write(works) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(works))
  } catch {
    // 저장에 실패해도 화면 동작은 막지 않는다
  }
}

export function useProvideWorks() {
  const [works, setWorks] = useState([])
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    setWorks(read())
    setStatus('success')
  }, [])

  const save = useCallback((next) => {
    setWorks(next)
    write(next)
  }, [])

  /** 요일 여러 개를 한 번에 등록한다 (요청은 요일마다 1건) */
  const addWorks = useCallback(
    async ({ serviceOfferingId, serviceName, days, startedAt, finishedAt }) => {
      const created = await Promise.all(
        days.map(async (day) => {
          const result = await createProvideWork(serviceOfferingId, {
            day,
            startedAt,
            finishedAt,
          })

          return {
            provideWorkId: result.provideWorkId,
            serviceOfferingId,
            serviceName,
            day,
            startedAt,
            finishedAt,
          }
        }),
      )

      save([...read(), ...created])
    },
    [save],
  )

  const editWork = useCallback(
    async (work, { serviceOfferingId, serviceName, day, startedAt, finishedAt }) => {
      await updateProvideWork(work.serviceOfferingId, work.provideWorkId, {
        day,
        startedAt,
        finishedAt,
      })

      save(
        read().map((item) =>
          item.provideWorkId === work.provideWorkId
            ? { ...item, serviceOfferingId, serviceName, day, startedAt, finishedAt }
            : item,
        ),
      )
    },
    [save],
  )

  const removeWork = useCallback(
    async (work) => {
      await deleteProvideWork(work.serviceOfferingId, work.provideWorkId)
      save(read().filter((item) => item.provideWorkId !== work.provideWorkId))
    },
    [save],
  )

  return { works, status, addWorks, editWork, removeWork }
}
