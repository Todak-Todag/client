import { useNavigate, useSearchParams } from 'react-router-dom'
import Header, { HeaderSpacer } from '../../components/layout/Header'

function ConsentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type');

  return (
    <div>
      <Header
        title="개인정보 처리 동의"
        logo={null}
        showBack
        onBack={() => navigate(-1)}
      />
      <HeaderSpacer />

      <p>선택한 가입 유형: {type}</p>
    </div>
  )
}

export default ConsentPage