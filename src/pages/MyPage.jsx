import { useNavigate } from 'react-router-dom'
import Button from '../components/common/Button'
import { PATHS } from '../routes/paths'
import styles from './HomePage.module.css'

/* TODO: 임시 화면 - 실제 화면 작업 시 교체 */
function MyPage() {
  const navigate = useNavigate()

  return (
    <section className={styles.page}>
      <h2 className={styles.heading}>마이페이지</h2>
      <p className={styles.desc}>임시 화면입니다.</p>

      <Button>마이페이지 버튼</Button>
      <Button variant="outline" onClick={() => navigate(PATHS.home)}>
        홈으로
      </Button>
    </section>
  )
}

export default MyPage
