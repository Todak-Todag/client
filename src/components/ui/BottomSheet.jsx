import { useEffect, useId } from 'react'
import { CloseIcon } from './Icons'
import styles from './BottomSheet.module.css'

/**
 * 아래에서 올라오는 시트
 *
 * @param {string} title 시트 제목
 * @param {string} description 제목 아래 보조 문구 (없으면 숨김)
 */
function BottomSheet({ open, onClose, title, description, children }) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event) => {
      if(event.key === 'Escape') onClose();
    }

    document.addEventListener('keydown', handleKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    }
  }, [open, onClose]);

  if(!open) return null;

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
      role="presentation"
    >
      <div
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.header}>
          <div className={styles.heading}>
            <h2 id={titleId} className={styles.title}>
              {title}
            </h2>
            {description && <p className={styles.description}>{description}</p>}
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="닫기"
          >
            <CloseIcon className={styles.closeIcon} />
          </button>
        </div>

        <div className={styles.body}>{children}</div>
      </div>
    </div>
  )
}

export default BottomSheet