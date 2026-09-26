import EmptyState from '../../components/common/EmptyState'
import { MatchingIcon } from '../../components/ui/Icons'

/**
 * 서비스 제공자 매칭 화면
 *
 * 매칭 조회 API(GET /matching-attempts)는 퇴원 예정자 전용이라
 * 제공자에게 보여줄 매칭 데이터가 아직 없다. 서버에 제공자용 조회가 생기면 채운다.
 */
function MatchingPage() {
  return (
    <EmptyState
      icon={MatchingIcon}
      title="매칭 내역은 준비 중이에요"
      description="배정된 일정은 홈과 일정 탭에서 확인할 수 있어요."
    />
  )
}

export default MatchingPage
