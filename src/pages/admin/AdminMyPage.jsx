import EmptyState from '../../components/common/EmptyState'
import { UserIcon } from '../../components/ui/Icons'

/* TODO: 관리자 마이페이지 구현 */
function AdminMyPage() {
  return (
    <EmptyState
      icon={UserIcon}
      title="준비 중이에요"
      description="마이페이지는 곧 추가될 예정이에요."
    />
  )
}

export default AdminMyPage
