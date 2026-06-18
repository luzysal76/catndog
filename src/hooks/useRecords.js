import { useState, useCallback } from 'react'
import {
  addRecord,
  getRecordsByPet,
  getRecordsByDateRange,
  getRecordsByPetAndDate,
  deleteRecord,
} from '../lib/db.js'

/**
 * 기록 CRUD 훅
 */
export function useRecords(petId) {
  const [records, setRecords]   = useState([])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)

  const loadAll = useCallback(async () => {
    if (!petId) return
    setLoading(true)
    try {
      const data = await getRecordsByPet(petId)
      setRecords(data.sort((a, b) => b.timestamp - a.timestamp))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [petId])

  const loadByDate = useCallback(async (dateStr) => {
    if (!petId) return []
    return getRecordsByPetAndDate(petId, dateStr)
  }, [petId])

  const loadByRange = useCallback(async (startMs, endMs) => {
    if (!petId) return []
    return getRecordsByDateRange(petId, startMs, endMs)
  }, [petId])

  const add = useCallback(async (record) => {
    const id = await addRecord({ ...record, petId })
    await loadAll()
    return id
  }, [petId, loadAll])

  const remove = useCallback(async (id) => {
    await deleteRecord(id)
    await loadAll()
  }, [loadAll])

  return {
    records,
    loading,
    error,
    loadAll,
    loadByDate,
    loadByRange,
    add,
    remove,
  }
}
