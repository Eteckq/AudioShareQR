import fs from 'fs'
import path from 'path'

const DB_FILE = path.join(process.cwd(), 'data', 'files.json')
const DATA_DIR = path.join(process.cwd(), 'data')

// Créer le dossier data s'il n'existe pas
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

// Initialiser le fichier JSON s'il n'existe pas
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify([]))
}

export function getAllFiles() {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Erreur lors de la lecture de la base de données:', error)
    return []
  }
}

export function getFileById(id) {
  const files = getAllFiles()
  return files.find(file => file.id === id)
}

export function saveFile(fileData) {
  try {
    const files = getAllFiles()
    const newFile = {
      id: generateId(),
      ...fileData,
      createdAt: new Date().toISOString()
    }
    files.push(newFile)
    fs.writeFileSync(DB_FILE, JSON.stringify(files, null, 2))
    return newFile
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error)
    throw error
  }
}

function generateId() {
  return Math.random().toString(36).substr(2, 9)
}
