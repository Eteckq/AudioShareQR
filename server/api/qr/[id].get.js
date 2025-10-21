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
    // Générer le QR code avec la librairie qrcode
    const qrCodeDataUrl = await QRCode.toDataURL(audioUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
    
    return {
      url: audioUrl,
      qrCodeDataUrl: qrCodeDataUrl
    }
  } catch (error) {
    console.error('Erreur génération QR code:', error)
    throw createError({
      statusCode: 500,
      message: 'Erreur lors de la génération du QR code'
    })
  }
})
