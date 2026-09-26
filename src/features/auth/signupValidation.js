const USERNAME_PATTERN = /^(?=.*[A-Za-z])(?=.*\d)[a-z][A-Za-z0-9]{5,}$/

const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9\s])\S{8,}$/

const NAME_PATTERN = /^[A-Za-z가-힣]+$/

const PHONE_PATTERN = /^\d{9,11}$/

export function validateSignupForm(form) {
  const errors = {}

  if (!form.username) {
    errors.username = '아이디를 입력해 주세요.'
  } else if (form.username.length > 20) {
    errors.username = '아이디는 최대 20자입니다.'
  } else if (!USERNAME_PATTERN.test(form.username)) {
    errors.username =
      '6자 이상, 영문 소문자로 시작하고 영문과 숫자를 포함해야 해요.'
  }

  if (!form.password) {
    errors.password = '비밀번호를 입력해 주세요.'
  } else if (form.password.length > 20) {
    errors.password = '비밀번호는 최대 20자입니다.'
  } else if (!PASSWORD_PATTERN.test(form.password)) {
    errors.password =
      '8자 이상, 영문·숫자·특수문자를 각각 하나 이상 포함해야 해요.'
  }

  if (!form.passwordConfirm) {
    errors.passwordConfirm = '비밀번호를 한 번 더 입력해 주세요.'
  } else if (form.password !== form.passwordConfirm) {
    errors.passwordConfirm = '비밀번호가 일치하지 않아요.'
  }

  if (!form.phone) {
    errors.phone = '전화번호를 입력해 주세요.'
  } else if (!PHONE_PATTERN.test(form.phone)) {
    errors.phone = "'-' 없이 숫자만 9~11자리로 입력해 주세요."
  }

  if (!form.name) {
    errors.name = '성명을 입력해 주세요.'
  } else if (!NAME_PATTERN.test(form.name)) {
    errors.name = '한글 또는 영문만 입력할 수 있어요.'
  }

  return errors
}