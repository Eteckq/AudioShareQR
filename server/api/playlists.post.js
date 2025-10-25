import { savePlaylist } from '../utils/database'

export default defineEventHandler(async (event) => {
  if (event.node.req.method !== 'POST') {
    throw createError({
      statusCode: 405,
      message: 'Method Not Allowed'
    })
  }

  try {
    const body = await readBody(event)
    
    if (!body.name) {
      throw createError({
        statusCode: 400,
        message: 'Nom requis'
      })
    }

    const playlist = savePlaylist({
      name: body.name,
      description: body.description || ''
    })

    return {
      success: true,
      playlist
    }
  } catch (error) {
    console.error('Erreur lors de la création de la playlist:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Erreur lors de la création de la playlist'
    })
  }
})
