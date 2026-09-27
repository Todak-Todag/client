import { useRef, useState } from 'react'
import { getErrorMessage } from '../../api/client'
import { createPatient } from '../../api/endpoints/auth'
import { createDischarge } from '../../api/endpoints/discharge'
import { toDischargeRequest, toPatientRequest } from './patientValidation'

/**
 * 퇴원 예정자 등록.
 *
 * 서버 호출 두 번이 이어지고, 중간에 실패해도 되돌릴 방법이 없다.
 * (환자 계정을 지우는 API가 없어 처음부터 다시 하면 아이디 중복으로 막힌다)
 * 그래서 성공한 단계의 결과를 기억해두고 실패한 지점부터 다시 시도한다.
 *
 * Care Plan은 여기서 만들지 않는다. 서버가 실제 퇴원이 완료된 뒤에만
 * 생성을 허용하기 때문이다. (DISCHARGE_NOT_COMPLETED 409)
 */
export function usePatientCreate() {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // 이미 성공한 단계는 다시 호출하지 않는다
  const doneRef = useRef({ patientId: null, dischargeId: null })

  /**
   * @param {object} form 화면 입력값
   * @returns {Promise<boolean>} 등록이 끝났으면 true
   */
  const submit = async (form) => {
    setSubmitting(true)
    setError('')

    try {
      if (!doneRef.current.patientId) {
        const patient = await createPatient(toPatientRequest(form))
        doneRef.current.patientId = patient.patientId
      }

      if (!doneRef.current.dischargeId) {
        const discharge = await createDischarge(
          toDischargeRequest(form, doneRef.current.patientId),
        )
        doneRef.current.dischargeId = discharge.dischargeId
      }
    } catch (caught) {
      setError(buildStepMessage(doneRef.current, getErrorMessage(caught)))
      setSubmitting(false)
      return false
    }

    setSubmitting(false)
    return true
  }

  return { submit, submitting, error }
}

/** 어디까지 됐는지 알려줘야 사용자가 다시 시도할 수 있다 */
function buildStepMessage(done, message) {
  if (!done.patientId) return message
  return `환자 계정은 만들어졌어요. 퇴원 정보 등록에 실패했습니다. (${message}) 다시 시도하면 이어서 진행돼요.`
}
