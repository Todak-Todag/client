import { useNavigate } from 'react-router-dom'
import Button from '../components/common/Button'
import { PATHS } from '../routes/paths'

function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <section style={{ padding: '80px 24px', textAlign: 'center' }}>
      <h2>페이지를 찾을 수 없어요</h2>
      <Button onClick={() => navigate(PATHS.home, { replace: true })}>
        홈으로 가기
      </Button>
    </section>
  )
}

export default NotFoundPage
