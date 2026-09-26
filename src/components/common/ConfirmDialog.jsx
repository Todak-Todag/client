import Button from '../ui/Button'
import styles from './ConfirmDialog.module.css'

/**
 * 되돌릴 수 없는 동작을 한 번 더 확인받는 모달
 *
 * @param {boolean} open 열림 여부
 * @param {string} title 모달 제목
 * @param {string} description 보조 설명
 * @param {string} confirmLabel 확인 버튼 문구
 * @param {boolean} danger 확인 버튼을 위험 동작 색으로 표시
 * @param {() => void} onConfirm 확인 클릭
 * @param {() => void} onClose 취소·배경 클릭
 */
function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = '확인',
  cancelLabel = '취소',
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

        <div className={styles.actions}>
          <Button variant="outline" size="md" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button
            size="md"
            className={danger ? styles.danger : ''}
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
