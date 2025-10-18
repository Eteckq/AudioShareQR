import QRCode from 'qrcode'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  
  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'ID requis'
    })
  }

  // URL de la page audio
  const audioUrl = `${getRequestURL(event).origin}/audio/${id}`
  
  try {
    // Générer le QR code en PNG
    const qrCodeBuffer = await QRCode.toBuffer(audioUrl, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      type: 'png'
    })
    
    // Définir les headers pour une image PNG
    setHeader(event, 'Content-Type', 'image/png')
    setHeader(event, 'Content-Length', qrCodeBuffer.length.toString())
    setHeader(event, 'Cache-Control', 'public, max-age=31536000') // Cache 1 an
    
    return qrCodeBuffer
  } catch (error) {
    console.error('Erreur génération QR code:', error)
    throw createError({
      statusCode: 500,
      message: 'Erreur lors de la génération du QR code'
    })
  }
})
