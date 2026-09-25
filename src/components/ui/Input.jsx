import { useId, useState } from 'react'
import { EyeIcon, EyeOffIcon } from './Icons'
import styles from './Input.module.css'

/**
 * 공통 입력창 (라벨 + 인풋 + 안내/오류 문구)
 *
 * @param {string} label 인풋 위에 표시할 라벨
 * @param {string} type 인풋 타입. 'password'면 보기/숨기기 토글이 붙는다
 * @param {string} error 오류 문구 (있으면 빨간 테두리 + 빨간 문구)
 * @param {string} hint 안내 문구 (error가 있으면 error가 우선)
 * @param {boolean} required 라벨에 * 표시
 * @param {boolean} reserveMessage 문구가 없어도 아래 공간을 미리 확보 (오류 표시 시 레이아웃 흔들림 방지)
 */
function Input({
  label,
  type = 'text',
  error = '',
  hint = '',
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
  const message = error || hint
  const messageId = `${inputId}-message`

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
          type={isPassword && visible ? 'text' : type}
          className={inputClassNames}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={message ? messageId : undefined}
          {...rest}
        />

        {isPassword && (
          <button
            type="button"
            className={styles.addon}
            onClick={() => setVisible((prev) => !prev)}
            aria-label={visible ? '비밀번호 숨기기' : '비밀번호 보기'}
          >
            {visible ? (
              <EyeOffIcon className={styles.addonIcon} />
            ) : (
              <EyeIcon className={styles.addonIcon} />
            )}
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
