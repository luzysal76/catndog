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
    icon: '/catndog/icon.png',
    badge: '/catndog/icon.png',
    ...options,
  })
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
