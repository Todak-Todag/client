/**
 * 병원 담당자 홈의 임시 데이터.
 *
 * 서버에서 받을 수 없어 화면 확인용으로 둔 값들이다. 두 가지가 섞여 있다.
 *
 * 1) 환자 이름·나이·성별
 *    GET /discharges 응답에는 patientId(UUID)만 있고 이름이 없다.
 *    나이·성별은 DB에도 없는 필드라 백엔드가 추가하지 않는 한 받을 수 없다.
 *
 * 2) todak-todag(케어플랜) 작성 여부
 *    병원 담당자는 케어플랜을 만들고 지울 수는 있지만 조회할 수 없다.
 *    (GET /care-plans는 PATIENT 전용, 상세 조회도 병원 담당자 불가)
 *
 * 실제 API가 생기면 이 파일을 지우고 응답 값을 그대로 쓰면 된다.
 * 목록 자체(DUMMY_DISCHARGES)는 서버 응답과 같은 모양이라 카드 컴포넌트는 손댈 필요가 없다.
 */

/** GET /discharges 응답(DischargeSearchResponse)과 같은 모양 */
export const DUMMY_DISCHARGES = [
  {
    dischargeId: 'dummy-discharge-1',
    patientId: 'dummy-patient-1',
    hospitalName: '토닥종합병원',
    status: 'SCHEDULED',
    scheduledDate: '2026-08-29',
    actualDate: null,
  },
  {
    dischargeId: 'dummy-discharge-2',
    patientId: 'dummy-patient-2',
    hospitalName: '토닥종합병원',
    status: 'COMPLETED',
    scheduledDate: '2026-07-29',
    actualDate: '2026-07-29',
  },
  {
    dischargeId: 'dummy-discharge-3',
    patientId: 'dummy-patient-3',
    hospitalName: '토닥종합병원',
    status: 'COMPLETED',
    scheduledDate: '2026-06-29',
    actualDate: '2026-06-29',
  },
]

/** patientId -> 서버에서 받을 수 없는 환자 정보 */
const DUMMY_PATIENT_BY_ID = {
  'dummy-patient-1': {
    name: '김영수',
    age: 87,
    gender: '남성',
    carePlanWritten: false,
  },
  'dummy-patient-2': {
    name: '이말순',
    age: 79,
    gender: '여성',
    carePlanWritten: true,
  },
  'dummy-patient-3': {
    name: '박철호',
    age: 83,
    gender: '남성',
    carePlanWritten: true,
  },
}

/** 모르는 patientId여도 화면이 깨지지 않도록 기본값을 돌려준다 */
const UNKNOWN_PATIENT = {
  name: '이름 미확인',
  age: null,
  gender: null,
  carePlanWritten: false,
}

export function getDummyPatient(patientId) {
  return DUMMY_PATIENT_BY_ID[patientId] ?? UNKNOWN_PATIENT
}
