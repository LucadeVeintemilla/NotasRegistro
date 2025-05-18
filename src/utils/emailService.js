import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const API_URL = 'http://192.168.100.35:3000/api/email';

/**
 * Genera un PDF con la información de la evaluación
 * @param {Object} evaluacion - Datos de evaluación
 * @returns {Promise<string>} - URI del archivo PDF generado
 */
export const generarPDF = async (evaluacion) => {
  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Evaluación ${evaluacion.nombre || 'Sin nombre'}</title>
          <style>
            body { font-family: 'Helvetica', sans-serif; margin: 40px; }
            h1 { color: #0066cc; }
            .header { border-bottom: 1px solid #ddd; padding-bottom: 10px; margin-bottom: 20px; }
            .criterio { margin-bottom: 15px; }
            .titulo-criterio { font-weight: bold; color: #333; }
            .puntuacion { color: #0066cc; font-weight: bold; }
            .comentario { font-style: italic; color: #666; }
            .total { margin-top: 20px; padding-top: 10px; border-top: 1px solid #ddd; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Informe de Evaluación</h1>
            <p><strong>Nombre:</strong> ${evaluacion.nombre || 'Sin nombre'}</p>
            <p><strong>Fecha:</strong> ${new Date(evaluacion.fecha || Date.now()).toLocaleDateString()}</p>
          </div>
          
          ${evaluacion.criterios ? evaluacion.criterios.map(criterio => `
            <div class="criterio">
              <p class="titulo-criterio">${criterio.titulo || 'Criterio'}</p>
              <p class="puntuacion">Puntuación: ${criterio.puntuacion || 0}</p>
              <p class="comentario">Comentario: ${criterio.comentario || 'Sin comentario'}</p>
            </div>
          `).join('') : '<p>No hay criterios disponibles</p>'}
          
          <div class="total">
            <p><strong>Puntuación Total:</strong> ${
              evaluacion.criterios 
                ? evaluacion.criterios.reduce((total, criterio) => total + (criterio.puntuacion || 0), 0) 
                : 0
            }</p>
          </div>
        </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({ html: htmlContent });
    
    const filename = uri.split('/').pop();
    
    const pdfPath = FileSystem.documentDirectory + filename;
    
    await FileSystem.moveAsync({
      from: uri,
      to: pdfPath
    });
    
    return pdfPath;
  } catch (error) {
    console.error('Error al generar el PDF:', error);
    throw error;
  }
};

/**
 * Comparte el PDF generado
 * @param {string} pdfUri - URI del archivo PDF
 */
export const compartirPDF = async (pdfUri) => {
  try {
    if (!(await Sharing.isAvailableAsync())) {
      alert('La función de compartir no está disponible en este dispositivo');
      return;
    }
    
    await Sharing.shareAsync(pdfUri);
  } catch (error) {
    console.error('Error al compartir el PDF:', error);
    throw error;
  }
};

/**
 * Envía un correo electrónico con el PDF adjunto utilizando el backend
 * @param {string} destinatario - Dirección de correo del destinatario
 * @param {string} asunto - Asunto del correo
 * @param {string} pdfUri - URI del archivo PDF
 * @param {string} contenido - Contenido del correo (opcional)
 */
export const enviarCorreoConPDF = async (destinatario, asunto, pdfUri, contenido = '') => {
  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Informe de Evaluación</title>
          <style>
            body { font-family: 'Helvetica', sans-serif; margin: 40px; }
            h1 { color: #0066cc; }
            .header { border-bottom: 1px solid #ddd; padding-bottom: 10px; margin-bottom: 20px; }
            .contenido { margin: 20px 0; }
            .footer { margin-top: 30px; font-size: 0.9em; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Informe de Evaluación</h1>
          </div>
          <div class="contenido">
            ${contenido || 'Adjunto encontrará el informe de evaluación.'}
          </div>
          <div class="footer">
            <p>Este informe fue generado automáticamente por NotasRegistro.</p>
          </div>
        </body>
      </html>
    `;
    
    const fileName = pdfUri ? pdfUri.split('/').pop() : 'evaluacion.pdf';
    
    const emailData = {
      to: destinatario,
      from: 'registronotas2025@gmail.com', // Correo verificado en SendGrid
      subject: asunto,
      text: contenido || 'Adjunto encontrará el informe de evaluación.',
      html: `<p>${contenido || 'Adjunto encontrará el informe de evaluación.'}</p>`,
      htmlContent: htmlContent, 
      pdfName: fileName
    };
    
    const response = await fetch(`${API_URL}/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Error al enviar el correo');
    }
    
    return true;
  } catch (error) {
    console.error('Error al enviar el correo:', error);
    throw error;
  }
};

/**
 * Función completa para generar PDF y enviar por correo
 * @param {Object} evaluacion - Datos de evaluación
 * @param {string} destinatario - Dirección de correo del destinatario
 * @param {string} asunto - Asunto del correo (opcional)
 * @param {string} contenido - Contenido del correo (opcional)
 */
export const generarYEnviarPDF = async (evaluacion, destinatario, asunto = 'Informe de Evaluación', contenido = '') => {
  try {
    const pdfUri = await generarPDF(evaluacion);
    
    await enviarCorreoConPDF(destinatario, asunto, pdfUri, contenido);
    
    return {
      success: true,
      pdfUri
    };
  } catch (error) {
    console.error('Error al generar y enviar PDF:', error);
    throw error;
  }
};
