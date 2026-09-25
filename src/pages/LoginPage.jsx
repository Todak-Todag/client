import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import BottomBar from '../components/layout/BottomBar'
import { PATHS } from '../constants/paths'
import logo from '../assets/images/logo.webp'

function LoginPage() {
  const navigate = useNavigate()

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
        minHeight: '100dvh',
        maxWidth: 'var(--app-max-width)',
        margin: '0 auto',
        padding: '0 24px',
        fontFamily: 'var(--font-sans)',
      }}
    >
      <img src={logo} alt="토닥토닥" width="120" height="120" />
      <Button onClick={() => navigate(PATHS.home, { replace: true })}>
        로그인
      </Button>
      <BottomBar />
    </div>
  )
}

export default LoginPage
