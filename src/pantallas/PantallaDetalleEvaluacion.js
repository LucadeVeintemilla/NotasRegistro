import { Feather, MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { obtenerRubricaCompleta } from '../basedatos/rubricaServicio';
import Cabecera from '../componentes/Cabecera';
import { colores, estilosGlobales } from '../estilos/estilosGlobales';
import { setAuthToken } from '../servicios/auth/authService';
import { enviarCorreoConPDF, generarYCompartirPDF } from '../servicios/emailPdfServicio';
import { getApiUrl } from '../config/api';

/**
 * Pantalla que muestra el detalle de una evaluación
 * @param {Object} props Propiedades del componente
 * @param {Object} props.route Objeto de ruta con parámetros
 * @param {Object} props.navigation Objeto de navegación
 * @returns {React.Component} Componente de pantalla de detalle de evaluación
 */
const PantallaDetalleEvaluacion = ({ route, navigation }) => {
  const { evaluacionId } = route.params;
  const [evaluacion, setEvaluacion] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [rubrica, setRubrica] = useState([]);
  const [detallesIndicadores, setDetallesIndicadores] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [correoDestino, setCorreoDestino] = useState('');
  const [enviandoEmail, setEnviandoEmail] = useState(false);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true);
        await setAuthToken();
        const response = await axios.get(getApiUrl(`/api/evaluaciones/${evaluacionId}`));
        setEvaluacion(response.data.data);

        const datosRubrica = await obtenerRubricaCompleta();
        setRubrica(datosRubrica);

        const mapaIndicadores = {};
        datosRubrica.forEach(criterio => {
          criterio.indicadores.forEach(indicador => {
            mapaIndicadores[indicador.id] = {
              ...indicador,
              criterio: criterio.criterio
            };
          });
        });
        setDetallesIndicadores(mapaIndicadores);

        setCargando(false);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        Alert.alert('Error', 'No se pudieron cargar los datos de la evaluación');
        setCargando(false);
      }
    };

    cargarDatos();
  }, [evaluacionId]);

  const obtenerCalificacionPorValor = (valor) => {
    if (valor >= 4.5) return 'Excelente';
    if (valor >= 4) return 'Muy Bueno';
    if (valor >= 3) return 'Bueno';
    if (valor >= 2) return 'Regular';
    return 'Deficiente';
  };

  const obtenerColorPorCalificacion = (calificacion) => {
    switch (calificacion) {
      case 'Deficiente': return colores.deficiente;
      case 'Regular': return colores.regular;
      case 'Bueno': return colores.bueno;
      case 'Muy Bueno': return colores.muyBueno;
      case 'Excelente': return colores.excelente;
      default: return colores.texto;
    }
  };

  const prepararDatosParaPDF = () => {
    if (!evaluacion || !evaluacion.resultados) return null;
    
    return {
      ...evaluacion,
      notaFinal: evaluacion.notaFinal || 0
    };
  };

  const generarPDF = async () => {
    try {
      const datosParaPDF = prepararDatosParaPDF();
      
      if (!datosParaPDF) {
        Alert.alert('Error', 'No se pudieron preparar los datos de la evaluación');
        return;
      }
      
      const resultado = await generarYCompartirPDF(datosParaPDF);
      
      if (!resultado) {
        Alert.alert('Error', 'No se pudo generar el PDF de la evaluación');
      }
    } catch (error) {
      console.error('Error al generar PDF:', error);
      Alert.alert('Error', 'Ocurrió un problema al generar el PDF');
    }
  };

  const mostrarModalCorreo = () => {
    setModalVisible(true);
  };

  const enviarPorCorreo = async () => {
    if (!correoDestino.trim()) {
      Alert.alert('Error', 'Por favor ingrese una dirección de correo válida');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correoDestino)) {
      Alert.alert('Error', 'Por favor ingrese una dirección de correo electrónico válida');
      return;
    }
    
    try {
      setEnviandoEmail(true);
      const datosParaPDF = prepararDatosParaPDF();
      
      if (!datosParaPDF) {
        Alert.alert('Error', 'No se pudieron preparar los datos de la evaluación');
        setEnviandoEmail(false);
        return;
      }
      
      const resultado = await enviarCorreoConPDF(datosParaPDF, correoDestino);
      
      setEnviandoEmail(false);
      if (resultado) {
        setModalVisible(false);
        setCorreoDestino('');
        Alert.alert('Éxito', 'El correo con la evaluación ha sido enviado correctamente');
      } else {
        Alert.alert('Error', 'No se pudo enviar el correo. Intente nuevamente.');
      }
    } catch (error) {
      console.error('Error al enviar correo:', error);
      setEnviandoEmail(false);
      Alert.alert('Error', 'Ocurrió un problema al enviar el correo');
    }
  };

  if (cargando) {
    return (
      <View style={estilosGlobales.contenedorCentrado}>
        <ActivityIndicator size="large" color={colores.primario} />
        <Text style={styles.textoEspera}>Cargando evaluación...</Text>
      </View>
    );
  }

  if (!evaluacion) {
    return (
      <View style={estilosGlobales.contenedorCentrado}>
        <Text style={styles.textoError}>No se encontró la disertación</Text>
      </View>
    );
  }

  const nombreCompleto = `${evaluacion.estudiante.nombre} ${evaluacion.estudiante.apellido}`;
  const estudiante = evaluacion.estudiante;

  return (
    <View style={estilosGlobales.contenedor}>
      <Cabecera
        titulo="Detalle de Disertación"
        onAtras={() => navigation.goBack()}
      />
      
      <ScrollView contentContainerStyle={styles.contenido}>
        <View style={styles.seccion}>
          <Text style={styles.tituloSeccion}>Información General</Text>
          <Text style={styles.campo}>
            <Text style={styles.etiqueta}>Título: </Text>
            {evaluacion.titulo}
          </Text>
          <Text style={styles.campo}>
            <Text style={styles.etiqueta}>Estado: </Text>
            {evaluacion.estado}
          </Text>
          <Text style={styles.campo}>
            <Text style={styles.etiqueta}>Nota Final: </Text>
            {evaluacion.notaFinal?.toFixed(2) || 'No calificada'}
          </Text>
        </View>

        <View style={styles.seccion}>
          <Text style={styles.tituloSeccion}>Datos del Estudiante</Text>
          <Text style={styles.campo}>
            <Text style={styles.etiqueta}>Nombre: </Text>
            {nombreCompleto}
          </Text>
          <Text style={styles.campo}>
            <Text style={styles.etiqueta}>Cédula: </Text>
            {estudiante.cedula || 'No disponible'}
          </Text>
        </View>

        <View style={styles.seccion}>
          <Text style={styles.tituloSeccion}>Detalles de la Disertación</Text>
          <Text style={styles.campo}>
            <Text style={styles.etiqueta}>Fecha: </Text>
            {new Date(evaluacion.fecha).toLocaleDateString()}
          </Text>
          <Text style={styles.campo}>
            <Text style={styles.etiqueta}>Horario: </Text>
            {`${new Date(evaluacion.horarioInicio).toLocaleTimeString()} - ${new Date(evaluacion.horarioFin).toLocaleTimeString()}`}
          </Text>
        </View>

        {evaluacion.resultados && evaluacion.resultados.length > 0 && (
          <View style={styles.seccion}>
            <Text style={styles.tituloSeccion}>Resultados por Criterio</Text>
            
            {rubrica.map((criterio) => {
              const resultadosCriterio = evaluacion.resultados.filter(
                r => r.criterio === criterio.criterio
              );
              
              if (resultadosCriterio.length === 0) return null;
              
              return (
                <View key={criterio.id} style={styles.criterioResultado}>
                  <Text style={styles.tituloCriterio}>{criterio.criterio}</Text>
                  
                  {resultadosCriterio.map((resultado, index) => {
                    const calificacion = obtenerCalificacionPorValor(resultado.valorSeleccionado);
                    const colorCalificacion = obtenerColorPorCalificacion(calificacion);
                    
                    return (
                      <View key={index} style={styles.indicadorResultado}>
                        <Text style={styles.nombreIndicador}>
                          {resultado.indicador.nombre}
                        </Text>
                        <View style={styles.valorContainer}>
                          <Text style={[styles.valorCalificacion, { color: colorCalificacion }]}>
                            {calificacion}
                          </Text>
                          <Text style={styles.valorNumerico}>
                            ({resultado.valorSeleccionado})
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              );
            })}
          </View>
        )}

        <View style={styles.botonesContainer}>
          <TouchableOpacity
            style={styles.botonPDF}
            onPress={generarPDF}
          >
            <Text style={styles.textoBotonPDF}>Generar PDF</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.botonEmail}
            onPress={mostrarModalCorreo}
          >
            <MaterialIcons name="email" size={20} color={colores.textoClaro} />
            <Text style={styles.textoBotonCompartir}>Enviar por Email</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Feather name="x" size={24} color={colores.texto} />
            </TouchableOpacity>
            
            <Text style={styles.modalTitle}>Enviar PDF por correo</Text>
            <Text style={styles.modalSubtitle}>Ingrese la dirección de correo electrónico donde desea enviar la disertación:</Text>
            
            <TextInput
              style={styles.emailInput}
              placeholder="correo@ejemplo.com"
              value={correoDestino}
              onChangeText={setCorreoDestino}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <TouchableOpacity
              style={[styles.botonEnviarEmail, enviandoEmail && styles.botonDeshabilitado]}
              onPress={enviarPorCorreo}
              disabled={enviandoEmail}
            >
              {enviandoEmail ? (
                <ActivityIndicator size="small" color={colores.textoClaro} />
              ) : (
                <>
                  <MaterialIcons name="send" size={20} color={colores.textoClaro} />
                  <Text style={styles.textoBotonEnviar}>Enviar</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  contenido: {
    padding: 16,
    paddingBottom: 32,
  },
  seccion: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tituloSeccion: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colores.primario,
    marginBottom: 12,
  },
  campo: {
    fontSize: 16,
    color: colores.texto,
    marginBottom: 8,
  },
  etiqueta: {
    fontWeight: 'bold',
  },
  seccionResultados: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  criterioResultado: {
    marginBottom: 20,
  },
  tituloCriterio: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colores.primario,
    backgroundColor: '#e8eaf6',
    padding: 8,
    borderRadius: 4,
    marginBottom: 12,
  },
  indicadorResultado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  nombreIndicador: {
    flex: 1,
    fontSize: 15,
    color: colores.texto,
  },
  valorContainer: {
    alignItems: 'flex-end',
  },
  valorCalificacion: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  valorNumerico: {
    fontSize: 14,
    color: '#757575',
    marginTop: 2,
  },
  botonesContainer: {
    flexDirection: 'column',
    marginTop: 16,
    gap: 12,
  },
  botonPDF: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F44336',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    elevation: 2,
  },
  botonEmail: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colores.primario,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    elevation: 2,
  },
  textoBotonCompartir: {
    color: colores.textoClaro,
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    elevation: 5,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colores.texto,
    marginBottom: 12,
  },
  modalSubtitle: {
    fontSize: 16,
    color: colores.textoSecundario,
    marginBottom: 24,
  },
  emailInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 24,
  },
  botonEnviarEmail: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colores.primario,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  botonDeshabilitado: {
    opacity: 0.6,
  },
  textoBotonEnviar: {
    color: colores.textoClaro,
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  textoEspera: {
    marginTop: 16,
    fontSize: 16,
    color: colores.texto,
  },
  textoError: {
    fontSize: 16,
    color: colores.error,
    textAlign: 'center',
  },
  textoBotonPDF: {
    color: colores.textoClaro,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default PantallaDetalleEvaluacion;
