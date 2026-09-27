import { useRef, useState } from 'react'
import { getErrorMessage } from '../../api/client'
import { createCarePlan } from '../../api/endpoints/carePlan'
import { createPatient } from '../../api/endpoints/auth'
import { createDischarge } from '../../api/endpoints/discharge'
import {
  toCarePlanRequest,
  toDischargeRequest,
  toPatientRequest,
} from './patientValidation'

/**
 * 퇴원 예정자 등록.
 *
 * 서버 호출 세 번이 이어지고, 중간에 실패해도 되돌릴 방법이 없다.
 * (환자 계정을 지우는 API가 없어 처음부터 다시 하면 아이디 중복으로 막힌다)
 * 그래서 성공한 단계의 결과를 기억해두고 실패한 지점부터 다시 시도한다.
 *
 * 마지막 Care Plan 생성은 실패해도 등록 자체는 성공으로 본다.
 * 환자 계정과 퇴원건은 이미 만들어졌고, 권고 사항은 나중에 다시 등록할 수 있다.
 */
export function usePatientCreate() {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [warning, setWarning] = useState('')

  // 이미 성공한 단계는 다시 호출하지 않는다
  const doneRef = useRef({ patientId: null, dischargeId: null })

  /**
   * @param {object} form 화면 입력값
   * @returns {Promise<boolean>} 등록이 끝났으면 true
   */
  const submit = async (form) => {
    setSubmitting(true)
    setError('')
    setWarning('')

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

    // 권고 사항 저장이 실패해도 등록은 성공으로 본다
    try {
      await createCarePlan(
        toCarePlanRequest(
          form,
          doneRef.current.patientId,
          doneRef.current.dischargeId,
        ),
      )
    } catch (caught) {
      setWarning(
        `등록은 완료됐지만 권고 사항을 저장하지 못했어요. (${getErrorMessage(caught)})`,
      )
    }

    setSubmitting(false)
    return true
  }

  return { submit, submitting, error, warning }
}

/** 어디까지 됐는지 알려줘야 사용자가 다시 시도할 수 있다 */
function buildStepMessage(done, message) {
  if (!done.patientId) return message
  return `환자 계정은 만들어졌어요. 퇴원 정보 등록에 실패했습니다. (${message}) 다시 시도하면 이어서 진행돼요.`
}
