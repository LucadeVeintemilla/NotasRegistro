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
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { guardarEvaluacion, obtenerRubricaCompleta } from '../basedatos/rubricaServicio';
import Cabecera from '../componentes/Cabecera';
import CriterioEvaluacion from '../componentes/CriterioEvaluacion';
import { colores, estilosGlobales } from '../estilos/estilosGlobales';
import { getCurrentUser, setAuthToken } from '../servicios/auth/authService';
import { getApiUrl } from '../config/api';

/**
 * Pantalla para registrar una nueva evaluación
 * @param {Object} props Propiedades del componente
 * @param {Object} props.navigation Objeto de navegación
 * @returns {React.Component} Componente de pantalla de nueva evaluación
 */
const PantallaNuevaEvaluacion = ({ route, navigation }) => {
  const { evaluacionId } = route.params || {};
  const [rubrica, setRubrica] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [datosEstudiante, setDatosEstudiante] = useState({
    nombre: '',
    apellido: '',
    codigo: '',
    maestria: '',
    tutor: '',
  });
  const [titulo, setTitulo] = useState('');
  const [valoresSeleccionados, setValoresSeleccionados] = useState({});
  const [puntajeTotal, setPuntajeTotal] = useState(0);

  const [esEditable, setEsEditable] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true);
        const datosRubrica = await obtenerRubricaCompleta();
        setRubrica(datosRubrica);
        
        if (evaluacionId) {
          await setAuthToken();
          const response = await axios.get(getApiUrl(`/api/evaluaciones/${evaluacionId}`));
          setEvaluacion(response.data.data);
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

  const validarFormulario = () => {
    if (!datosEstudiante.nombre.trim()) {
      Alert.alert('Error', 'El nombre del estudiante es obligatorio');
      return false;
    }
    if (!datosEstudiante.apellido.trim()) {
      Alert.alert('Error', 'El apellido del estudiante es obligatorio');
      return false;
    }
    if (!datosEstudiante.codigo.trim()) {
      Alert.alert('Error', 'El código del estudiante es obligatorio');
      return false;
    }
    if (!datosEstudiante.tutor.trim()) {
      Alert.alert('Error', 'El tutor asignado es obligatorio');
      return false;
    }
    if (!titulo.trim()) {
      Alert.alert('Error', 'El título de la evaluación es obligatorio');
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

  const guardarNuevaEvaluacion = async () => {
    if (!validarFormulario()) {
      return;
    }

    setEnviando(true);

    try {
      await setAuthToken();
      const userData = await getCurrentUser();
      
      if (!userData || !userData.id) {
        throw new Error('No se pudo obtener información del usuario');
      }

      const estudianteResponse = await axios.post(
        getApiUrl('/api/estudiantes'),
        {
          nombre: datosEstudiante.nombre,
          apellido: datosEstudiante.apellido,
          codigo: datosEstudiante.codigo,
          maestria: datosEstudiante.maestria || '',
          tutor: datosEstudiante.tutor,
          tesis: titulo
        }
      );

      const resultadosFormateados = [];
      Object.entries(valoresSeleccionados).forEach(([indicadorId, valor]) => {
        for (const criterio of rubrica) {
          const indicador = criterio.indicadores.find(i => i.id === parseInt(indicadorId));
          if (indicador) {
            resultadosFormateados.push({
              criterio: criterio.criterio,
              indicador: {
                id: parseInt(indicadorId),
                nombre: indicador.nombre,
                opciones: indicador.opciones
              },
              valorSeleccionado: valor
            });
            break;
          }
        }
      });

      const ahora = new Date();
      const horarioFin = new Date(ahora.getTime() + (30 * 60000)); 
      
      const nuevaEvaluacion = {
        estudiante: estudianteResponse.data.data._id,
        evaluador: userData.id,
        titulo: titulo,
        notaFinal: parseFloat(puntajeTotal.toFixed(2)),
        horarioInicio: ahora.toISOString(),
        horarioFin: horarioFin.toISOString(),
        estado: 'completada',
        resultados: resultadosFormateados,
        fecha: ahora.toISOString(),
        createdBy: userData.id
      };

      console.log('Enviando evaluación:', JSON.stringify(nuevaEvaluacion, null, 2));

      const evaluacionResponse = await axios.post(
        getApiUrl('/api/evaluaciones'),
        nuevaEvaluacion
      );

      Alert.alert(
        'Éxito',
        'La evaluación se ha guardado correctamente',
        [
          {
            text: 'Ver Detalle',
            onPress: () => {
              navigation.replace('PantallaDetalleEvaluacion', { 
                evaluacionId: evaluacionResponse.data.data._id 
              });
            },
          },
          {
            text: 'Volver al Inicio',
            onPress: () => {
              switch (userData.tipo) {
                case 'director':
                  navigation.navigate('PantallaInicio');
                  break;
                case 'lector':
                  navigation.navigate('PantallaInicioLector');
                  break;
                default:
                  navigation.goBack();
              }
            },
          },
        ]
      );

    } catch (error) {
      console.error('Error al guardar la evaluación:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error details:', error.response?.data?.message || error.message);
      
      Alert.alert(
        'Error', 
        `No se pudo guardar la evaluación. ${error.response?.data?.message || 'Verifique los datos e intente nuevamente.'}`
      );
    } finally {
      setEnviando(false);
    }
  };

  if (cargando) {
    return (
      <View style={estilosGlobales.contenedorCentrado}>
        <ActivityIndicator size="large" color={colores.primario} />
        <Text style={styles.textoEspera}>Cargando rúbrica...</Text>
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
        titulo="Nueva Evaluación" 
        onAtras={() => navigation.goBack()} 
      />
      <ScrollView contentContainerStyle={styles.contenido}>
        <View style={styles.seccion}>
          <Text style={styles.tituloSeccion}>Datos del Estudiante</Text>
          <View style={styles.campo}>
            <Text style={styles.etiqueta}>Nombre:</Text>
            {esEditable ? (
              <TextInput
                style={estilosGlobales.input}
                value={datosEstudiante.nombre}
                onChangeText={(texto) => setDatosEstudiante({ ...datosEstudiante, nombre: texto })}
                placeholder="Nombre del estudiante"
              />
            ) : (
              <View style={styles.campoNoEditable}>
                <Text style={styles.textoNoEditable}>{datosEstudiante.nombre}</Text>
              </View>
            )}
          </View>
          <View style={styles.campo}>
            <Text style={styles.etiqueta}>Apellido:</Text>
            {esEditable ? (
              <TextInput
                style={estilosGlobales.input}
                value={datosEstudiante.apellido}
                onChangeText={(texto) => setDatosEstudiante({ ...datosEstudiante, apellido: texto })}
                placeholder="Apellido del estudiante"
              />
            ) : (
              <View style={styles.campoNoEditable}>
                <Text style={styles.textoNoEditable}>{datosEstudiante.apellido}</Text>
              </View>
            )}
          </View>
          <View style={styles.campo}>
            <Text style={styles.etiqueta}>Código:</Text>
            {esEditable ? (
              <TextInput
                style={estilosGlobales.input}
                value={datosEstudiante.codigo}
                onChangeText={(texto) => setDatosEstudiante({ ...datosEstudiante, codigo: texto })}
                placeholder="Código del estudiante"
              />
            ) : (
              <View style={styles.campoNoEditable}>
                <Text style={styles.textoNoEditable}>{datosEstudiante.codigo}</Text>
              </View>
            )}
          </View>
          <View style={styles.campo}>
            <Text style={styles.etiqueta}>Maestría:</Text>
            {esEditable ? (
              <TextInput
                style={estilosGlobales.input}
                value={datosEstudiante.maestria}
                onChangeText={(texto) => setDatosEstudiante({ ...datosEstudiante, maestria: texto })}
                placeholder="Ingrese la maestría del estudiante"
              />
            ) : (
              <View style={styles.campoNoEditable}>
                <Text style={styles.textoNoEditable}>{datosEstudiante.maestria}</Text>
              </View>
            )}
          </View>
          <View style={styles.campo}>
            <Text style={styles.etiqueta}>Tutor Asignado:</Text>
            {esEditable ? (
              <TextInput
                style={estilosGlobales.input}
                value={datosEstudiante.tutor}
                onChangeText={(texto) => setDatosEstudiante({ ...datosEstudiante, tutor: texto })}
                placeholder="Nombre del tutor asignado"
              />
            ) : (
              <View style={styles.campoNoEditable}>
                <Text style={styles.textoNoEditable}>{datosEstudiante.tutor}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.seccion}>
          <Text style={styles.tituloSeccion}>Datos de la Disertación</Text>
          <View style={styles.campo}>
            <Text style={styles.etiqueta}>Título:</Text>
            <TextInput
              style={estilosGlobales.input}
              value={titulo}
              onChangeText={setTitulo}
              placeholder="Título de la evaluación (ej. Defensa de Tesis)"
            />
          </View>
          <View style={styles.campo}>
            <Text style={styles.etiqueta}>Fecha:</Text>
            <Text style={styles.textoFecha}>{new Date().toLocaleDateString()}</Text>
          </View>
        </View>

        <View style={styles.seccion}>
          <Text style={styles.tituloSeccion}>Rúbrica de Disertación</Text>
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
          onPress={guardarNuevaEvaluacion}
          disabled={enviando}
        >
          {enviando ? (
            <ActivityIndicator size="small" color={colores.textoClaro} />
          ) : (
            <Text style={styles.textoBotonGuardar}>Guardar Disertación</Text>
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
});

export default PantallaNuevaEvaluacion;
