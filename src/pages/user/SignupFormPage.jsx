import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import Header, { HeaderSpacer } from '../../components/layout/Header'
import { getSignupType } from '../../features/auth/signupTypes'
import { PATHS } from '../../constants/paths'

function SignupFormPage() {
  const navigate = useNavigate()
  const { state } = useLocation()

  const signupType = getSignupType(state?.type)
  const agreements = state?.agreements

  // 약관 동의를 거치지 않고 직접 들어온 경우
  if (!signupType || !agreements) {
    return <Navigate to={PATHS.signup} replace />
  }

  return (
    <div>
      <Header
        title="회원가입"
        logo={null}
        showBack
        onBack={() => navigate(-1)}
      />
      <HeaderSpacer />

      <p>{signupType.title}</p>
      <p>약관 {agreements.length}건 동의 완료</p>
    </div>
  )
}

export default SignupFormPage