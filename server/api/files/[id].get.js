import { getFileById } from '../../utils/database'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  
  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'ID requis'
    })
  }

  const file = getFileById(id)
  
  if (!file) {
    throw createError({
      statusCode: 404,
      message: 'Fichier non trouvé'
    })
  }

  return file
})
