import QRCode from 'qrcode'
import { getFileById } from '../../utils/database'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  
  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'ID requis'
    })
  }

  try {
    // Récupérer les informations du fichier
    const file = getFileById(id)
    
    if (!file) {
      throw createError({
        statusCode: 404,
        message: 'Fichier non trouvé'
      })
    }

    // URL de redirection selon le type
    let redirectUrl
    if (file.playlistId) {
      // Si le fichier appartient à une playlist, rediriger vers la playlist avec le fichier spécifique
      redirectUrl = `${getRequestURL(event).origin}/playlist/${file.playlistId}?file=${id}`
    } else {
      // Sinon, rediriger vers la page audio individuelle
      redirectUrl = `${getRequestURL(event).origin}/audio/${id}`
    }
    
    // Générer le QR code avec la librairie qrcode
    const qrCodeDataUrl = await QRCode.toDataURL(redirectUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
    
    return {
      url: redirectUrl,
      qrCodeDataUrl: qrCodeDataUrl,
      file: file
    }
  } catch (error) {
    console.error('Erreur génération QR code:', error)
    throw createError({
      statusCode: 500,
      message: 'Erreur lors de la génération du QR code'
    })
  }
})
