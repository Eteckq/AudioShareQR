import { getAllPlaylists, getFilesByPlaylistId } from '../utils/database'

export default defineEventHandler(async (event) => {
  try {
    const playlists = getAllPlaylists()
    
    // Ajouter le comptage des fichiers pour chaque playlist
    const playlistsWithCount = playlists.map(playlist => {
      const files = getFilesByPlaylistId(playlist.id)
      return {
        ...playlist,
        filesCount: files.length
      }
    })
    
    return playlistsWithCount
  } catch (error) {
    console.error('Erreur lors de la récupération des playlists:', error)
    throw createError({
      statusCode: 500,
      message: 'Erreur lors de la récupération des playlists'
    })
  }
})
