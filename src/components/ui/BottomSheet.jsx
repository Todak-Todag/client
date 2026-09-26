import { useEffect, useId } from 'react'
import { CloseIcon } from './Icons'
import styles from './BottomSheet.module.css'

function BottomSheet({ open, onClose, title, children }) {
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
      document.body.style.overflow = 'hidden';
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
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
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