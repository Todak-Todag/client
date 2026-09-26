import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import Header, { HeaderSpacer } from '../../components/layout/Header'
import { getSignupType } from '../../features/auth/signupTypes'
import { PATHS } from '../../constants/paths'

/**
 * <Navigate> vs navigate()
 * <Navigate to=... /> 는 `컴포넌트`이고 화면을 그리던 와중에 다른 곳으로 보내버린다
 * navigate(...) 는 `함수`이고 이벤트가 일어났을 때 다른 곳으로 보내버린다
 * 이 화면을 그릴 때 조건이 안 맞으면 다른 데로 보내버리는 동작
 * 
 * replace가 붙는 이유
 * 기본적인 이동은 `방문 기록을 쌓는다` 그런데 잘못된 주소를 남기면 이런 일이 생긴다
 * 
 * /signup -> /signup/consent?type=zzz (튕김) /signup
 *                                         ↑ 뒤로가기 누르면
 *                                       다시 잘못된 주소 -> 또 튕김 -> 무한 반복
 * 
 * replace는 `현재 기록을 덮어쓴다` 잘못된 주소가 기록에 남지 않아서
 * 뒤로가기가 정상적으로 동작하게 된다
 */
function ConsentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const signupType = getSignupType(searchParams.get('type'));

  if(!signupType) return <Navigate to={PATHS.signup} replace />

  return (
    <div>
      <Header
        title="개인정보 처리 동의"
        logo={null}
        showBack
        onBack={() => navigate(-1)}
      />
      <HeaderSpacer />

      <p>선택한 가입 유형: {signupType.title}</p>
    </div>
  )
}

export default ConsentPage