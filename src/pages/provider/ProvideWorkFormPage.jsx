import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getErrorMessage } from '../../api/client'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import EmptyState from '../../components/common/EmptyState'
import Button from '../../components/ui/Button'
import { ListIcon } from '../../components/ui/Icons'
import ProvideWorkForm from '../../features/provider/ProvideWorkForm'
import { useMyOfferings } from '../../features/provider/useMyOfferings'
import { useProvideWorks } from '../../features/provider/useProvideWorks'
import SubPageLayout from '../../layouts/SubPageLayout'
import { PROVIDER_PATHS } from '../../constants/paths'
import styles from './FormPage.module.css'

/** 제공 가능 일정 생성 / 수정 */
function ProvideWorkFormPage() {
  const navigate = useNavigate()
  const { provideWorkId } = useParams()
  const offerings = useMyOfferings()
  const { works, addWorks, editWork, removeWork } = useProvideWorks()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [removeOpen, setRemoveOpen] = useState(false)

  const mode = provideWorkId ? 'edit' : 'create'
  const editing = works.find((work) => work.provideWorkId === provideWorkId)
  const loading = offerings.status === 'loading'

  // 제공 서비스를 하나도 등록하지 않았으면 고를 선택지가 없어 폼을 띄우지 않는다
  const noOfferings = (offerings.data ?? []).length === 0

  const submit = async (form) => {
    setSubmitting(true)
    setError(null)

    try {
      if (mode === 'edit') {
        await editWork(editing, { ...form, day: form.days[0] })
      } else {
        await addWorks(form)
      }
      navigate(PROVIDER_PATHS.schedule, { replace: true })
    } catch (caught) {
      setError(getErrorMessage(caught))
    } finally {
      setSubmitting(false)
    }
  }

  const remove = async () => {
    setRemoveOpen(false)

    try {
      await removeWork(editing)
      navigate(PROVIDER_PATHS.schedule, { replace: true })
    } catch (caught) {
      setError(getErrorMessage(caught))
    }
  }

  const renderBody = () => {
    if (loading) {
      return (
        <p className={styles.state} role="status">
          불러오는 중이에요
        </p>
      )
    }

    if (noOfferings) {
      return (
        <EmptyState
          icon={ListIcon}
          title="등록한 제공 서비스가 없어요"
          description="제공할 서비스를 먼저 등록해야 방문 일정을 만들 수 있어요."
          action={
            <Button
              variant="outline"
              size="md"
              block={false}
              onClick={() => navigate(PROVIDER_PATHS.offerings)}
            >
              제공 서비스 등록하러 가기
            </Button>
          }
        />
      )
    }

    return (
      <ProvideWorkForm
        mode={mode}
        offerings={offerings.data ?? []}
        submitting={submitting}
        initial={
          editing && {
            days: [editing.day],
            startedAt: editing.startedAt,
            finishedAt: editing.finishedAt,
            serviceOfferingId: editing.serviceOfferingId,
          }
        }
        onSubmit={submit}
      />
    )
  }

  return (
    <SubPageLayout title={mode === 'edit' ? '일정 수정' : '일정 생성'}>
      {renderBody()}

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      {mode === 'edit' && editing && (
        <Button variant="danger" className={styles.remove} onClick={() => setRemoveOpen(true)}>
          이 일정 삭제하기
        </Button>
      )}

      <ConfirmDialog
        open={removeOpen}
        danger
        title="이 제공 일정을 삭제할까요?"
        description="삭제하면 이 요일·시간에는 더 이상 매칭되지 않아요."
        confirmLabel="삭제"
        onConfirm={remove}
        onClose={() => setRemoveOpen(false)}
      />
    </SubPageLayout>
  )
}

export default ProvideWorkFormPage
