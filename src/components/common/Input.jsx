import { useId, useState } from 'react'
import '../../styles/tokens.css'
import styles from './Input.module.css'

function EyeIcon({ off = false }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
      {off && <path d="M4 20 20 4" />}
    </svg>
  )
}

/**
 * 공통 입력창 (라벨 + 인풋 + 안내/에러 문구)
 *
 * @param {string} label 인풋 위에 표시할 라벨
 * @param {string} type 인풋 타입. 'password'면 보기/숨기기 토글이 붙는다
 * @param {string} error 에러 문구 (있으면 빨간 테두리 + 빨간 문구)
 * @param {string} helpText 안내 문구 (error가 있으면 error가 우선)
 * @param {boolean} required 라벨에 * 표시
 * @param {boolean} reserveMessage 문구가 없어도 아래 공간을 미리 확보 (레이아웃 흔들림 방지)
 */
function Input({
  label,
  type = 'text',
  error = '',
  helpText = '',
  required = false,
  reserveMessage = true,
  id,
  className = '',
  ...rest
}) {
  const autoId = useId()
  const inputId = id ?? autoId
  const [visible, setVisible] = useState(false)

  const isPassword = type === 'password'
  const inputType = isPassword && visible ? 'text' : type
  const message = error || helpText
  const messageId = message ? `${inputId}-message` : undefined

  const inputClassNames = [
    styles.input,
    isPassword ? styles.hasAddon : '',
    error ? styles.invalid : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={styles.field}>
      {label && (
        <label className={styles.label} htmlFor={inputId}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}

      <div className={styles.control}>
        <input
          id={inputId}
          type={inputType}
          className={inputClassNames}
          aria-invalid={error ? true : undefined}
          aria-describedby={messageId}
          required={required}
          {...rest}
        />

        {isPassword && (
          <button
            type="button"
            className={styles.addon}
            onClick={() => setVisible((prev) => !prev)}
            aria-label={visible ? '비밀번호 숨기기' : '비밀번호 보기'}
          >
            <EyeIcon off={!visible} />
          </button>
        )}
      </div>

      {(message || reserveMessage) && (
        <p
          id={messageId}
          className={[
            styles.message,
            error ? styles.errorMessage : '',
            reserveMessage ? styles.reserved : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {message}
        </p>
      )}
    </div>
  )
}

export default Input
