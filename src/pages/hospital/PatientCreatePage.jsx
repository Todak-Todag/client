import { useState } from 'react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import RegionSelectSheet from '../../features/auth/RegionSelectSheet'
import { formatRegion } from '../../features/auth/useRegions'
import {
  getMinScheduledDate,
  validatePatientForm,
} from '../../features/hospital/patientValidation'
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
 *   POST /users/patients  → patientId
 *   POST /discharges      → dischargeId
 *   POST /care-plans      → carePlanId (권고 사항을 provideServiceIds로 담는다)
 *
 * TODO: 권고 사항 목록(GET /provide-services), 등록 처리
 */
function PatientCreatePage() {
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [regionOpen, setRegionOpen] = useState(false)

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
      regionId: region.regionId,
      regionLabel: formatRegion(region),
    }))
    setErrors((prev) => ({ ...prev, address: '' }))
    setRegionOpen(false)
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const nextErrors = validatePatientForm(form)
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    // TODO: 등록 처리 (users/patients → discharges → care-plans)
    console.log(form)
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
          label="주소"
          name="address"
          value={form.address}
          onChange={handleChange}
          placeholder="상세 주소를 입력해주세요"
          hint="지역을 선택한 경우에만 필요해요"
          error={errors.address}
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

        {/* TODO: 권고 사항 체크박스 (GET /provide-services) */}

        <Button type="submit" className={styles.submit}>
          등록하기
        </Button>
      </form>

      <RegionSelectSheet
        open={regionOpen}
        onClose={() => setRegionOpen(false)}
        selectedId={form.regionId}
        onSelect={handleSelectRegion}
      />
    </div>
  )
}

export default PatientCreatePage
