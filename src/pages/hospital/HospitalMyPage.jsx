import EmptyState from '../../components/common/EmptyState'
import { ClockIcon } from '../../components/ui/Icons'

/* TODO: 병원 담당자 마이페이지 화면 구현 */
function HospitalMyPage() {
  return (
    <EmptyState
      icon={ClockIcon}
      title="준비 중이에요"
      description="마이페이지 화면은 곧 추가될 예정이에요."
    />
  )
}

export default HospitalMyPage
