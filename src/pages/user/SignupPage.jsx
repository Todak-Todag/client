import { Link, useNavigate } from "react-router-dom"
import { PATHS } from '../../constants/paths'
import Header, { HeaderSpacer } from '../../components/layout/Header'
import BottomBar from "../../components/layout/BottomBar"
import styles from './SignupPage.module.css'
import {
  ChevronRightIcon
} from '../../components/ui/Icons'
import { SIGNUP_TYPES } from '../../features/auth/signupTypes'

/*
 * onBack={() => navigate(-1)} 호출되면 navigate(-1)을 실행하는 함수이다.
 * 이때 주의할 점은 () => 화살표 함수를 빼고 적으면 화면이 그려지는 순간 바로 실행되는 점이다.
 * navigate(-1)은 브라우저 뒤로가기와 같다. 숫자 -1은 "한 칸 뒤로" 라는 뜻이다.
 * 로그인에서 넘어왔으면 로그인으로 돌아간다.
 * 
 * <Link> 에서 to는 onClick에 해당하는 속성이다
 * 눌렀을 때 어디로 가냐?
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
          <Link
            key={key}
            className={styles.card}
            to={`${PATHS.signupConsent}?type=${key}`}
          >
            <span className={styles.iconBox}>
              <Icon className={styles.icon} />
            </span>

            <span className={styles.cardText}>
              <span className={styles.cardTitle}>{title}</span>
              <span className={styles.cardDescription}>{description}</span>
            </span>

            <ChevronRightIcon className={styles.chevron} />
          </Link>
        ))}
      </div>

      <BottomBar />

    </div>
  )
}

export default SignupPage