import multer from 'multer'
import fs from 'fs'
import path from 'path'
import { saveFile, getFilesDir } from '../utils/database'

// Configuration de multer pour l'upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Utiliser la fonction utilitaire pour obtenir le bon chemin
    const uploadDir = getFilesDir()
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    // Générer un nom de fichier unique
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Vérifier que c'est un fichier audio
    // FIXME vuln
    const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Seuls les fichiers audio sont autorisés'), false)
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB max
  }
})

export default defineEventHandler(async (event) => {
  if (event.node.req.method !== 'POST') {
    throw createError({
      statusCode: 405,
      message: 'Method Not Allowed'
    })
  }

  
  try {
    // Utiliser multer pour parser le multipart/form-data
    const formData = await readMultipartFormData(event)
    
    if (!formData || formData.length === 0) {
      throw createError({
        statusCode: 400,
        message: 'Aucun fichier fourni'
      })
    }

    let fileName = ''
    let userName = ''
    let fileData = null
    let filePath = ''

    // Parser les données du formulaire
    for (const item of formData) {
      if (item.name === 'file' && item.filename) {
        // Sauvegarder le fichier
        const uploadDir = getFilesDir()
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true })
        }
        
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        const fileExtension = path.extname(item.filename)
        const newFileName = 'audio-' + uniqueSuffix + fileExtension
        filePath = path.join(uploadDir, newFileName)
        
        fs.writeFileSync(filePath, item.data)
        fileName = item.filename
      } else if (item.name === 'name') {
        userName = item.data.toString()
      }
    }

    if (!filePath) {
      throw createError({
        statusCode: 400,
        message: 'Aucun fichier audio fourni'
      })
    }

    // Sauvegarder les informations en base
    const { getBasePath } = await import('../utils/database')
    const basePath = getBasePath()
    const relativePath = path.relative(basePath, filePath)
    const savedFile = saveFile({
      name: userName,
      path: relativePath,
      originalName: fileName
    })

    console.log(`File "${userName}" saved: ${savedFile.id}`);


    return {
      success: true,
      file: savedFile,
      qrCodeUrl: `/api/qr/${savedFile.id}`
    }

  } catch (error) {
    console.error('Erreur lors de l\'upload:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Erreur lors de l\'upload du fichier'
    })
  }
})
