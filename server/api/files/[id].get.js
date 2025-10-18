import { getFileById } from '../../utils/database'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID requis'
    })
  }

  const file = getFileById(id)
  
  if (!file) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Fichier non trouvé'
    })
  }

  return file
})
