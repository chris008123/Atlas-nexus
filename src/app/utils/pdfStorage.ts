const DB_NAME = "nexus_pdfs"
const STORE_NAME = "pdfs"
const DB_VERSION = 1

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME)
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function savePDFLocally(bookId: string, file: File): Promise<string> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite")
    tx.objectStore(STORE_NAME).put(file, bookId)
    tx.oncomplete = () => {
      // Return a local object URL
      const url = URL.createObjectURL(file)
      resolve(url)
    }
    tx.onerror = () => reject(tx.error)
  })
}

export async function getLocalPDF(bookId: string): Promise<string | null> {
  const db = await openDB()
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, "readonly")
    const req = tx.objectStore(STORE_NAME).get(bookId)
    req.onsuccess = () => {
      if (req.result) {
        resolve(URL.createObjectURL(req.result))
      } else {
        resolve(null)
      }
    }
    req.onerror = () => resolve(null)
  })
}

export async function deleteLocalPDF(bookId: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, "readwrite")
    tx.objectStore(STORE_NAME).delete(bookId)
    tx.oncomplete = () => resolve()
  })
}