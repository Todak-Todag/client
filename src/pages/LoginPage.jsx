import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getErrorMessage } from '../api/client'
import { getMe, login } from '../api/endpoints/auth'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import BottomBar from '../components/layout/BottomBar'
import { PATHS } from '../constants/paths'
import { getHomePathByRole } from '../constants/roles'
import logo from '../assets/images/logo2.webp'
import styles from './LoginPage.module.css'

const EMPTY_FORM = { username: '', password: '' }

function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    // 고치기 시작하면 해당 항목 오류와 전체 오류를 함께 지운다
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

    setSubmitting(true)
    try {
      await login({ username: form.username.trim(), password: form.password })

      // 역할마다 첫 화면이 달라서 내 정보를 확인한 뒤 이동한다.
      // 내 정보 조회가 실패해도 로그인 자체는 성공이므로 기본 홈으로 보낸다.
      const me = await getMe().catch(() => null)
      navigate(getHomePathByRole(me?.role), { replace: true })
    } catch (error) {
      // 자격 증명 오류(409)는 서버가 '아이디 또는 비밀번호가 일치하지 않습니다.'를 내려준다.
      // 어느 쪽이 틀렸는지 구분해서 보여주지 않는다. (계정 존재 여부 노출 방지)
      setErrors({ form: getErrorMessage(error) })
    } finally {
      setSubmitting(false)
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
          autoCapitalize="none"
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

        <Button type="submit" className={styles.submit} loading={submitting}>
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
