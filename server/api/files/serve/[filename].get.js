import fs from 'fs'
import path from 'path'
import { getFilesDir } from '../../../utils/database'

export default defineEventHandler(async (event) => {
  const filename = getRouterParam(event, 'filename')
  
  if (!filename) {
    throw createError({
      statusCode: 400,
      message: 'Nom de fichier requis'
    })
  }

  const filePath = path.join(getFilesDir(), filename)
  
  // Vérifier que le fichier existe
  if (!fs.existsSync(filePath)) {
    throw createError({
      statusCode: 404,
      message: 'Fichier non trouvé'
    })
  }

  // Obtenir les informations du fichier
  const stats = fs.statSync(filePath)
  const fileSize = stats.size
  
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

  // Définir les headers de base
  setHeader(event, 'Content-Type', mimeType)
  setHeader(event, 'Accept-Ranges', 'bytes')
  setHeader(event, 'Cache-Control', 'public, max-age=31536000')

  // Gérer les requêtes Range pour le seeking
  const range = getHeader(event, 'range')
  
  if (range) {
    // Parser le header Range (format: bytes=start-end)
    const parts = range.replace(/bytes=/, "").split("-")
    const start = parseInt(parts[0], 10)
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
    
    // Valider les valeurs
    if (start >= fileSize) {
      setHeader(event, 'Content-Range', `bytes */${fileSize}`)
      throw createError({
        statusCode: 416,
        message: 'Requested Range Not Satisfiable'
      })
    }
    
    const chunksize = (end - start) + 1
    const file = fs.createReadStream(filePath, { start, end })
    
    // Définir les headers pour la réponse partielle
    setHeader(event, 'Content-Range', `bytes ${start}-${end}/${fileSize}`)
    setHeader(event, 'Content-Length', chunksize.toString())
    setResponseStatus(event, 206) // Partial Content
    
    return file
  } else {
    // Requête normale sans Range
    setHeader(event, 'Content-Length', fileSize.toString())
    return fs.createReadStream(filePath)
  }
})
