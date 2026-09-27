import { getErrorMessage } from '../../api/client'
import BottomSheet from '../../components/ui/BottomSheet'
import { useRegions } from './useRegions'
import styles from './RegionSelectSheet.module.css'

function groupByProvince(regions) {
  const groups = {}

  regions.forEach((region) => {
    if (!groups[region.province]) groups[region.province] = []
    groups[region.province].push(region)
  })

  return Object.entries(groups)
}

/**
 * 서비스 가능 지역 선택 시트
 *
 * @param {boolean} open 열림 여부
 * @param {() => void} onClose 닫기
 * @param {string} selectedId 현재 선택된 regionId
 * @param {(region: object|null) => void} onSelect 지역을 고르면 호출. 해제하면 null
 * @param {boolean} clearable 지역이 선택 사항인 화면에서 '선택 안 함'을 함께 보여준다
 */
function RegionSelectSheet({
  open,
  onClose,
  selectedId,
  onSelect,
  clearable = false,
}) {
  const regions = useRegions()
  const grouped = groupByProvince(regions.data ?? [])

  return (
    <BottomSheet open={open} onClose={onClose} title="지역 선택">
      {regions.status === 'loading' && (
        <p className={styles.state}>지역 목록을 불러오는 중이에요…</p>
      )}

      {regions.status === 'error' && (
        <p className={styles.state} role="alert">
          {getErrorMessage(regions.error)}
        </p>
      )}

      {regions.status === 'success' && grouped.length === 0 && (
        <p className={styles.state}>선택할 수 있는 지역이 없어요.</p>
      )}

      {clearable && regions.status === 'success' && (
        <ul className={styles.list}>
          <li>
            <button
              type="button"
              className={[styles.item, selectedId ? '' : styles.selected]
                .filter(Boolean)
                .join(' ')}
              aria-pressed={!selectedId}
              onClick={() => onSelect(null)}
            >
              선택 안 함
            </button>
          </li>
        </ul>
      )}

      {grouped.map(([province, list]) => (
        <section key={province} className={styles.group}>
          <h3 className={styles.groupTitle}>{province}</h3>

          <ul className={styles.list}>
            {list.map((region) => {
              const selected = region.regionId === selectedId

              return (
                <li key={region.regionId}>
                  <button
                    type="button"
                    className={[styles.item, selected ? styles.selected : '']
                      .filter(Boolean)
                      .join(' ')}
                    aria-pressed={selected}
                    onClick={() => onSelect(region)}
                  >
                    {region.district}
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </BottomSheet>
  )
}

export default RegionSelectSheet