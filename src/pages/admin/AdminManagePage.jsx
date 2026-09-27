import EmptyState from '../../components/common/EmptyState'
import { SettingsIcon } from '../../components/ui/Icons'

/* TODO: 관리 기능 구현 (지역·약관 문서 관리, 운영자 등록 등) */
function AdminManagePage() {
  return (
    <EmptyState
      icon={SettingsIcon}
      title="준비 중이에요"
      description="관리 기능은 곧 추가될 예정이에요."
    />
  )
}

export default AdminManagePage
