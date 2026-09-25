import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import { PATHS } from '../../constants/paths'
import styles from './TempPage.module.css'

/* TODO: 임시 화면 - 실제 화면 작업 시 교체 */
function MatchingPage() {
  const navigate = useNavigate()

  return (
    <section className={styles.page}>
      <h2 className={styles.heading}>매칭</h2>
      <p className={styles.desc}>임시 화면입니다.</p>

      <Button>매칭 버튼</Button>
      <Button variant="outline" onClick={() => navigate(PATHS.home)}>
        홈으로
      </Button>
    </section>
  )
}

export default MatchingPage
