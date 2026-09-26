import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import EmptyState from '../../components/common/EmptyState'
import Button from '../../components/ui/Button'
import { CalendarIcon } from '../../components/ui/Icons'
import ProvideWorkCard from '../../features/provider/ProvideWorkCard'
import { useProvideWorks } from '../../features/provider/useProvideWorks'
import { PROVIDER_PATHS, toPath } from '../../constants/paths'
import styles from './SchedulePage.module.css'

/** 같은 서비스 + 같은 시간대끼리 카드 한 장으로 묶는다 */
function groupWorks(works) {
  const groups = new Map()

  works.forEach((work) => {
    const key = `${work.serviceOfferingId}-${work.startedAt}-${work.finishedAt}`

    if (!groups.has(key)) {
      groups.set(key, {
        key,
        serviceOfferingId: work.serviceOfferingId,
        serviceName: work.serviceName,
        startedAt: work.startedAt,
        finishedAt: work.finishedAt,
        works: [],
      })
    }

    groups.get(key).works.push(work)
  })

  return [...groups.values()]
}

/** 내 일정 — 등록해 둔 제공 가능 요일/시간 */
function SchedulePage() {
  const navigate = useNavigate()
  const { works } = useProvideWorks()
  const groups = useMemo(() => groupWorks(works), [works])

  const edit = (group) =>
    navigate(
      toPath(PROVIDER_PATHS.scheduleEdit, { provideWorkId: group.works[0].provideWorkId }),
    )

  return (
    <section className={styles.page}>
      {groups.length === 0 && (
        <EmptyState
          icon={CalendarIcon}
          title="등록한 제공 일정이 없어요"
          description="방문 가능한 요일과 시간을 등록하면 매칭이 시작돼요."
        />
      )}

      {groups.map((group) => (
        <ProvideWorkCard key={group.key} group={group} onEdit={edit} />
      ))}

      <Button variant="outline" onClick={() => navigate(PROVIDER_PATHS.scheduleNew)}>
        + 일정 추가하기
      </Button>
    </section>
  )
}

export default SchedulePage
