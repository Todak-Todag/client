import { useNavigate } from 'react-router-dom'
import Header, { HeaderSpacer } from '../components/layout/Header'
import styles from './AppLayout.module.css'

/** 뒤로가기 헤더만 있는 화면 (네브바 없음) */
function SubPageLayout({ title, children }) {
  const navigate = useNavigate()

  return (
    <div className={styles.layout}>
      <Header title={title} showBack onBack={() => navigate(-1)} />
      <HeaderSpacer />
      <main className={styles.content}>{children}</main>
    </div>
  )
}

export default SubPageLayout
