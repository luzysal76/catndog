import { useState, useEffect, useCallback } from 'react'
import { getAllPets, addPet, updatePet, deletePet } from '../lib/db.js'

/**
 * 반려동물 CRUD 훅
 */
export function usePets() {
  const [pets, setPets]     = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getAllPets()
      setPets(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const add = useCallback(async (pet) => {
    const id = await addPet(pet)
    await load()
    return id
  }, [load])

  const update = useCallback(async (pet) => {
    await updatePet(pet)
    await load()
  }, [load])

  const remove = useCallback(async (id) => {
    await deletePet(id)
    await load()
  }, [load])

  return { pets, loading, error, reload: load, add, update, remove }
}
