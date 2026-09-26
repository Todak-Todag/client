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

function RegionSelectSheet({ open, onClose, selectedId, onSelect }) {
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