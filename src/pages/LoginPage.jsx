<<<<<<< Updated upstream
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
=======
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
<<<<<<< Updated upstream
import '../styles/tokens.css'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import BottomBar from '../components/common/BottomBar'
import { login } from '../api/auth'
import { PATHS } from '../routes/paths'
import logo from '../../images/logo2.webp'
import styles from './LoginPage.module.css'

function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
=======
import { getErrorMessage } from '../api/client'
import { login } from '../api/endpoints/auth'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import BottomBar from '../components/layout/BottomBar'
import { PATHS } from '../constants/paths'
import logo from '../assets/images/logo2.webp'
import styles from './LoginPage.module.css'

const EMPTY_FORM = { username: '', password: '' }

function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
>>>>>>> Stashed changes

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
<<<<<<< Updated upstream
=======
    // 고치기 시작하면 해당 항목 오류와 전체 오류를 함께 지운다
>>>>>>> Stashed changes
    setErrors((prev) => ({ ...prev, [name]: '', form: '' }))
  }

  const validate = () => {
    const next = {}
    if (!form.username.trim()) next.username = '아이디를 입력해 주세요.'
    if (!form.password) next.password = '비밀번호를 입력해 주세요.'
    return next
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const nextErrors = validate()
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

<<<<<<< Updated upstream
    setLoading(true)
=======
    setSubmitting(true)
>>>>>>> Stashed changes
    try {
      await login({ username: form.username.trim(), password: form.password })
      navigate(PATHS.home, { replace: true })
    } catch (error) {
<<<<<<< Updated upstream
      setErrors({
        form:
          error.status === 401 || error.status === 400
            ? '아이디 또는 비밀번호를 확인해 주세요.'
            : error.message,
      })
    } finally {
      setLoading(false)
=======
      // 자격 증명 오류(409)는 서버가 '아이디 또는 비밀번호가 일치하지 않습니다.'를 내려준다.
      // 어느 쪽이 틀렸는지 구분해서 보여주지 않는다. (계정 존재 여부 노출 방지)
      setErrors({ form: getErrorMessage(error) })
    } finally {
      setSubmitting(false)
>>>>>>> Stashed changes
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.brand}>
        <img src={logo} alt="" className={styles.logo} />
        <h1 className={styles.serviceName}>todak-todag</h1>
        <p className={styles.tagline}>당신을 위한 맞춤형 케어 플랫폼</p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <Input
          label="아이디"
          name="username"
          value={form.username}
          onChange={handleChange}
          placeholder="아이디를 입력해 주세요"
          autoComplete="username"
<<<<<<< Updated upstream
=======
          autoCapitalize="none"
>>>>>>> Stashed changes
          error={errors.username}
        />

        <Input
          label="비밀번호"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="비밀번호를 입력해 주세요"
          autoComplete="current-password"
          error={errors.password}
        />

        <p className={styles.formError} role="alert">
          {errors.form}
        </p>

<<<<<<< Updated upstream
        <Button type="submit" className={styles.submit} loading={loading}>
=======
        <Button type="submit" className={styles.submit} loading={submitting}>
>>>>>>> Stashed changes
          로그인
        </Button>
      </form>

      <p className={styles.signup}>
        계정이 없으신가요?
        <Link to={PATHS.signup} className={styles.signupLink}>
          회원가입하기
        </Link>
      </p>

>>>>>>> Stashed changes
      <BottomBar />
    </div>
  )
}

export default LoginPage
