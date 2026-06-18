/**
 * 브라우저 알림 관련 유틸리티
 */

/** 알림 권한 요청 */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    return 'unsupported'
  }
  if (Notification.permission === 'granted') return 'granted'
  if (Notification.permission === 'denied') return 'denied'

  const result = await Notification.requestPermission()
  return result
}

/** 알림 전송 */
export function sendNotification(title, body, options = {}) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return null
  }
  return new Notification(title, {
    body,
    icon: '/catndog/favicon.svg',
    badge: '/catndog/favicon.svg',
    ...options,
  })
}

/**
 * 패턴 기반 알림 스케줄링
 * 마지막 기록 시간으로부터 intervalHours 후 알림
 * @param {string} petName
 * @param {string} type - 'poop' | 'pee'
 * @param {number} lastTimestamp - ms
 * @param {number} intervalHours
 */
export function schedulePatternAlert(petName, type, lastTimestamp, intervalHours = 8) {
  const label = type === 'poop' ? '대변' : '소변'
  const delayMs = intervalHours * 60 * 60 * 1000
  const now = Date.now()
  const target = lastTimestamp + delayMs

  if (target <= now) {
    // 이미 지난 시간 — 즉시 알림
    sendNotification(
      `${petName} 알림 🐾`,
      `${petName}의 ${label} 기록 시간이 지났어요. 확인해보세요!`
    )
    return null
  }

  const timeout = setTimeout(() => {
    sendNotification(
      `${petName} 알림 🐾`,
      `${petName}의 ${label} 기록 시간이에요!`
    )
  }, target - now)

  return timeout
}

/** 일일 배변 횟수 이상 감지 알림 */
export function checkDailyAnomaly(petName, type, count, normalRange) {
  const label = type === 'poop' ? '대변' : '소변'
  const [min, max] = normalRange

  if (count > max) {
    sendNotification(
      `⚠️ ${petName} 건강 알림`,
      `오늘 ${label}이 ${count}회로 평소보다 많아요. 확인해보세요.`
    )
  } else if (count < min && count >= 0) {
    sendNotification(
      `⚠️ ${petName} 건강 알림`,
      `오늘 ${label}이 ${count}회로 평소보다 적어요.`
    )
  }
}
