import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { colores, estilosGlobales } from '../estilos/estilosGlobales';
import Cabecera from '../componentes/Cabecera';
import CriterioEvaluacion from '../componentes/CriterioEvaluacion';
import { obtenerRubricaCompleta, guardarEvaluacion } from '../basedatos/rubricaServicio';

/**
 * Pantalla para registrar una nueva evaluación
 * @param {Object} props Propiedades del componente
 * @param {Object} props.navigation Objeto de navegación
 * @returns {React.Component} Componente de pantalla de nueva evaluación
 */
const PantallaNuevaEvaluacion = ({ navigation }) => {
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

  useEffect(() => {
    const cargarRubrica = async () => {
      try {
        const datos = await obtenerRubricaCompleta();
        setRubrica(datos);
        setCargando(false);
      } catch (error) {
        console.error('Error al cargar la rúbrica:', error);
        Alert.alert('Error', 'No se pudo cargar la rúbrica. Por favor, intente nuevamente.');
        setCargando(false);
        navigation.goBack();
      }
    };

    cargarRubrica();
  }, [navigation]);

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
      const notas = [];
      Object.entries(valoresSeleccionados).forEach(([indicadorId, valor]) => {
        notas.push({
          indicadorId: parseInt(indicadorId),
          valor,
        });
      });

      const nuevaEvaluacion = {
        titulo,
        fecha: new Date().toISOString().split('T')[0], // Formato YYYY-MM-DD
        estudiante: datosEstudiante,
        notas,
      };

      const evaluacionId = await guardarEvaluacion(nuevaEvaluacion);

      Alert.alert(
        'Éxito',
        'La evaluación se ha guardado correctamente',
        [
          {
            text: 'Ver Detalle',
            onPress: () => {
              navigation.replace('DetalleEvaluacion', { evaluacionId });
            },
          },
          {
            text: 'Volver al Inicio',
            onPress: () => {
              navigation.navigate('Inicio');
            },
          },
        ]
      );

      setEnviando(false);
    } catch (error) {
      console.error('Error al guardar la evaluación:', error);
      Alert.alert('Error', 'No se pudo guardar la evaluación. Por favor, intente nuevamente.');
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
            <TextInput
              style={estilosGlobales.input}
              value={datosEstudiante.nombre}
              onChangeText={(texto) => setDatosEstudiante({ ...datosEstudiante, nombre: texto })}
              placeholder="Nombre del estudiante"
            />
          </View>
          <View style={styles.campo}>
            <Text style={styles.etiqueta}>Apellido:</Text>
            <TextInput
              style={estilosGlobales.input}
              value={datosEstudiante.apellido}
              onChangeText={(texto) => setDatosEstudiante({ ...datosEstudiante, apellido: texto })}
              placeholder="Apellido del estudiante"
            />
          </View>
          <View style={styles.campo}>
            <Text style={styles.etiqueta}>Código:</Text>
            <TextInput
              style={estilosGlobales.input}
              value={datosEstudiante.codigo}
              onChangeText={(texto) => setDatosEstudiante({ ...datosEstudiante, codigo: texto })}
              placeholder="Código del estudiante"
            />
          </View>
          <View style={styles.campo}>
            <Text style={styles.etiqueta}>Curso/Grupo:</Text>
            <TextInput
              style={estilosGlobales.input}
              value={datosEstudiante.curso}
              onChangeText={(texto) => setDatosEstudiante({ ...datosEstudiante, curso: texto })}
              placeholder="Curso o grupo del estudiante"
            />
          </View>
        </View>

        <View style={styles.seccion}>
          <Text style={styles.tituloSeccion}>Datos de la Evaluación</Text>
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
          onPress={guardarNuevaEvaluacion}
          disabled={enviando}
        >
          {enviando ? (
            <ActivityIndicator size="small" color={colores.textoClaro} />
          ) : (
            <Text style={styles.textoBotonGuardar}>Guardar Evaluación</Text>
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
});

export default PantallaNuevaEvaluacion;
