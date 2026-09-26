export const MOCK_SOCIAL_WORKER_MATCHINGS = [
  {
    matchingResultId: '11111111-1111-1111-1111-111111111111',
    patientId: '22222222-2222-2222-2222-222222222222',
    socialWorkerId: '33333333-3333-3333-3333-333333333333',

    // 실제 매칭 결과 API에 환자 이름은 없으므로
    // UI 확인용 임시 Mock 값
    patientName: '김영수',

    status: 'ACTIVE',
    requestedAt: '2026-09-25T01:00:00Z',
    assignedAt: '2026-09-25T01:05:00Z',
  },
  {
    matchingResultId: '44444444-4444-4444-4444-444444444444',
    patientId: '55555555-5555-5555-5555-555555555555',
    socialWorkerId: '33333333-3333-3333-3333-333333333333',

    patientName: '한영수',

    status: 'ENDED',
    requestedAt: '2026-08-20T02:00:00Z',
    assignedAt: '2026-08-20T02:10:00Z',
  },
]