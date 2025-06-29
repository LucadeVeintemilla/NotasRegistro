import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { obtenerRubricaCompleta } from '../basedatos/rubricaServicio';
import Cabecera from '../componentes/Cabecera';
import CriterioEvaluacion from '../componentes/CriterioEvaluacion';
import { colores, estilosGlobales } from '../estilos/estilosGlobales';
import { getCurrentUser, setAuthToken } from '../servicios/auth/authService';
import { getApiUrl } from '../config/api';

/**
 * Pantalla para que los lectores califiquen evaluaciones
 * @param {Object} props Propiedades del componente
 * @param {Object} props.route Objeto con parámetros de navegación
 * @param {Object} props.navigation Objeto de navegación
 * @returns {React.Component} Componente de pantalla para calificar evaluaciones
 */
const PantallaCalificarEvaluacion = ({ route, navigation }) => {
  const { 
    evaluacionId, 
    evaluacionCompleta,
    estudianteNombre,
    estudianteApellido,
    estudianteCodigo,
    estudianteCurso,
    titulo: tituloEvaluacion
  } = route.params || {};

  const [rubrica, setRubrica] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [datosEstudiante, setDatosEstudiante] = useState({
    nombre: '',
    apellido: '',
    codigo: '',
    curso: '',
  });
  const [titulo, setTitulo] = useState('');
  const [valoresSeleccionados, setValoresSeleccionados] = useState({});
  const [puntajeTotal, setPuntajeTotal] = useState(0);
  const [evaluacionData, setEvaluacionData] = useState(null);
  const [evaluadorData, setEvaluadorData] = useState(null);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true);
        
        const userData = await getCurrentUser();
        setEvaluadorData(userData);
        
        const datosRubrica = await obtenerRubricaCompleta();
        setRubrica(datosRubrica);
        
        if (evaluacionId) {
          if (evaluacionCompleta) {
            setEvaluacionData(evaluacionCompleta);
            
            const ahora = new Date();
            const horarioInicio = new Date(evaluacionCompleta.horarioInicio);
            const horarioFin = new Date(evaluacionCompleta.horarioFin);

            if (ahora < horarioInicio) {
              Alert.alert(
                'Evaluación no disponible',
                'Esta evaluación aún no ha comenzado. Por favor, espere hasta la hora programada.',
                [{ 
                  text: 'OK',
                  onPress: () => navigation.goBack()
                }]
              );
              return;
            }

            if (ahora > horarioFin) {
              Alert.alert(
                'Evaluación expirada',
                'El tiempo para calificar esta evaluación ha expirado.',
                [{ 
                  text: 'OK',
                  onPress: () => navigation.goBack()
                }]
              );
              return;
            }
          }
          
          setDatosEstudiante({
            nombre: estudianteNombre || '',
            apellido: estudianteApellido || '',
            codigo: estudianteCodigo || '',
            curso: estudianteCurso || '',
          });
          
          setTitulo(tituloEvaluacion || '');
          
        } else {
          Alert.alert('Error', 'No se especificó una evaluación para calificar');
          navigation.goBack();
        }
        
        setCargando(false);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        Alert.alert('Error', 'No se pudieron cargar los datos. Por favor, intente nuevamente.');
        setCargando(false);
        navigation.goBack();
      }
    };

    cargarDatos();
  }, [navigation, evaluacionId]);

  const handleSeleccionarValor = (indicadorId, valor) => {
    setValoresSeleccionados(valores => ({
      ...valores,
      [indicadorId]: valor,
    }));
  };

  useEffect(() => {
    let total = 0;
    Object.values(valoresSeleccionados).forEach(valor => {
      total += valor;
    });
    setPuntajeTotal(total);
  }, [valoresSeleccionados]);

  const validarCalificacion = () => {
    const ahora = new Date();
    const horarioInicio = new Date(evaluacionData.horarioInicio);
    const horarioFin = new Date(evaluacionData.horarioFin);

    if (ahora < horarioInicio) {
      Alert.alert('Error', 'La evaluación aún no ha comenzado. Por favor, espere hasta la hora programada.');
      return false;
    }

    if (ahora > horarioFin) {
      Alert.alert('Error', 'El tiempo para calificar esta evaluación ha expirado.');
      return false;
    }

    let contadorIndicadores = 0;
    rubrica.forEach(criterio => {
      criterio.indicadores.forEach(() => {
        contadorIndicadores++;
      });
    });

    if (Object.keys(valoresSeleccionados).length < contadorIndicadores) {
      Alert.alert('Error', 'Debe evaluar todos los indicadores');
      return false;
    }

    return true;
  };

  const guardarCalificacion = async () => {
    if (!validarCalificacion()) {
      return;
    }

    Alert.alert(
      'Confirmar Guardado',
      '¿Estás seguro que deseas guardar esta evaluación? Esta acción no se puede deshacer.',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Guardar',
          onPress: async () => {
            setEnviando(true);

            try {
              await setAuthToken();
              
              const userData = await getCurrentUser();
              if (!userData || !userData.id) {
                throw new Error('No se pudo obtener información del usuario');
              }

              const resultados = [];
              Object.entries(valoresSeleccionados).forEach(([indicadorId, valor]) => {
                for (const criterio of rubrica) {
                  const indicador = criterio.indicadores.find(i => i.id === parseInt(indicadorId));
                  if (indicador) {
                    resultados.push({
                      criterio: criterio.criterio,
                      indicador: indicador,
                      valorSeleccionado: valor
                    });
                    break;
                  }
                }
              });

              const datosActualizacion = {
                notaFinal: puntajeTotal,
                resultados: resultados,
                estado: 'completada',
                fecha: new Date().toISOString()
              };

              const response = await axios.put(
                getApiUrl(`/api/evaluaciones/${evaluacionId}`),
                datosActualizacion
              );

              Alert.alert(
                'Éxito',
                'La evaluación se ha guardado correctamente',
                [
                  {
                    text: 'Volver al Inicio',
                    onPress: () => {
                      navigation.navigate('PantallaInicioLector');
                    },
                  },
                ]
              );

              setEnviando(false);
            } catch (error) {
              console.error('Error al guardar la calificación:', error);
              Alert.alert(
                'Error', 
                error.response?.data?.message || 'No se pudo guardar la calificación. Por favor, intente nuevamente.'
              );
              setEnviando(false);
            }
          }
        }
      ]
    );
  };

  if (cargando) {
    return (
      <View style={estilosGlobales.contenedorCentrado}>
        <ActivityIndicator size="large" color={colores.primario} />
        <Text style={styles.textoEspera}>Cargando evaluación...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={estilosGlobales.contenedor}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <Cabecera 
        titulo="Calificar Evaluación" 
        onAtras={() => navigation.goBack()} 
      />
      <ScrollView contentContainerStyle={styles.contenido}>
        <View style={styles.seccion}>
          <Text style={styles.tituloSeccion}>Datos del Estudiante</Text>
          
          <View style={styles.campo}>
            <Text style={styles.etiqueta}>Nombre:</Text>
            <View style={styles.campoNoEditable}>
              <Text style={styles.textoNoEditable}>{datosEstudiante.nombre}</Text>
            </View>
          </View>
          
          <View style={styles.campo}>
            <Text style={styles.etiqueta}>Apellido:</Text>
            <View style={styles.campoNoEditable}>
              <Text style={styles.textoNoEditable}>{datosEstudiante.apellido}</Text>
            </View>
          </View>
          
        
        </View>

        <View style={styles.seccion}>
          <Text style={styles.tituloSeccion}>Datos de la Evaluación</Text>
          
          <View style={styles.campo}>
            <Text style={styles.etiqueta}>Título:</Text>
            <View style={styles.campoNoEditable}>
              <Text style={styles.textoNoEditable}>{titulo}</Text>
            </View>
          </View>
          
          <View style={styles.campo}>
            <Text style={styles.etiqueta}>Fecha:</Text>
            <Text style={styles.textoFecha}>{new Date().toLocaleDateString()}</Text>
          </View>
        </View>

        <View style={styles.seccion}>
          <Text style={styles.tituloSeccion}>Rúbrica de Evaluación</Text>
          <Text style={styles.instrucciones}>
            Seleccione una calificación para cada indicador. Las opciones van desde Deficiente hasta Excelente, 
            cada una con un valor específico que se sumará al puntaje total.
          </Text>

          {rubrica.map((criterio) => (
            <CriterioEvaluacion
              key={criterio.id}
              criterio={criterio}
              valoresSeleccionados={valoresSeleccionados}
              onSeleccionarValor={handleSeleccionarValor}
            />
          ))}
        </View>

        <View style={styles.seccionPuntaje}>
          <View style={styles.filaPuntaje}>
            <Text style={styles.etiquetaPuntaje}>Puntaje Total:</Text>
            <Text style={styles.valorPuntaje}>{puntajeTotal.toFixed(2)}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.botonGuardar,
            enviando && styles.botonDeshabilitado,
          ]}
          onPress={guardarCalificacion}
          disabled={enviando}
        >
          {enviando ? (
            <ActivityIndicator size="small" color={colores.textoClaro} />
          ) : (
            <Text style={styles.textoBotonGuardar}>Guardar Calificación</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  contenido: {
    padding: 16,
    paddingBottom: 32,
  },
  seccion: {
    marginBottom: 24,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
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
    marginBottom: 16,
  },
  campo: {
    marginBottom: 12,
  },
  etiqueta: {
    fontSize: 16,
    color: colores.texto,
    marginBottom: 4,
  },
  instrucciones: {
    fontSize: 14,
    color: colores.texto,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  textoFecha: {
    fontSize: 16,
    color: colores.texto,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
  },
  campoNoEditable: {
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  textoNoEditable: {
    fontSize: 16,
    color: colores.texto,
  },
  seccionPuntaje: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  filaPuntaje: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  etiquetaPuntaje: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colores.texto,
  },
  valorPuntaje: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colores.primario,
  },
  botonGuardar: {
    backgroundColor: colores.primario,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  botonDeshabilitado: {
    backgroundColor: '#b0bec5',
  },
  textoBotonGuardar: {
    color: colores.textoClaro,
    fontSize: 18,
    fontWeight: 'bold',
  },
  textoEspera: {
    marginTop: 16,
    fontSize: 16,
    color: colores.texto,
  },
});

export default PantallaCalificarEvaluacion;
