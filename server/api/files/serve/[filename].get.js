import fs from 'fs'
import path from 'path'
import { getFilesDir } from '../../../utils/database'

export default defineEventHandler(async (event) => {
  const filename = getRouterParam(event, 'filename')
  
  if (!filename) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Nom de fichier requis'
    })
  }

  const filePath = path.join(getFilesDir(), filename)
  
  // Vérifier que le fichier existe
  if (!fs.existsSync(filePath)) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Fichier non trouvé'
    })
  }

  // Lire le fichier
  const fileBuffer = fs.readFileSync(filePath)
  
  // Déterminer le type MIME
  const ext = path.extname(filename).toLowerCase()
  let mimeType = 'application/octet-stream'
  
  switch (ext) {
    case '.mp3':
      mimeType = 'audio/mpeg'
      break
    case '.wav':
      mimeType = 'audio/wav'
      break
    case '.ogg':
      mimeType = 'audio/ogg'
      break
    case '.m4a':
      mimeType = 'audio/mp4'
      break
  }

  // Définir les headers
  setHeader(event, 'Content-Type', mimeType)
  setHeader(event, 'Content-Length', fileBuffer.length.toString())
  setHeader(event, 'Cache-Control', 'public, max-age=31536000') // Cache 1 an

  return fileBuffer
})
