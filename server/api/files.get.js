import { getAllFiles } from '../utils/database'

export default defineEventHandler(async (event) => {
  try {
    const files = getAllFiles()
    return files
  } catch (error) {
    console.error('Erreur lors de la récupération des fichiers:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur lors de la récupération des fichiers'
    })
  }
})
