import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useState } from 'react'
import { getErrorMessage } from '../../api/client'
import Header, { HeaderSpacer } from '../../components/layout/Header'
import { getSignupType } from '../../features/auth/signupTypes'
import { useConsentDocuments } from '../../features/auth/useConsentDocuments'
import { PATHS } from '../../constants/paths'
import { ChevronDownIcon, ChevronUpIcon } from '../../components/ui/Icons'
import { getConsentDocument } from '../../api/endpoints/consent'

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
  const signupType = getSignupType(searchParams.get('type'));
  const [openId, setOpenId] = useState(null);
  const [contents, setContents] = useState({});

  if(!signupType) return <Navigate to={PATHS.signup} replace />

  const toggle = async (id) => {
    const nextOpenId = openId === id ? null : id;
    setOpenId(nextOpenId);

    if(nextOpenId === null || contents[id]) return;

    setContents((prev) => ({...prev, [id]: { status: 'loading' }}));

    try {
      const data = await getConsentDocument(id);
      setContents((prev) => ({
        ...prev,
        [id]: { status: 'success', text: data.content },
      }));
    } catch (error) {
      setContents((prev) => ({ ...prev, [id]: { status: 'error', error } }));
    }
  }

  return (
    <div>
      <Header
        title="개인정보 처리 동의"
        logo={null}
        showBack
        onBack={() => navigate(-1)}
      />
      <HeaderSpacer />

        <p>선택한 가입 유형: {signupType.title}</p>

        {documents.status === 'loading' && <p>동의서를 불러오는 중이에요...</p>}

        {documents.status === 'error' && (
          <p role="alert">{getErrorMessage(documents.error)}</p>
        )}

        {documents.status === 'success' && (
          <ul>
                        {documents.data.map((doc) => {
              const id = doc.consentDocumentVersionId
              const isOpen = openId === id
              const content = contents[id]

              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => toggle(id)}
                    aria-expanded={isOpen}
                  >
                    [{doc.isRequired ? '필수' : '선택'}] {doc.title}
                    {isOpen ? (
                      <ChevronUpIcon width={20} height={20} />
                    ) : (
                      <ChevronDownIcon width={20} height={20} />
                    )}
                  </button>

                  {isOpen && (
                    <div>
                      {content?.status === 'loading' && <p>불러오는 중이에요…</p>}

                      {content?.status === 'error' && (
                        <p role="alert">{getErrorMessage(content.error)}</p>
                      )}

                      {content?.status === 'success' && <p>{content.text}</p>}
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}

    </div>
  )
}

export default ConsentPage