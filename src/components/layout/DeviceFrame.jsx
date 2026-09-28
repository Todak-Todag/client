import styles from './DeviceFrame.module.css'

/**
 * 넓은 화면에서 앱을 배경 이미지 위 휴대폰 프레임 안에 띄운다.
 * 좁은 화면에서는 아무 스타일 없이 앱 화면만 그대로 보인다.
 */
function DeviceFrame({ children }) {
  return (
    <div className={styles.stage}>
      <div className={styles.device}>
        <div className={styles.screen}>{children}</div>
      </div>
    </div>
  )
}

export default DeviceFrame
