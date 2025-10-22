import { getFileById, deleteFileById } from '../../utils/database'
import fs from 'fs'
import path from 'path'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID requis'
    })
  }

  try {
    // Récupérer les informations du fichier
    const file = getFileById(id)
    
    if (!file) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Fichier non trouvé'
      })
    }

    // Supprimer le fichier physique s'il existe
    const filePath = path.join(process.cwd(), file.path)
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath)
        console.log(`Fichier physique supprimé: ${filePath}`)
      } catch (fileError) {
        console.error(`Erreur lors de la suppression du fichier physique: ${fileError.message}`)
        // On continue même si la suppression du fichier physique échoue
      }
    }

    // Supprimer l'entrée de la base de données
    const success = deleteFileById(id)
    
    if (!success) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Erreur lors de la suppression du fichier'
      })
    }

    return { 
      success: true, 
      message: 'Fichier supprimé avec succès' 
    }

  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur lors de la suppression du fichier'
    })
  }
})
