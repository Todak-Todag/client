import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Header, { HeaderSpacer } from '../../components/layout/Header'
import BottomBar, { BottomBarSpacer } from '../../components/layout/BottomBar'
import { getSignupType } from '../../features/auth/signupTypes'
import { PATHS } from '../../constants/paths'
import styles from './SignupFormPage.module.css'
import { validateSignupForm } from '../../features/auth/signupValidation'

const EMPTY_FORM = {
  username: '',
  password: '',
  passwordConfirm: '',
  phone: '',
  name: ''
}

function SignupFormPage() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const signupType = getSignupType(state?.type)
  const agreements = state?.agreements

  // 약관 동의를 거치지 않고 직접 들어온 경우
  if (!signupType || !agreements) {
    return <Navigate to={PATHS.signup} replace />
  }

  const handleChange = (event) => {
    const {name, value} = event.target;

    const nextValue = name === 'phone' ? value.replace(/\D/g, '').slice(0, 11) : value;

    setForm((prev) => ({...prev, [name]: nextValue}));
    setErrors((prev) => ({...prev, [name]: ''}));
  }

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextErrors = validateSignupForm(form);
    if(Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    console.log({ type: signupType.role, ...form, agreements });
  }

  return (
    <div className={styles.page}>
      <Header
        title="회원가입"
        logo={null}
        showBack
        onBack={() => navigate(-1)}
      />
      <HeaderSpacer />

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <Input
          label="아이디"
          name="username"
          value={form.username}
          onChange={handleChange}
          placeholder="6자 이상 영문/소문자로 시작"
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
          placeholder="8자 이상 (영문, 숫자, 특수문자 포함)"
          autoComplete="new-password"
          error={errors.password}
        />

        <Input
          label="비밀번호 확인"
          name="passwordConfirm"
          type="password"
          value={form.passwordConfirm}
          onChange={handleChange}
          placeholder="비밀번호를 한번 더 입력해주세요"
          autoComplete="new-password"
          error={errors.passwordConfirm}
        />

        <Input
          label="전화번호"
          name="phone"
          type="tel"
          inputMode="numeric"
          value={form.phone}
          onChange={handleChange}
          placeholder="휴대폰 번호를 입력해주세요 (- 제외)"
          autoComplete="tel"
          error={errors.phone}
        />

        <Input
          label="성명"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="본인의 실명을 입력해주세요"
          autoComplete="name"
          error={errors.name}
        />

        <div className={styles.submitArea}>
          <Button type="submit">회원가입 완료</Button>
        </div>
      </form>

      <BottomBarSpacer />
      <BottomBar />
    </div>
  )
}

export default SignupFormPage