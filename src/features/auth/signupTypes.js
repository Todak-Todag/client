import {
  HospitalIcon,
  StethoscopeIcon,
  UserIcon,
} from '../../components/ui/Icons'

export const SIGNUP_TYPES = [
  {
    key: 'social-worker',
    role: 'SOCIAL_WORKER',
    title: '사회복지사 회원가입',
    description: 'todak-todag 수립 및 관리 담당 사회복지사',
    Icon: UserIcon,
  },
  {
    key: 'hospital',
    role: 'HOSPITAL_STAFF',
    title: '병원 담당자 회원가입',
    description: '퇴원 예정자 연계 및 환자 프로필 관리',
    Icon: HospitalIcon
  },
  {
    key: 'provider',
    role: 'SERVICE_PROVIDER',
    title: '서비스 제공자 회원가입',
    description: '방문진료, 방문간호 서비스 전문 파트너',
    Icon: StethoscopeIcon
  }
]

export function getSignupType(key) {
  return SIGNUP_TYPES.find((type) => type.key === key);
}