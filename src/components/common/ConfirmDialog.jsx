import Button from '../ui/Button'
import styles from './ConfirmDialog.module.css'

/**
 * 되돌릴 수 없는 동작을 한 번 더 확인받는 모달
 *
 * @param {boolean} open 열림 여부
 * @param {string} title 모달 제목
 * @param {string} description 보조 설명
 * @param {React.ReactNode} children 설명과 버튼 사이에 넣을 요소 (비밀번호 확인 입력 등)
 * @param {string} confirmLabel 확인 버튼 문구
 * @param {boolean} confirmDisabled 확인 버튼 비활성화 (입력이 덜 찼을 때)
 * @param {boolean} loading 확인 버튼 로딩 상태
 * @param {boolean} danger 확인 버튼을 위험 동작 색으로 표시
 * @param {() => void} onConfirm 확인 클릭
 * @param {() => void} onClose 취소·배경 클릭
 */
function ConfirmDialog({
  open,
  title,
  description,
  children,
  confirmLabel = '확인',
  cancelLabel = '취소',
  confirmDisabled = false,
  loading = false,
  danger = false,
  onConfirm,
  onClose,
}) {
  if (!open) return null

  return (
    <div className={styles.dim} role="presentation" onClick={onClose}>
      <div
        className={styles.dialog}
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className={styles.title}>{title}</h2>
        {description && <p className={styles.description}>{description}</p>}
        {children}

        <div className={styles.actions}>
          <Button variant="outline" size="md" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button
            size="md"
            className={danger ? styles.danger : ''}
            disabled={confirmDisabled}
            loading={loading}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
