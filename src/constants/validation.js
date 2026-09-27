/**
 * 계정 입력 검증 규칙.
 *
 * 서버의 @Pattern과 같은 정규식이다.
 * (UserSignupRequest · UserPatientCreateRequest 양쪽이 동일한 규칙을 쓴다)
 * 서버에서 규칙이 바뀌면 여기만 고친다.
 */

/** 6자 이상, 영문 소문자로 시작, 영문과 숫자를 모두 포함 */
export const USERNAME_PATTERN = /^(?=.*[A-Za-z])(?=.*\d)[a-z][A-Za-z0-9]{5,}$/

/** 8자 이상, 영문·숫자·특수문자를 각각 하나 이상 포함, 공백 불가 */
export const PASSWORD_PATTERN =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9\s])\S{8,}$/

/** 한글 또는 영문만 */
export const NAME_PATTERN = /^[A-Za-z가-힣]+$/

/** '-' 없이 숫자 9~11자리 */
export const PHONE_PATTERN = /^\d{9,11}$/

/** 아이디·비밀번호 최대 길이 (@Size) */
export const MAX_ACCOUNT_LENGTH = 20
