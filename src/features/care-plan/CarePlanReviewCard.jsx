import Button from '../../components/ui/Button'
import { AlertIcon, CalendarIcon, ListIcon, PlusIcon } from '../../components/ui/Icons'
import styles from './CarePlanCard.module.css'

/**
 * 검토 중(UNDER_REVIEW) Care Plan 안내 카드 + 확정 전 주의 문구
 *
 * @param {string|null} period 케어 기간 (예: 8월 1일 (토) – 8월 30일 (일)). 없으면 줄을 숨김
 * @param {number|null} serviceCount 선택된 서비스 개수. 불러오지 못했으면 줄을 숨김
 * @param {number|null} unscheduledCount 희망 일정이 없는 서비스 개수. 0이거나 모르면 줄을 숨김
 * @param {() => void} onConfirm 케어플랜 확인 버튼 핸들러
 * @param {() => void} onAddService 서비스 추가 신청 핸들러 (서버가 UNDER_REVIEW에서만 추가를 허용)
 */
function CarePlanReviewCard({
  period,
  serviceCount,
  unscheduledCount = null,
  onConfirm,
  onAddService,
}) {
  const hasFacts = period || serviceCount !== null

  return (
    <div className={styles.group}>
      <section className={`${styles.card} ${styles.accent}`} aria-labelledby="care-plan-review-title">
        <h2 id="care-plan-review-title" className={styles.title}>
          병원에서 제안한 케어플랜이 도착했어요
        </h2>
        <p className={styles.description}>서비스와 희망 일정을 확인하고 확정해 주세요.</p>

        {hasFacts && (
          <ul className={styles.facts}>
            {period && (
              <li className={styles.fact}>
                <CalendarIcon className={styles.factIcon} />
                <span>케어 기간 {period}</span>
              </li>
            )}
            {serviceCount !== null && (
              <li className={styles.fact}>
                <ListIcon className={styles.factIcon} />
                <span>선택된 서비스 {serviceCount}개</span>
              </li>
            )}
            {/* 확정하면 이 서비스들은 매칭되지 않으므로 미리 알린다 (색 + 아이콘 + 문구) */}
            {unscheduledCount > 0 && (
              <li className={`${styles.fact} ${styles.factWarning}`}>
                <AlertIcon className={styles.factIcon} />
                <span>희망 일정이 없는 서비스 {unscheduledCount}개</span>
              </li>
            )}
          </ul>
        )}

        <Button className={styles.action} onClick={onConfirm}>
          케어플랜 확인하기
        </Button>
      </section>

      <Button variant="dashed" size="md" onClick={onAddService}>
        <PlusIcon className={styles.plusIcon} />
        서비스 추가 신청하기
      </Button>

      <p className={styles.note}>
        <AlertIcon className={styles.noteIcon} />
        <span>
          확정 전까지는 서비스와 희망 일정을 바꿀 수 있어요. 확정하면 변경할 수 없고 서비스 제공자
          매칭이 시작돼요.
        </span>
      </p>
    </div>
  )
}

export default CarePlanReviewCard
