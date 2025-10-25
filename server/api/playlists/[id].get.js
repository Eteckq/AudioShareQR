import { getPlaylistById, getFilesByPlaylistId } from '../../utils/database'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  
  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'ID requis'
    })
  }

  try {
    const playlist = getPlaylistById(id)
    
    if (!playlist) {
      throw createError({
        statusCode: 404,
        message: 'Playlist non trouvée'
      })
    }

    const files = getFilesByPlaylistId(id)
    
    return {
      ...playlist,
      files
    }
  } catch (error) {
    console.error('Erreur lors de la récupération de la playlist:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Erreur lors de la récupération de la playlist'
    })
  }
})
