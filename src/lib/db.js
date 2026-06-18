import { openDB } from 'idb'

const DB_NAME = 'catndog-db'
const DB_VERSION = 1

// ── DB 초기화 ─────────────────────────────────────────────────
let dbPromise = null

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // 반려동물 스토어
        if (!db.objectStoreNames.contains('pets')) {
          const petStore = db.createObjectStore('pets', {
            keyPath: 'id',
            autoIncrement: true,
          })
          petStore.createIndex('name', 'name', { unique: false })
        }

        // 기록 스토어
        if (!db.objectStoreNames.contains('records')) {
          const recStore = db.createObjectStore('records', {
            keyPath: 'id',
            autoIncrement: true,
          })
          recStore.createIndex('petId',     'petId',     { unique: false })
          recStore.createIndex('type',      'type',      { unique: false })
          recStore.createIndex('timestamp', 'timestamp', { unique: false })
          recStore.createIndex('petId_date','petId_date',{ unique: false })
        }
      },
    })
  }
  return dbPromise
}

// ── Pet CRUD ─────────────────────────────────────────────────
export async function getAllPets() {
  const db = await getDB()
  return db.getAll('pets')
}

export async function addPet(pet) {
  const db = await getDB()
  return db.add('pets', { ...pet, createdAt: Date.now() })
}

export async function updatePet(pet) {
  const db = await getDB()
  return db.put('pets', pet)
}

export async function deletePet(id) {
  const db = await getDB()
  const tx = db.transaction(['pets', 'records'], 'readwrite')
  // 해당 펫의 기록도 함께 삭제
  const allRecords = await tx.objectStore('records').index('petId').getAll(id)
  for (const rec of allRecords) {
    await tx.objectStore('records').delete(rec.id)
  }
  await tx.objectStore('pets').delete(id)
  await tx.done
}

// ── Record CRUD ───────────────────────────────────────────────
export async function addRecord(record) {
  const db = await getDB()
  const now = Date.now()
  const dateStr = new Date(now).toISOString().slice(0, 10)
  return db.add('records', {
    ...record,
    timestamp: now,
    petId_date: `${record.petId}_${dateStr}`,
  })
}

export async function getRecordsByPet(petId) {
  const db = await getDB()
  return db.getAllFromIndex('records', 'petId', petId)
}

export async function getRecordsByPetAndDate(petId, dateStr) {
  const db = await getDB()
  return db.getAllFromIndex('records', 'petId_date', `${petId}_${dateStr}`)
}

export async function getRecordsByDateRange(petId, startMs, endMs) {
  const db = await getDB()
  const all = await db.getAllFromIndex('records', 'petId', petId)
  return all.filter(r => r.timestamp >= startMs && r.timestamp <= endMs)
}

export async function deleteRecord(id) {
  const db = await getDB()
  return db.delete('records', id)
}

export async function getAllRecords() {
  const db = await getDB()
  return db.getAll('records')
}
