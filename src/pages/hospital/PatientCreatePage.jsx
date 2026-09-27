import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import RegionSelectSheet from '../../features/auth/RegionSelectSheet'
import { formatRegion } from '../../features/auth/useRegions'
import {
  getMinScheduledDate,
  validatePatientForm,
} from '../../features/hospital/patientValidation'
import { usePatientCreate } from '../../features/hospital/usePatientCreate'
import { HOSPITAL_PATHS } from '../../constants/paths'
import styles from './PatientCreatePage.module.css'

const EMPTY_FORM = {
  username: '',
  password: '',
  passwordConfirm: '',
  name: '',
  phone: '',
  address: '',
  regionId: '',
  regionLabel: '',
  hospitalName: '',
  scheduledDate: '',
}

/*
 * 퇴원 예정자 등록
 *
 * 등록은 서버 호출 3번이 이어진다.
 *   POST /users/patient  → patientId
 *   POST /discharges      → dischargeId
 *   POST /care-plans      → carePlanId (권고 사항을 provideServiceIds로 담는다)
 *
 */
function PatientCreatePage() {
  const navigate = useNavigate()
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [regionOpen, setRegionOpen] = useState(false)
  const create = usePatientCreate()

  const handleChange = (event) => {
    const { name, value } = event.target
    // 전화번호는 숫자만 남기고 11자리까지만 받는다
    const nextValue =
      name === 'phone' ? value.replace(/\D/g, '').slice(0, 11) : value

    setForm((prev) => ({ ...prev, [name]: nextValue }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleSelectRegion = (region) => {
    setForm((prev) => ({
      ...prev,
      regionId: region ? region.regionId : '',
      regionLabel: region ? formatRegion(region) : '',
      // 지역 없이 주소만 보내면 서버가 거절한다 (USER_INVALID_CREATE_PATIENT_REGION)
      address: region ? prev.address : '',
    }))
    setErrors((prev) => ({ ...prev, address: '' }))
    setRegionOpen(false)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const nextErrors = validatePatientForm(form)
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    const done = await create.submit(form)
    if (!done) return

    navigate(HOSPITAL_PATHS.home, {
      replace: true,
      state: { notice: `${form.name} 님을 등록했어요` },
    })
  }

  return (
    <div className={styles.page}>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <Input
          label="아이디"
          name="username"
          value={form.username}
          onChange={handleChange}
          placeholder="환자가 사용할 아이디를 입력해주세요"
          autoComplete="off"
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
          label="환자명"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="환자의 실명을 입력해주세요"
          error={errors.name}
        />

        <Input
          label="전화번호"
          name="phone"
          type="tel"
          inputMode="numeric"
          value={form.phone}
          onChange={handleChange}
          placeholder="휴대폰 번호를 입력해주세요 (- 제외)"
          error={errors.phone}
        />

        <Input
          label="지역"
          name="regionLabel"
          value={form.regionLabel}
          placeholder="지역을 선택해주세요 (선택)"
          readOnly
          onClick={() => setRegionOpen(true)}
        />

        <Button
          type="button"
          variant="outline"
          size="md"
          className={styles.regionButton}
          onClick={() => setRegionOpen(true)}
        >
          지역 선택
        </Button>

        {/* 지역을 골랐을 때만 주소를 받는다 (서버는 지역이 있으면 주소를 요구한다) */}
        {form.regionId && (
          <Input
            label="주소"
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="상세 주소를 입력해주세요"
            error={errors.address}
            required
          />
        )}

        <Input
          label="병원명"
          name="hospitalName"
          value={form.hospitalName}
          onChange={handleChange}
          placeholder="퇴원하는 병원 이름을 입력해주세요"
          error={errors.hospitalName}
        />

        <Input
          label="퇴원예정일"
          name="scheduledDate"
          type="date"
          value={form.scheduledDate}
          onChange={handleChange}
          min={getMinScheduledDate()}
          error={errors.scheduledDate}
        />

        {create.error && (
          <p className={styles.formError} role="alert">
            {create.error}
          </p>
        )}

        <Button
          type="submit"
          className={styles.submit}
          loading={create.submitting}
        >
          등록하기
        </Button>
      </form>

      <RegionSelectSheet
        open={regionOpen}
        onClose={() => setRegionOpen(false)}
        selectedId={form.regionId}
        onSelect={handleSelectRegion}
        clearable
      />
    </div>
  )
}

export default PatientCreatePage
