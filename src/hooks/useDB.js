import { useState, useCallback } from 'react'

/**
 * 비동기 DB 작업 래퍼 훅 — loading / error 상태를 자동 관리
 * 현재 페이지들은 자체 상태로 처리 중이나, 향후 DB 호출이 많은 컴포넌트에서 재사용 가능
 * tree-shaking으로 import하지 않으면 번들에 포함되지 않음
 */
export function useDB() {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const run = useCallback(async (fn) => {
    setLoading(true)
    setError(null)
    try {
      const result = await fn()
      return result
    } catch (e) {
      setError(e.message || '오류가 발생했습니다.')
      throw e
    } finally {
      setLoading(false)
    }
  }, [])

  return { loading, error, run }
}
