import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
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

    setLoading(true)
    try {
      await login({ username: form.username.trim(), password: form.password })
      navigate(PATHS.home, { replace: true })
    } catch (error) {
      setErrors({
        form:
          error.status === 401 || error.status === 400
            ? '아이디 또는 비밀번호를 확인해 주세요.'
            : error.message,
      })
    } finally {
      setLoading(false)
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

        <Button type="submit" className={styles.submit} loading={loading}>
          로그인
        </Button>
      </form>

      <p className={styles.signup}>
        계정이 없으신가요?
        <Link to={PATHS.signup} className={styles.signupLink}>
          회원가입하기
        </Link>
      </p>

      <BottomBar />
    </div>
  )
}

export default LoginPage
