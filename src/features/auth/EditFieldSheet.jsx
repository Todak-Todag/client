import { useState } from 'react'
import { updateMe } from '../../api/endpoints/auth'
import BottomSheet from '../../components/ui/BottomSheet'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { getAccountErrorMessage } from './accountErrors'
import { NAME_PATTERN, PHONE_PATTERN } from '../../constants/validation'
import styles from './EditFieldSheet.module.css'

const FIELDS = {
  name: {
    title: '이름 수정',
    label: '이름',
    hint: '한글 또는 영문만 입력해 주세요.',
    invalid: '이름은 한글 또는 영문만 입력할 수 있어요.',
    pattern: NAME_PATTERN,
    inputProps: { autoComplete: 'name' },
  },
  phone: {
    title: '연락처 수정',
    label: '연락처',
    hint: '숫자만 입력해 주세요 (9~11자리)',
    invalid: "'-' 없이 숫자만 9~11자리로 입력해 주세요.",
    pattern: PHONE_PATTERN,
    inputProps: { type: 'tel', inputMode: 'numeric', autoComplete: 'tel' },
  },
}

/**
 * 내 정보 한 항목(이름 · 연락처) 수정 시트
 * PATCH /users/me는 보낸 필드만 바꾸므로 항목마다 따로 저장한다.
 * 서버 형식 검증 실패는 필드 문구 없이 INVALID_PARAMETER로만 와서, 같은 정규식으로 먼저 막는다.
 *
 * @param {'name'|'phone'} field 수정할 항목
 * @param {string} initialValue 현재 값
 * @param {(value: string) => void} onSaved 저장 성공. 서버가 돌려준 수정 후 값을 넘긴다
 * @param {() => void} onClose 시트 닫기
 */
function EditFieldSheet({ field, initialValue, onSaved, onClose }) {
  const config = FIELDS[field]
  const [value, setValue] = useState(initialValue)
  const [touched, setTouched] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')

  const trimmed = value.trim()
  // 형식 오류는 입력을 마친 뒤(blur)부터 보여준다
  const formatError = touched && trimmed && !config.pattern.test(trimmed) ? config.invalid : ''
  const canSave = trimmed !== '' && trimmed !== initialValue && config.pattern.test(trimmed)

  const submit = async (event) => {
    event.preventDefault()
    if (!canSave) {
      setTouched(true)
      return
    }

    setSubmitting(true)
    setServerError('')

    try {
      const updated = await updateMe({ [field]: trimmed })
      onSaved(updated?.[field] ?? trimmed)
    } catch (caught) {
      setServerError(getAccountErrorMessage(caught))
      setSubmitting(false)
    }
  }

  return (
    <BottomSheet open title={config.title} onClose={onClose}>
      <form className={styles.form} onSubmit={submit} noValidate>
        <Input
          label={config.label}
          // 수정 버튼을 눌러 연 시트라 바로 입력할 수 있게 한다
          autoFocus
          value={value}
          hint={config.hint}
          error={serverError || formatError}
          onChange={(event) => {
            setValue(event.target.value)
            setServerError('')
          }}
          onBlur={() => setTouched(true)}
          {...config.inputProps}
        />

        <Button type="submit" disabled={!canSave} loading={submitting}>
          저장하기
        </Button>
      </form>
    </BottomSheet>
  )
}

export default EditFieldSheet
