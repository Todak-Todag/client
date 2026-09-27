import { ApiError } from '../../api/client'
import { getCarePlanErrorMessage } from '../care-plan/carePlanErrors'

/**
 * Care Plan 생성에서만 만나는 오류.
 *
 * 병원 담당자는 케어플랜을 조회할 수 없어서(GET은 PATIENT 전용) 화면이
 * '이미 작성됨'을 미리 알 수 없다. 눌러 본 뒤 409로 알게 되므로 문구로 안내한다.
 */
const MESSAGE_BY_CODE = {
  DISCHARGE_NOT_COMPLETED:
    '실제 퇴원 처리가 끝난 뒤에 작성할 수 있어요. 홈에서 퇴원처리를 먼저 해 주세요.',
  CARE_PLAN_ALREADY_EXISTS:
    '이미 작성된 Care Plan이 있어요. 다시 만들 수는 없어요.',
  CARE_PLAN_PATIENT_MISMATCH:
    '퇴원 정보와 환자가 맞지 않아요. 홈에서 다시 선택해 주세요.',
}

export function getCarePlanCreateErrorMessage(error) {
  if (error instanceof ApiError && MESSAGE_BY_CODE[error.code]) {
    return MESSAGE_BY_CODE[error.code]
  }

  return getCarePlanErrorMessage(error)
}
