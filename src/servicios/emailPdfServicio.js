import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Linking } from 'react-native';
import { getApiUrl } from '../config/api';
import { obtenerRubricaPorTipo } from '../basedatos/rubricas';

const API_URL = 'http://192.168.100.35:3000/api/email';

/**
 * Genera el HTML para el PDF de la evaluación
 * @param {Object} evaluacion Objeto con todos los datos de la evaluación
 * @returns {string} Contenido HTML para el PDF
 */
export const generarHTML = (evaluacion) => {
  if (!evaluacion || !evaluacion.resultados || !evaluacion.estudiante) {
    console.error('Datos de evaluación incompletos');
    return '';
  }

  const notaFinal = evaluacion.notaFinal || 0;
  const notaEnLetras = convertirNumeroALetras(notaFinal);
  
    const filasHTML = generarFilasCriterios(evaluacion.resultados);

  // Encabezados dinámicos según el tipo de rúbrica (antigua o actual)
  const tipoDisertacion = evaluacion.estudiante?.tipo || 'actual';
  const rubrica = obtenerRubricaPorTipo(tipoDisertacion);
  const columnas = rubrica[0]?.indicadores[0]?.opciones.map(o => o.label.toUpperCase()) || [];
  const headerColsHTML = columnas.map(c => `<th>${c}</th>`).join('');

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Criterios de Evaluación - ${evaluacion.estudiante.nombre} ${evaluacion.estudiante.apellido}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 210mm;
          margin: 0 auto;
          padding: 10px;
          background-color: #f5f5f5;
          font-size: 11px;
        }
        .container {
          background-color: white;
          padding: 20px;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        h1 {
          text-align: center;
          font-size: 16px;
          text-transform: uppercase;
          margin-bottom: 20px;
        }
        .label {
          font-weight: bold;
          width: 30%;
          background-color: #f0f0f0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
          table-layout: fixed;
        }
        th, td {
          border: 1px solid #444;
          padding: 4px 2px;
          text-align: center;
          font-size: 10px;
          word-wrap: break-word;
        }
        th {
          background-color: #eee;
          font-size: 10px;
        }
        p {
          text-align: center;
        }
        .firma {
          margin-top: 40px;
          margin-bottom: 20px;
          text-align: center;
          page-break-before: avoid;
          page-break-inside: avoid;
        }
        .firma-line {
          width: 250px;
          border-top: 1px solid #000;
          margin: 10px auto;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>RÚBRICA DE EVALUACIÓN<br>DE LA DISERTACIÓN ORAL DEL TRABAJO DE TITULACIÓN</h1>

        <table style="margin-top: 20px;">
          <tr>
            <td class="label" style="font-weight: bold; width: 30%; background-color: #f0f0f0;">Estudiante:</td>
            <td>${evaluacion.estudiante.nombre} ${evaluacion.estudiante.apellido}</td>
          </tr>
          <tr>
            <td class="label" style="font-weight: bold; width: 30%; background-color: #f0f0f0;">Tutor:</td>
            <td>${evaluacion.estudiante.tutor || ''}</td>
          </tr>
          <tr>
            <td class="label" style="font-weight: bold; width: 30%; background-color: #f0f0f0;">Nombre del Miembro del Tribunal:</td>
            <td>${evaluacion.evaluador.nombre + ' ' + evaluacion.evaluador.apellido || ''}</td>
          </tr>
          <tr>
            <td class="label" style="font-weight: bold; width: 30%; background-color: #f0f0f0;">Programa:</td>
            <td>${evaluacion.estudiante.maestria || ''}</td>
          </tr>
          <tr>
            <td class="label" style="font-weight: bold; width: 30%; background-color: #f0f0f0;">Tema del Trabajo de Titulación:</td>
            <td>${evaluacion.estudiante.tesis || ''}</td>
          </tr>
          <tr>
            <td class="label" style="font-weight: bold; width: 30%; background-color: #f0f0f0;">Fecha:</td>
            <td>${new Date(evaluacion.fecha).toLocaleDateString()}</td>
          </tr>
        </table>

        <table>
          <thead>
            <tr>
              <th>CRITERIOS</th>
              <th>INDICADOR</th>
              ${headerColsHTML}
              <th>PUNTAJE</th>
            </tr>
          </thead>
          <tbody>
            ${filasHTML}
            <tr>
              <td colspan="7" style="text-align: right; font-weight: bold;">TOTAL</td>
              <td style="font-weight: bold;">${notaFinal.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <table style="width: 50%; margin: 20px auto;">
          <tr>
            <td><strong>Puntaje máximo:</strong></td>
            <td>20 puntos (100%)</td>
          </tr>
          <tr>
            <td><strong>Puntaje mínimo de aprobación:</strong></td>
            <td>16 puntos (80%)</td>
          </tr>
        </table>

        <table style="width: 50%; margin: 20px auto;">
          <tr>
            <td><strong>Puntaje obtenido en números:</strong></td>
            <td>${notaFinal.toFixed(2)}</td>
          </tr>
          <tr>
            <td><strong>Puntaje obtenido en letras:</strong></td>
            <td>${notaEnLetras}</td>
          </tr>
        </table>

        <div class="firma">
          <div class="firma-line"></div>
          <strong>Firma</strong>
          <br><br>
          <strong>Docente Evaluador</strong>
          <br>
          ${evaluacion.evaluador.nombre + ' ' + evaluacion.evaluador.apellido || ''}
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Genera las filas HTML para cada criterio e indicador
 * @param {Array} resultados Resultados de la evaluación
 * @returns {string} HTML con las filas de la tabla
 */
const generarFilasCriterios = (resultados) => {
  if (!resultados || !Array.isArray(resultados) || resultados.length === 0) {
    return '';
  }

  let htmlFilas = '';
  let criterioActual = '';
  let contadorFilas = 0;
  let criterioFilas = 0;

  resultados.forEach((resultado) => {
    const criterio = resultado.criterio;
    const indicador = resultado.indicador;
    const valorSeleccionado = resultado.valorSeleccionado;
    
    if (criterio !== criterioActual) {
      if (criterioActual !== '') {
        criterioActual = criterio;
        contadorFilas += criterioFilas;
        criterioFilas = 1;
      } else {
        criterioActual = criterio;
        criterioFilas = 1;
      }
    } else {
      criterioFilas++;
    }
    
    htmlFilas += '<tr>';
    
    if (criterioFilas === 1) {
      const rowsInCriterio = resultados.filter(r => r.criterio === criterio).length;
      htmlFilas += `<td rowspan="${rowsInCriterio}">${criterio}</td>`;
    }
    
    htmlFilas += `<td>${indicador.nombre}</td>`;
    
    indicador.opciones.forEach(opcion => {
      const esSeleccionado = opcion.value === valorSeleccionado;
      htmlFilas += `<td${esSeleccionado ? ' style="background-color: #e6f7ff; font-weight: bold;"' : ''}>${opcion.value.toFixed(2)}</td>`;
    });
    
    htmlFilas += `<td>${valorSeleccionado.toFixed(2)}</td>`;
    
    htmlFilas += '</tr>';
  });
  
  return htmlFilas;
};

/**
 * Convierte un número a su representación textual
 * @param {number} numero Número a convertir
 * @returns {string} Representación textual del número
 */
export const convertirNumeroALetras = (numero) => {
  const unidades = ['', 'Uno', 'Dos', 'Tres', 'Cuatro', 'Cinco', 'Seis', 'Siete', 'Ocho', 'Nueve'];
  const especiales = ['Diez', 'Once', 'Doce', 'Trece', 'Catorce', 'Quince', 'Dieciséis', 'Diecisiete', 'Dieciocho', 'Diecinueve'];
  const decenas = ['', 'Diez', 'Veinte', 'Treinta', 'Cuarenta', 'Cincuenta', 'Sesenta', 'Setenta', 'Ochenta', 'Noventa'];
  
  if (numero % 1 !== 0) {
    const parteEntera = Math.floor(numero);
    let parteDecimal = Math.round((numero - parteEntera) * 100);
    
    let textoEntero = numerosALetras(parteEntera);
    
    let textoDecimal = '';
    if (parteDecimal < 10) {
      textoDecimal = `cero ${unidades[parteDecimal]}`;
    } else if (parteDecimal < 20) {
      textoDecimal = especiales[parteDecimal - 10];
    } else {
      const unidad = parteDecimal % 10;
      const decena = Math.floor(parteDecimal / 10);
      
      if (unidad === 0) {
        textoDecimal = decenas[decena];
      } else {
        textoDecimal = `${decenas[decena]} y ${unidades[unidad]}`;
      }
    }
    
    return `${textoEntero} punto ${textoDecimal}`;
  }
  
  return numerosALetras(numero);
};

const numerosALetras = (numero) => {
  const unidades = ['', 'Uno', 'Dos', 'Tres', 'Cuatro', 'Cinco', 'Seis', 'Siete', 'Ocho', 'Nueve'];
  const especiales = ['Diez', 'Once', 'Doce', 'Trece', 'Catorce', 'Quince', 'Dieciséis', 'Diecisiete', 'Dieciocho', 'Diecinueve'];
  const decenas = ['', 'Diez', 'Veinte', 'Treinta', 'Cuarenta', 'Cincuenta', 'Sesenta', 'Setenta', 'Ochenta', 'Noventa'];
  
  const parteEntera = Math.floor(numero);
  
  if (parteEntera < 10) {
    return unidades[parteEntera];
  }
  
  if (parteEntera < 20) {
    return especiales[parteEntera - 10];
  }
  
  if (parteEntera < 100) {
    const unidad = parteEntera % 10;
    const decena = Math.floor(parteEntera / 10);
    
    if (unidad === 0) {
      return decenas[decena];
    } else {
      return `${decenas[decena]} y ${unidades[unidad]}`;
    }
  }
  
  return `${parteEntera}`;
};

/**
 * Genera un PDF a partir del HTML y lo comparte para enviar por correo
 * @param {Object} evaluacion Datos completos de la evaluación
 * @returns {Promise<void>}
 */
export const generarYCompartirPDF = async (evaluacion) => {
  try {
    const html = generarHTML(evaluacion);
    
    if (!html) {
      throw new Error('No se pudo generar el HTML del reporte');
    }
    
    const { uri } = await Print.printToFileAsync({
      html: html,
      base64: false
    });
    
    const nombreArchivo = `Evaluacion_${evaluacion.estudiante.nombre}_${evaluacion.estudiante.apellido}_${new Date().getTime()}.pdf`;
    
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Compartir evaluación',
        UTI: 'com.adobe.pdf',
      });
    } else {
      const destino = `${FileSystem.documentDirectory}${nombreArchivo}`;
      await FileSystem.copyAsync({
        from: uri,
        to: destino
      });
      
      await FileSystem.getContentUriAsync(destino).then(cUri => {
        Linking.openURL(cUri);
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error al generar PDF:', error);
    return false;
  }
};

/**
 * Envía un correo electrónico con el PDF adjunto usando el backend
 * @param {Object} evaluacion Datos de la evaluación
 * @param {string} correoDestino Correo electrónico de destino
 * @returns {Promise<boolean>} Éxito de la operación
 */
export const enviarCorreoConPDF = async (evaluacion, correoDestino) => {
  try {
    const htmlContent = generarHTML(evaluacion);
    
    if (!htmlContent) {
      throw new Error('No se pudo generar el HTML del reporte');
    }
    
    const asunto = `Evaluación - ${evaluacion.estudiante.nombre} ${evaluacion.estudiante.apellido}`;
    const cuerpo = `Adjunto encontrará la evaluación de ${evaluacion.estudiante.nombre} ${evaluacion.estudiante.apellido}.

Fecha: ${new Date(evaluacion.fecha).toLocaleDateString()}
Nota Final: ${evaluacion.notaFinal.toFixed(2)}`;
    
    const nombreArchivo = `Evaluacion_${evaluacion.estudiante.nombre}_${evaluacion.estudiante.apellido}.pdf`;
    
    const emailData = {
      to: correoDestino,
      from: 'registronotas2025@gmail.com', 
      subject: asunto,
      text: cuerpo,
      html: `<p>${cuerpo.replace(/\n/g, '<br>')}</p>`,
      htmlContent: htmlContent, 
      pdfName: nombreArchivo
    };
    
    const response = await fetch(getApiUrl('/api/email/send'), {
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
    
    console.log('Correo enviado exitosamente');
    return true;
  } catch (error) {
    console.error('Error al enviar el correo:', error);
    return false;
  }
};

const enviarCorreo = async (datos) => {
  try {
    const response = await axios.post(getApiUrl('/api/email'), datos);
  } catch (error) {
  }
};
