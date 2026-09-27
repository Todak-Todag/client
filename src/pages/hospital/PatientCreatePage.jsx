import styles from './PatientCreatePage.module.css'

/*
 * 퇴원 예정자 등록
 *
 * 등록은 서버 호출 3번이 이어진다.
 *   POST /users/patients  → patientId
 *   POST /discharges      → dischargeId
 *   POST /care-plans      → carePlanId (권고 사항을 provideServiceIds로 담는다)
 *
 * TODO: 입력 필드와 검증, 권고 사항 목록, 등록 처리
 */
function PatientCreatePage() {
  return (
    <div className={styles.page}>
      <form className={styles.form} noValidate>
        {/* TODO: 아이디 · 비밀번호 · 환자명 · 전화번호 · 주소 · 지역 · 퇴원예정일 · 병원명 */}
        {/* TODO: 권고 사항 체크박스 (GET /provide-services) */}
        {/* TODO: 등록하기 버튼 */}
      </form>
    </div>
  )
}

export default PatientCreatePage
