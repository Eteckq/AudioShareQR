import fs from 'fs'
import path from 'path'

// Fonction pour obtenir le chemin de base selon l'environnement
function getBasePathInternal() {
  // const isDev = process.env.DEV === 'true'
  
  return process.cwd()
}

const BASE_PATH = getBasePathInternal()
const DB_FILE = path.join(BASE_PATH, 'data', 'files.json')
const PLAYLISTS_FILE = path.join(BASE_PATH, 'data', 'playlists.json')
const DATA_DIR = path.join(BASE_PATH, 'data')
const FILES_DIR = path.join(BASE_PATH, 'files')

// Fonction pour obtenir le chemin du dossier files
export function getFilesDir() {
  return FILES_DIR
}

// Fonction pour obtenir le chemin de base
export function getBasePath() {
  return BASE_PATH
}

// Créer le dossier data s'il n'existe pas
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

// Initialiser les fichiers JSON s'ils n'existent pas
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify([]))
}

if (!fs.existsSync(PLAYLISTS_FILE)) {
  fs.writeFileSync(PLAYLISTS_FILE, JSON.stringify([]))
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

// Fonctions pour les playlists
export function getAllPlaylists() {
  try {
    const data = fs.readFileSync(PLAYLISTS_FILE, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Erreur lors de la lecture des playlists:', error)
    return []
  }
}

export function getPlaylistById(id) {
  const playlists = getAllPlaylists()
  return playlists.find(playlist => playlist.id === id)
}

export function savePlaylist(playlistData) {
  try {
    const playlists = getAllPlaylists()
    const newPlaylist = {
      id: generateId(),
      ...playlistData,
      createdAt: new Date().toISOString()
    }
    playlists.push(newPlaylist)
    fs.writeFileSync(PLAYLISTS_FILE, JSON.stringify(playlists, null, 2))
    return newPlaylist
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la playlist:', error)
    throw error
  }
}

export function updatePlaylist(id, playlistData) {
  try {
    const playlists = getAllPlaylists()
    const playlistIndex = playlists.findIndex(playlist => playlist.id === id)
    
    if (playlistIndex === -1) {
      return false
    }
    
    playlists[playlistIndex] = {
      ...playlists[playlistIndex],
      ...playlistData,
      updatedAt: new Date().toISOString()
    }
    fs.writeFileSync(PLAYLISTS_FILE, JSON.stringify(playlists, null, 2))
    return playlists[playlistIndex]
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la playlist:', error)
    return false
  }
}

export function deletePlaylistById(id) {
  try {
    const playlists = getAllPlaylists()
    const playlistIndex = playlists.findIndex(playlist => playlist.id === id)
    
    if (playlistIndex === -1) {
      return false
    }
    
    playlists.splice(playlistIndex, 1)
    fs.writeFileSync(PLAYLISTS_FILE, JSON.stringify(playlists, null, 2))
    return true
  } catch (error) {
    console.error('Erreur lors de la suppression de la playlist:', error)
    return false
  }
}

export function getFilesByPlaylistId(playlistId) {
  try {
    const files = getAllFiles()
    return files.filter(file => file.playlistId === playlistId)
  } catch (error) {
    console.error('Erreur lors de la récupération des fichiers de la playlist:', error)
    return []
  }
}

export function deleteFileById(id) {
  try {
    const files = getAllFiles()
    const fileIndex = files.findIndex(file => file.id === id)
    
    if (fileIndex === -1) {
      return false
    }
    
    files.splice(fileIndex, 1)
    fs.writeFileSync(DB_FILE, JSON.stringify(files, null, 2))
    return true
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    return false
  }
}

function generateId() {
  return Math.random().toString(36).substr(2, 9)
}
