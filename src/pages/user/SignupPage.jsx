import { useNavigate } from "react-router-dom"
import Header, { HeaderSpacer } from '../../components/layout/Header'
import BottomBar from "../../components/layout/BottomBar"
import styles from './SignupPage.module.css'
import {
  ChevronRightIcon,
  UserIcon,
  HospitalIcon,
  StethoscopeIcon
} from '../../components/ui/Icons'

/*
 * map은 배열의 강 항목을 다른 것으로 바꿔서 새 배열을 만드는 함수
 * [1, 2, 3].map((n) => n * 2) -> [2, 4, 6]
 */
const SIGNUP_TYPES = [
  {
    key: 'social-worker',
    title: '사회복지사 회원가입',
    description: 'todak-todag 수립 및 관리 담당 사회복지사',
    Icon: UserIcon,
  },
  {
    key: 'hospital',
    title: '병원 담당자 회원가입',
    description: '퇴원 예정자 연계 및 환자 프로필 관리',
    Icon: HospitalIcon
  },
  {
    key: 'provider',
    title: '서비스 제공자 회원가입',
    description: '방문진료, 방문간호 서비스 전문 파트너',
    Icon: StethoscopeIcon
  }
]

/*
 * onBack={() => navigate(-1)} 호출되면 navigate(-1)을 실행하는 함수이다.
 * 이때 주의할 점은 () => 화살표 함수를 빼고 적으면 화면이 그려지는 순간 바로 실행되는 점이다.
 * navigate(-1)은 브라우저 뒤로가기와 같다. 숫자 -1은 "한 칸 뒤로" 라는 뜻이다.
 * 로그인에서 넘어왔으면 로그인으로 돌아간다.
 * 
 * 
 */
function SignupPage() {
  const navigate = useNavigate()

  return(
    <div className={styles.page}>
      <Header title="회원가입" logo={null} showBack onBack={() => navigate(-1)}/>
      <HeaderSpacer />

      <h1 className={styles.title}>가입 유형을 선택하세요</h1>
      <p className={styles.description}>
        보다 정확한 서비스 매칭을 위해 알맞은 유형을 선택해주세요.
      </p>

      <div className={styles.list}>
        {SIGNUP_TYPES.map(({key, title, description, Icon}) => (
          <button key={key} type="button" className={styles.card}>
            <span className={styles.iconBox}>
              <Icon className={styles.icon} />
            </span>

            <span className={styles.cardText}>
              <span className={styles.cardTitle}>{title}</span>
              <span className={styles.cardDescription}>{description}</span>
            </span>

            <ChevronRightIcon className={styles.chevron} />
          </button>
        ))}
      </div>

      <BottomBar />

    </div>
  )
}

export default SignupPage