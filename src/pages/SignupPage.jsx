import { useNavigate } from 'react-router-dom'
import Button from '../components/common/Button'
import { PATHS } from '../routes/paths'

/* TODO: 임시 화면 - 회원가입 화면 작업 시 교체 */
function SignupPage() {
  const navigate = useNavigate()

  return (
    <section
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        maxWidth: 'var(--app-max-width)',
        margin: '0 auto',
        padding: '80px 24px',
        fontFamily: 'var(--font-sans)',
      }}
    >
      <h2>회원가입</h2>
      <Button variant="outline" onClick={() => navigate(PATHS.login)}>
        로그인으로 돌아가기
      </Button>
    </section>
  )
}

export default SignupPage
