import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getErrorMessage } from '../../api/client'
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
  const { works, status, addWorks, editWork, removeWork } = useProvideWorks()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const mode = provideWorkId ? 'edit' : 'create'
  const editing = works.find((work) => work.provideWorkId === provideWorkId)
  const loading = offerings.status === 'loading' || status === 'loading'

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
    if (!window.confirm('이 제공 일정을 삭제할까요?')) return

    try {
      await removeWork(editing)
      navigate(PROVIDER_PATHS.schedule, { replace: true })
    } catch (caught) {
      setError(getErrorMessage(caught))
    }
  }

  return (
    <SubPageLayout title={mode === 'edit' ? '일정 수정' : '일정 생성'}>
      {loading ? (
        <p className={styles.state} role="status">
          불러오는 중이에요
        </p>
      ) : (
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
      )}

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      {mode === 'edit' && editing && (
        <button type="button" className={styles.remove} onClick={remove}>
          이 일정 삭제하기
        </button>
      )}
    </SubPageLayout>
  )
}

export default ProvideWorkFormPage
