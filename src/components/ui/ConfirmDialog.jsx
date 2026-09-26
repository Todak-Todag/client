import { useEffect, useId, useRef } from 'react'
import Button from './Button'
import styles from './ConfirmDialog.module.css'

/**
 * 되돌릴 수 없는 동작(확정·삭제) 전에 한 번 더 묻는 가운데 모달.
 * 네이티브 <dialog>라 포커스 가두기·ESC 닫기·뒤 화면 비활성화를 브라우저가 처리한다.
 *
 * @param {boolean} open 열림 여부
 * @param {string} title 질문 (예: 케어플랜을 확정할까요?)
 * @param {React.ReactNode} description 결과 설명
 * @param {React.ReactNode} children 설명 아래 추가 안내 (경고 상자 등)
 * @param {string} confirmLabel 확인 버튼 문구 (동작을 나타내는 동사)
 * @param {string} cancelLabel 취소 버튼 문구
 * @param {'primary'|'danger'} tone 확인 버튼 색
 * @param {boolean} loading 확인 처리 중 (이때는 닫히지 않음)
 * @param {string|null} error 처리 실패 문구
 * @param {() => void} onConfirm
 * @param {() => void} onCancel ESC·바깥 누름·취소 버튼
 */
function ConfirmDialog({
  open,
  title,
  description,
  children,
  confirmLabel,
  cancelLabel = '취소',
  tone = 'primary',
  loading = false,
  error = null,
  onConfirm,
  onCancel,
}) {
  const dialogRef = useRef(null)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  // 모달이 떠 있는 동안 뒤 화면이 스크롤되지 않도록 (BottomSheet와 같은 방식)
  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  const cancel = () => {
    if (!loading) onCancel()
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      // ESC: 브라우저가 바로 닫지 않게 막고 상태로만 닫는다 (처리 중에는 무시)
      onCancel={(event) => {
        event.preventDefault()
        cancel()
      }}
      // 바깥(::backdrop) 누름은 dialog 자신이 target으로 들어온다
      onClick={(event) => {
        if (event.target === event.currentTarget) cancel()
      }}
    >
      <div className={styles.panel}>
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
        {description && (
          <p id={descriptionId} className={styles.description}>
            {description}
          </p>
        )}

        {children}

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        <div className={styles.actions}>
          {/* 되돌릴 수 없는 동작이라 첫 포커스는 취소에 둔다 */}
          <Button variant="secondary" size="md" onClick={cancel} disabled={loading} autoFocus>
            {cancelLabel}
          </Button>
          <Button variant={tone} size="md" onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  )
}

export default ConfirmDialog
