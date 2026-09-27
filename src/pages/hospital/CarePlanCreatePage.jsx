import { useId, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { getErrorMessage } from '../../api/client'
import Button from '../../components/ui/Button'
import { useProvideServices } from '../../features/hospital/useProvideServices'
import { HOSPITAL_PATHS } from '../../constants/paths'
import styles from './CarePlanCreatePage.module.css'

/*
 * Care Plan 생성
 *
 * 홈 카드의 '작성하기'에서 patientId와 dischargeId를 받아 온다.
 * 퇴원이 완료된 건에서만 들어올 수 있다 (서버가 그때만 생성을 허용한다)
 *
 * TODO: 생성 처리 (POST /care-plans)
 */
function CarePlanCreatePage() {
  const labelId = useId()
  const { state } = useLocation()
  const services = useProvideServices()
  const [serviceIds, setServiceIds] = useState([])

  const patientId = state?.patientId
  const dischargeId = state?.dischargeId

  // 홈을 거치지 않고 직접 들어온 경우
  if (!patientId || !dischargeId) {
    return <Navigate to={HOSPITAL_PATHS.home} replace />
  }

  const toggleService = (provideServiceId) => {
    setServiceIds((prev) =>
      prev.includes(provideServiceId)
        ? prev.filter((id) => id !== provideServiceId)
        : [...prev, provideServiceId],
    )
  }

  const renderServices = () => {
    if (services.status === 'loading') {
      return (
        <p className={styles.state} role="status">
          서비스 목록을 불러오는 중이에요…
        </p>
      )
    }

    if (services.status === 'error') {
      return (
        <p className={styles.state} role="alert">
          {getErrorMessage(services.error)}
        </p>
      )
    }

    if (services.data.length === 0) {
      return <p className={styles.state}>권고할 수 있는 서비스가 없어요.</p>
    }

    return (
      <ul className={styles.list}>
        {services.data.map((service) => {
          const checked = serviceIds.includes(service.provideServiceId)

          return (
            <li key={service.provideServiceId}>
              <label
                className={[styles.row, checked ? styles.rowChecked : '']
                  .filter(Boolean)
                  .join(' ')}
              >
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={checked}
                  onChange={() => toggleService(service.provideServiceId)}
                />
                {service.provideServiceName}
              </label>
            </li>
          )
        })}
      </ul>
    )
  }

  return (
    <div className={styles.page}>
      <h2 className={styles.title}>환자에게 권고할 서비스를 선택하세요</h2>

      <div className={styles.field}>
        <span id={labelId} className={styles.label}>
          권고할 서비스 선택
        </span>

        <div className={styles.card} role="group" aria-labelledby={labelId}>
          {renderServices()}
        </div>
      </div>

      {/* TODO: 생성 처리 연결 */}
      <Button onClick={() => {}}>생성하기</Button>
    </div>
  )
}

export default CarePlanCreatePage
