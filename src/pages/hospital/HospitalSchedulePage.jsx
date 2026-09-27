import EmptyState from '../../components/common/EmptyState'
import { ClockIcon } from '../../components/ui/Icons'

/* TODO: 병원 담당자 일정 화면 구현 */
function HospitalSchedulePage() {
  return (
    <EmptyState
      icon={ClockIcon}
      title="준비 중이에요"
      description="일정 화면은 곧 추가될 예정이에요."
    />
  )
}

export default HospitalSchedulePage
