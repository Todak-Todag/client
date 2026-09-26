import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useState } from 'react'
import { getErrorMessage } from '../../api/client'
import Button from '../../components/ui/Button'
import Header, { HeaderSpacer } from '../../components/layout/Header'
import BottomBar, { BottomBarSpacer } from '../../components/layout/BottomBar'
import {
  CheckIcon,
  ChevronRightIcon,
  InfoIcon
} from '../../components/ui/Icons'
import { getSignupType } from '../../features/auth/signupTypes'
import { useConsentDocuments } from '../../features/auth/useConsentDocuments'
import { PATHS } from '../../constants/paths'
import styles from './ConsentPage.module.css'

/**
 * <Navigate> vs navigate()
 * <Navigate to=... /> 는 `컴포넌트`이고 화면을 그리던 와중에 다른 곳으로 보내버린다
 * navigate(...) 는 `함수`이고 이벤트가 일어났을 때 다른 곳으로 보내버린다
 * 이 화면을 그릴 때 조건이 안 맞으면 다른 데로 보내버리는 동작
 * 
 * replace가 붙는 이유
 * 기본적인 이동은 `방문 기록을 쌓는다` 그런데 잘못된 주소를 남기면 이런 일이 생긴다
 * 
 * /signup -> /signup/consent?type=zzz (튕김) /signup
 *                                         ↑ 뒤로가기 누르면
 *                                       다시 잘못된 주소 -> 또 튕김 -> 무한 반복
 * 
 * replace는 `현재 기록을 덮어쓴다` 잘못된 주소가 기록에 남지 않아서
 * 뒤로가기가 정상적으로 동작하게 된다
 */
function ConsentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const documents = useConsentDocuments();
  const [checkedIds, setCheckedIds] = useState([]);
  const signupType = getSignupType(searchParams.get('type'));

  if (!signupType) return <Navigate to={PATHS.signup} replace />

  const docs = documents.data ?? [];
  const isChecked = (id) => checkedIds.includes(id);
  const isAllChecked = docs.length > 0 && checkedIds.length === docs.length;

  const canSubmit = docs
    .filter((doc) => doc.isRequired)
    .every((doc) => isChecked(doc.consentDocumentVersionId));

  const toggleOne = (id) => {
    setCheckedIds((prev) => prev.includes(id) ? prev.filter((it) => it !== id) : [...prev, id])
  }

  const toggleAll = () => {
    setCheckedIds(
      isAllChecked ? [] : docs.map((doc) => doc.consentDocumentVersionId)
    )
  }

  const renderCheckMark = (checked) => (
    <span
      className={[styles.checkMark, checked ? styles.checked : '']
        .filter(Boolean)
        .join(' ')}
    >
      <CheckIcon className={styles.checkIcon} />
    </span>
  )

  return (
    <div className={styles.page}>
      <Header
        title="약관 동의"
        logo={null}
        showBack
        onBack={() => navigate(-1)}
      />
      <HeaderSpacer />

      <h1 className={styles.title}>
        서비스 이용을 위해
        <br />
        약관에 동의해 주세요.
      </h1>
      <p className={styles.description}>
        필수 약관에 모두 동의하면 서비스를 시작할 수 있어요.
      </p>

      {documents.status === 'loading' && (
        <p className={styles.state}>약관을 불러오는 중이에요...</p>
      )}

      {documents.status === 'error' && (
        <p className={styles.state} role="alert">
          {getErrorMessage(documents.error)}
        </p>
      )}

      {documents.status === 'success' && (
        <div className={styles.card}>
          <div className={styles.row}>
              <button
                type="button"
                className={`${styles.checkButton} ${styles.checkAll}`}
                onClick={toggleAll}
                aria-pressed={isAllChecked}
              >
                {renderCheckMark(isAllChecked)}
                전체동의
              </button>
          </div>

          <hr className={styles.divider} />
          
          <ul className={styles.list}>
            {docs.map((doc) => {
              const id = doc.consentDocumentVersionId;
              const checked = isChecked(id);

              return (
                <li key={id} className={styles.row}>
                  <button
                    type="button"
                    className={styles.checkButton}
                    onClick={() => toggleOne(id)}
                    aria-pressed={checked}
                  >
                    {renderCheckMark(checked)}[
                    {doc.isRequired ? '필수' : '선택'}] {doc.title}
                  </button>

                  <button
                    type="button"
                    className={styles.viewButton}
                    onClick={() => {}}
                  >
                    보기
                    <ChevronRightIcon className={styles.viewIcon} />
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      <div className={styles.notice}>
        <InfoIcon className={styles.noticeIcon} />
        <p className={styles.noticeText}>
          선택 약관은 동의하지 않아도 가입할 수 있어요.
        </p>
      </div>

      <BottomBarSpacer />
      <BottomBar>
        <Button
          disabled={!canSubmit}
          onClick={() => {}}
        >
          동의하고 시작하기
        </Button>
      </BottomBar>
    </div>
  )
}

export default ConsentPage