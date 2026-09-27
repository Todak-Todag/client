import { useState } from 'react'
import { getErrorMessage } from '../../api/client'
import { createOffering, deleteOffering } from '../../api/endpoints/provider'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import EmptyState from '../../components/common/EmptyState'
import Button from '../../components/ui/Button'
import { AlertIcon, ListIcon } from '../../components/ui/Icons'
import { clearOfferingCache } from '../../features/provider/useProviderSchedules'
import { useOfferingChoices } from '../../features/provider/useMyOfferings'
import SubPageLayout from '../../layouts/SubPageLayout'
import styles from './OfferingsPage.module.css'

/** 제공 서비스 등록·삭제 — 여기서 고른 서비스로만 제공 가능 일정을 만들 수 있다 */
function OfferingsPage() {
  const choices = useOfferingChoices()
  const [pendingId, setPendingId] = useState(null)
  const [removing, setRemoving] = useState(null)

  // 등록·삭제 뒤에는 일정 화면이 쓰는 서비스 이름 캐시도 함께 비운다
  const refresh = () => {
    clearOfferingCache()
    choices.reload()
  }

  const add = async (service) => {
    setPendingId(service.provideServiceId)

    try {
      await createOffering(service.provideServiceId)
      refresh()
    } catch (error) {
      window.alert(getErrorMessage(error))
    } finally {
      setPendingId(null)
    }
  }

  const remove = async () => {
    setPendingId(removing.serviceOfferingId)

    try {
      await deleteOffering(removing.serviceOfferingId)
      refresh()
    } catch (error) {
      window.alert(getErrorMessage(error))
    } finally {
      setRemoving(null)
      setPendingId(null)
    }
  }

  if (choices.status !== 'success') {
    return (
      <SubPageLayout title="제공 서비스 관리">
        {choices.status === 'error' ? (
          <EmptyState
            icon={AlertIcon}
            tone="error"
            title="서비스 목록을 불러오지 못했어요"
            description={getErrorMessage(choices.error)}
            action={
              <Button variant="outline" size="md" block={false} onClick={choices.reload}>
                다시 시도
              </Button>
            }
          />
        ) : (
          <p className={styles.state} role="status">
            불러오는 중이에요
          </p>
        )}
      </SubPageLayout>
    )
  }

  const { mine, all } = choices.data
  const registered = new Set(mine.map((offering) => offering.provideServiceId))
  const addable = all.filter((service) => !registered.has(service.provideServiceId))

  return (
    <SubPageLayout title="제공 서비스 관리">
      <section className={styles.page}>
        <h2 className={styles.heading}>내 제공 서비스</h2>

        {mine.length === 0 ? (
          <EmptyState
            icon={ListIcon}
            title="등록한 제공 서비스가 없어요"
            description="아래에서 제공할 서비스를 골라 등록해 주세요."
          />
        ) : (
          <ul className={styles.card}>
            {mine.map((offering) => (
              <li key={offering.serviceOfferingId} className={styles.row}>
                <span className={styles.name}>{offering.provideServiceName}</span>
                <Button
                  size="sm"
                  variant="danger"
                  block={false}
                  loading={pendingId === offering.serviceOfferingId}
                  onClick={() => setRemoving(offering)}
                >
                  삭제
                </Button>
              </li>
            ))}
          </ul>
        )}

        <h2 className={styles.heading}>등록할 수 있는 서비스</h2>

        {addable.length === 0 ? (
          <EmptyState icon={ListIcon} title="등록할 수 있는 서비스를 모두 등록했어요" />
        ) : (
          <ul className={styles.card}>
            {addable.map((service) => (
              <li key={service.provideServiceId} className={styles.row}>
                <span className={styles.name}>
                  {service.provideServiceName}
                  {service.content && <span className={styles.desc}>{service.content}</span>}
                </span>
                <Button
                  size="sm"
                  variant="soft"
                  block={false}
                  loading={pendingId === service.provideServiceId}
                  onClick={() => add(service)}
                >
                  등록
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <ConfirmDialog
        open={Boolean(removing)}
        danger
        title={`${removing?.provideServiceName ?? ''} 서비스를 삭제할까요?`}
        description="등록해 둔 제공 가능 요일·시간이 함께 사라지고, 이 서비스로는 더 이상 새로 매칭되지 않아요. 이미 확정된 일정과 수행 결과는 그대로 남아요."
        confirmLabel="삭제"
        onConfirm={remove}
        onClose={() => setRemoving(null)}
      />
    </SubPageLayout>
  )
}

export default OfferingsPage
