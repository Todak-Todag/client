/**
 * 병원 담당자 홈의 임시 환자 정보.
 *
 * 서버에서 받을 수 없어 화면 확인용으로 지어내는 값들이다. 두 가지다.
 *
 * 1) 환자 이름·나이·성별
 *    GET /discharges 응답에는 patientId(UUID)만 있고 이름이 없다.
 *    나이·성별은 DB에도 없는 필드라 백엔드가 추가하지 않는 한 받을 수 없다.
 *
 * 2) todak-todag(케어플랜) 작성 여부
 *    병원 담당자는 케어플랜을 만들고 지울 수는 있지만 조회할 수 없다.
 *    (GET /care-plans는 PATIENT 전용, 상세 조회도 병원 담당자 불가)
 *
 * patientId로 값을 정하므로 같은 환자는 항상 같은 이름으로 보인다.
 * 실제 API가 생기면 이 파일을 지우고 응답 값을 그대로 쓰면 된다.
 *
 * DUMMY_DISCHARGES는 서버에 데이터가 쌓이기 전 화면을 확인하려고 둔 목록이다.
 * GET /discharges 응답과 같은 모양이라, 연동할 때 이 배열만 응답으로 바꾸면 된다.
 */

/** GET /discharges 응답(DischargeSearchResponse)과 같은 모양 */
export const DUMMY_DISCHARGES = [
  {
    dischargeId: '00000000-0000-4000-8000-0000000000a2',
    patientId: '00000000-0000-4000-8000-000000000002',
    hospitalName: '토닥종합병원',
    status: 'SCHEDULED',
    scheduledDate: '2026-08-29',
    actualDate: null,
  },
  {
    dischargeId: '00000000-0000-4000-8000-0000000000a3',
    patientId: '00000000-0000-4000-8000-000000000003',
    hospitalName: '토닥종합병원',
    status: 'COMPLETED',
    scheduledDate: '2026-07-29',
    actualDate: '2026-07-29',
  },
  {
    dischargeId: '00000000-0000-4000-8000-0000000000a4',
    patientId: '00000000-0000-4000-8000-000000000004',
    hospitalName: '토닥종합병원',
    status: 'COMPLETED',
    scheduledDate: '2026-06-29',
    actualDate: '2026-06-29',
  },
]

const NAMES = [
  '김영수',
  '이말순',
  '박철호',
  '최순자',
  '정대현',
  '한복희',
  '오성근',
  '윤정애',
]

const GENDERS = ['남성', '여성']

/** 문자열을 숫자로 바꾼다 (같은 입력이면 항상 같은 값) */
function hash(value) {
  let result = 0
  for (let index = 0; index < value.length; index += 1) {
    result = (result * 31 + value.charCodeAt(index)) % 100_000
  }
  return result
}

/**
 * patientId로 지어낸 환자 정보
 *
 * @returns {{ name: string, age: number, gender: string, carePlanWritten: boolean }}
 */
export function getDummyPatient(patientId) {
  const seed = hash(String(patientId ?? ''))

  return {
    name: NAMES[seed % NAMES.length],
    age: 65 + (seed % 30),
    gender: GENDERS[seed % GENDERS.length],
    // 3건 중 1건 정도가 '작성 필요'로 보이게 한다
    carePlanWritten: seed % 3 !== 0,
  }
}
