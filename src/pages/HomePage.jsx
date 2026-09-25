import { useNavigate } from 'react-router-dom'
import Button from '../components/common/Button'
import { PATHS } from '../routes/paths'
import styles from './HomePage.module.css'

/* TODO: 임시 화면 - 실제 홈 화면 작업 시 교체 */
function HomePage() {
  const navigate = useNavigate()

  return (
    <section className={styles.page}>
      <h2 className={styles.heading}>홈</h2>
      <p className={styles.desc}>임시 화면입니다. 버튼으로 이동해 보세요.</p>

      <Button onClick={() => navigate(PATHS.schedule)}>내 일정 보기</Button>
      <Button variant="outline" onClick={() => navigate(PATHS.matching)}>
        매칭하러 가기
      </Button>
      <Button variant="ghost" onClick={() => navigate(PATHS.login)}>
        로그인 화면으로
      </Button>

      <div className={styles.row}>
        <Button size="sm" block={false}>
          Small
        </Button>
        <Button size="md" block={false} variant="outline">
          Medium
        </Button>
        <Button size="sm" block={false} disabled>
          비활성
        </Button>
      </div>

      <Button loading>로딩 중</Button>
    </section>
  )
}

export default HomePage
