import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getErrorMessage } from '../../api/client'
import { logout } from '../../api/endpoints/auth'
import EmptyState from '../../components/common/EmptyState'
import Button from '../../components/ui/Button'
import { AlertIcon, ChevronRightIcon, DocumentIcon, LockIcon } from '../../components/ui/Icons'
import EditFieldSheet from '../../features/auth/EditFieldSheet'
import ProfileCard, { ProfileCardSkeleton } from '../../features/auth/ProfileCard'
import { useAuth } from '../../features/auth/useAuth'
import { PATHS } from '../../constants/paths'
import layout from './CarePlanPage.module.css'
import styles from './MyPage.module.css'

const MENUS = [
  { to: PATHS.myResults, label: '서비스 수행 결과', icon: DocumentIcon },
  { to: PATHS.myPassword, label: '비밀번호 변경', icon: LockIcon },
]

/** 마이페이지 — 내 정보 확인·수정, 수행 결과, 계정 관리 */
function MyPage() {
  const navigate = useNavigate()
  const me = useAuth()
  const [editing, setEditing] = useState(null) // 'name' | 'phone'
  // 저장한 값을 바로 보여준다. 내 정보를 다시 조회하면 화면 전체가 로딩으로 깜빡이기 때문
  const [saved, setSaved] = useState({})
  const [signingOut, setSigningOut] = useState(false)

  // 로그아웃이 실패해도(이미 만료된 세션 등) 로그인 화면으로 보낸다
  const signOut = async () => {
    setSigningOut(true)
    await logout().catch(() => {})
    navigate(PATHS.login, { replace: true })
  }

  if (me.status === 'loading') {
    return (
      <div className={styles.page} aria-busy="true">
        <ProfileCardSkeleton />
        <div className={`${styles.group} ${styles.skeletonGroup}`} aria-hidden="true">
          {Array.from({ length: 3 }, (_, index) => (
            <span key={index} className={styles.skeletonRow} />
          ))}
        </div>
        <p className={layout.srOnly} role="status">
          내 정보를 불러오는 중이에요
        </p>
      </div>
    )
  }

  if (me.status === 'error') {
    return (
      <EmptyState
        icon={AlertIcon}
        tone="error"
        title="내 정보를 불러오지 못했어요"
        description={getErrorMessage(me.error)}
        action={
          <Button variant="secondary" size="md" block={false} onClick={me.reload}>
            다시 불러오기
          </Button>
        }
      />
    )
  }

  const { name, phone, province, district } = { ...me.data, ...saved }
  const region = [province, district].filter(Boolean).join(' ') || '-'

  const infoRows = [
    { key: 'name', label: '이름', value: name || '-', editable: true },
    { key: 'phone', label: '연락처', value: phone || '-', editable: true },
    { key: 'region', label: '지역', value: region, editable: false },
  ]

  return (
    <div className={styles.page}>
      <ProfileCard name={name} />

      <section className={layout.section} aria-labelledby="my-info-title">
        <h2 id="my-info-title" className={layout.sectionTitle}>
          내 정보
        </h2>

        <dl className={styles.group}>
          {infoRows.map((row) => (
            <div key={row.key} className={styles.infoRow}>
              <dt className={styles.infoLabel}>{row.label}</dt>
              <dd className={styles.infoValue}>{row.value}</dd>
              {row.editable && (
                <button
                  type="button"
                  className={`${layout.textButton} ${layout.textButtonPrimary} ${styles.editButton}`}
                  onClick={() => setEditing(row.key)}
                  aria-label={`${row.label} 수정`}
                >
                  수정
                </button>
              )}
            </div>
          ))}
        </dl>
      </section>

      <nav aria-label="내 계정 메뉴">
        <ul className={styles.group}>
          {MENUS.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <Link to={to} className={styles.menuRow}>
                <Icon className={styles.menuIcon} />
                <span className={styles.menuLabel}>{label}</span>
                <ChevronRightIcon className={styles.chevron} />
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className={styles.account}>
        <Button size="sm" variant="ghost" block={false} loading={signingOut} onClick={signOut}>
          로그아웃
        </Button>
        <span className={styles.accountDivider} aria-hidden="true" />
        <Button
          size="sm"
          variant="ghost"
          block={false}
          disabled={signingOut}
          onClick={() => navigate(PATHS.myWithdraw)}
        >
          탈퇴하기
        </Button>
      </div>

      {editing && (
        <EditFieldSheet
          field={editing}
          initialValue={(editing === 'name' ? name : phone) ?? ''}
          onSaved={(value) => {
            setSaved((prev) => ({ ...prev, [editing]: value }))
            setEditing(null)
          }}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}

export default MyPage
