import {
  MAX_ACCOUNT_LENGTH,
  NAME_PATTERN,
  PASSWORD_PATTERN,
  PHONE_PATTERN,
  USERNAME_PATTERN,
} from '../../constants/validation'
import { toLocalDateString } from '../../utils/date'

/** 퇴원 예정일은 미래만 허용된다 (서버 @Future). 오늘도 거부되므로 내일부터 */
export function getMinScheduledDate() {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return toLocalDateString(tomorrow)
}

/**
 * 퇴원 예정자 등록 입력값 검사.
 * 계정 규칙은 회원가입과 같다 (UserPatientCreateRequest의 @Pattern).
 *
 * @returns {object} 문제가 있는 항목만 담긴 객체. 비어 있으면 통과
 */
export function validatePatientForm(form) {
  const errors = {}

  if (!form.username) {
    errors.username = '아이디를 입력해 주세요.'
  } else if (form.username.length > MAX_ACCOUNT_LENGTH) {
    errors.username = `아이디는 최대 ${MAX_ACCOUNT_LENGTH}자입니다.`
  } else if (!USERNAME_PATTERN.test(form.username)) {
    errors.username =
      '6자 이상, 영문 소문자로 시작하고 영문과 숫자를 포함해야 해요.'
  }

  if (!form.password) {
    errors.password = '비밀번호를 입력해 주세요.'
  } else if (form.password.length > MAX_ACCOUNT_LENGTH) {
    errors.password = `비밀번호는 최대 ${MAX_ACCOUNT_LENGTH}자입니다.`
  } else if (!PASSWORD_PATTERN.test(form.password)) {
    errors.password =
      '8자 이상, 영문·숫자·특수문자를 각각 하나 이상 포함해야 해요.'
  }

  if (!form.passwordConfirm) {
    errors.passwordConfirm = '비밀번호를 한 번 더 입력해 주세요.'
  } else if (form.password !== form.passwordConfirm) {
    errors.passwordConfirm = '비밀번호가 일치하지 않아요.'
  }

  if (!form.name) {
    errors.name = '환자명을 입력해 주세요.'
  } else if (!NAME_PATTERN.test(form.name)) {
    errors.name = '한글 또는 영문만 입력할 수 있어요.'
  }

  if (!form.phone) {
    errors.phone = '전화번호를 입력해 주세요.'
  } else if (!PHONE_PATTERN.test(form.phone)) {
    errors.phone = "'-' 없이 숫자만 9~11자리로 입력해 주세요."
  }

  // 지역은 선택 사항이지만, 고른 경우에는 주소가 있어야 한다
  if (form.regionId && !form.address.trim()) {
    errors.address = '지역을 선택했다면 주소도 입력해 주세요.'
  }

  if (!form.hospitalName.trim()) {
    errors.hospitalName = '병원명을 입력해 주세요.'
  }

  if (!form.scheduledDate) {
    errors.scheduledDate = '퇴원 예정일을 선택해 주세요.'
  } else if (form.scheduledDate < getMinScheduledDate()) {
    errors.scheduledDate = '퇴원 예정일은 내일 이후로 선택해 주세요.'
  }

  return errors
}
