import BottomSheet from './BottomSheet'
import Button from './Button'
import styles from './ConfirmSheet.module.css'

/**
 * 되돌리기 어려운 동작을 한 번 더 확인하는 시트
 *
 * @param {boolean} open 열림 여부
 * @param {string} title 상단 제목
 * @param {React.ReactNode} description 확인 문구
 * @param {string} confirmLabel 실행 버튼 문구
 * @param {'primary'|'outline'|'ghost'|'dashed'} confirmVariant 실행 버튼 스타일
 * @param {boolean} submitting 처리 중 (버튼 잠금 + 스피너)
 * @param {() => void} onClose 닫기
 * @param {() => void} onConfirm 실행
 */
function ConfirmSheet({
  open,
  title,
  description,
  confirmLabel = '확인',
  confirmVariant = 'primary',
  submitting = false,
  onClose,
  onConfirm,
}) {
  return (
    <BottomSheet open={open} onClose={onClose} title={title}>
      <div className={styles.body}>
        <p className={styles.description}>{description}</p>

        <div className={styles.actions}>
          <Button
            variant="outline"
            className={styles.action}
            disabled={submitting}
            onClick={onClose}
          >
            취소
          </Button>
          <Button
            variant={confirmVariant}
            className={styles.action}
            loading={submitting}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </BottomSheet>
  )
}

export default ConfirmSheet
