
export default defineEventHandler(async (event) => {
  if (event.node.req.method !== 'POST') {
    throw createError({
      statusCode: 405,
      message: 'Method Not Allowed'
    })
  }

  try {
    const body = await readBody(event)
    
    if (!body.pin) {
      throw createError({
        statusCode: 400,
        message: 'Code PIN requis'
      })
    }

    // Vérifier le code PIN principal (8673)
    const isValidPin = body.pin === '8673'
    
    return {
      success: isValidPin,
      message: isValidPin ? 'Code PIN valide' : 'Code PIN invalide'
    }
  } catch (error) {
    console.error('Erreur lors de la vérification du PIN:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Erreur lors de la vérification du PIN'
    })
  }
})
