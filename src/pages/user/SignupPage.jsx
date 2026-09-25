import { useNavigate } from "react-router-dom";
import Header, { HeaderSpacer } from '../../components/layout/Header'
import BottomBar from "../../components/layout/BottomBar"
import styles from './SignupPage.module.css'

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

      <BottomBar />

    </div>
  )
}

export default SignupPage