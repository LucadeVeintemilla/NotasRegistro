import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Cabecera from '../componentes/Cabecera';
import { colores, estilosGlobales } from '../estilos/estilosGlobales';
import { setAuthToken } from '../servicios/auth/authService';

const PantallaAsignarHorario = ({ navigation }) => {
  const [horario, setHorario] = useState({
    evaluacionId: '',
    fecha: new Date(),
    horarioInicio: new Date(),
    horarioFin: new Date(),
  });
  const [enviando, setEnviando] = useState(false);
  const [mostrarSelectorFecha, setMostrarSelectorFecha] = useState(false);
  const [mostrarSelectorInicio, setMostrarSelectorInicio] = useState(false);
  const [mostrarSelectorFin, setMostrarSelectorFin] = useState(false);

  const validarFormulario = () => {
    if (!horario.evaluacionId.trim()) {
      Alert.alert('Error', 'El ID de la evaluación es obligatorio');
      return false;
    }
    if (horario.horarioFin <= horario.horarioInicio) {
      Alert.alert('Error', 'La hora de fin debe ser posterior a la hora de inicio');
      return false;
    }
    return true;
  };

  const guardarHorario = async () => {
    if (!validarFormulario()) return;

    setEnviando(true);
    try {
      await setAuthToken();
      await axios.post('http://192.168.100.35:3000/api/horarios', horario);
      Alert.alert(
        'Éxito',
        'Horario asignado correctamente',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error al asignar horario:', error);
      Alert.alert('Error', 'No se pudo asignar el horario. Por favor, intente nuevamente.');
    } finally {
      setEnviando(false);
    }
  };

  const formatearFecha = (fecha) => {
    return fecha.toLocaleDateString();
  };

  const formatearHora = (fecha) => {
    return fecha.toLocaleTimeString().substring(0, 5);
  };

  return (
    <View style={estilosGlobales.contenedor}>
      <Cabecera 
        titulo="Asignar Horario" 
        onAtras={() => navigation.goBack()} 
      />
      
      <ScrollView contentContainerStyle={styles.contenido}>
        <View style={styles.seccion}>
          <Text style={styles.tituloSeccion}>Datos del Horario</Text>
          
          <View style={styles.campo}>
            <Text style={styles.etiqueta}>ID de Evaluación:</Text>
            <TextInput
              style={estilosGlobales.input}
              value={horario.evaluacionId}
              onChangeText={(texto) => setHorario({ ...horario, evaluacionId: texto })}
              placeholder="ID de la evaluación"
            />
          </View>

          <View style={styles.campo}>
            <Text style={styles.etiqueta}>Fecha:</Text>
            <TouchableOpacity
              style={styles.selectorFecha}
              onPress={() => setMostrarSelectorFecha(true)}
            >
              <Text style={styles.textoSelector}>{formatearFecha(horario.fecha)}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.campo}>
            <Text style={styles.etiqueta}>Hora de Inicio:</Text>
            <TouchableOpacity
              style={styles.selectorFecha}
              onPress={() => setMostrarSelectorInicio(true)}
            >
              <Text style={styles.textoSelector}>{formatearHora(horario.horarioInicio)}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.campo}>
            <Text style={styles.etiqueta}>Hora de Fin:</Text>
            <TouchableOpacity
              style={styles.selectorFecha}
              onPress={() => setMostrarSelectorFin(true)}
            >
              <Text style={styles.textoSelector}>{formatearHora(horario.horarioFin)}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {mostrarSelectorFecha && (
          <DateTimePicker
            value={horario.fecha}
            mode="date"
            onChange={(event, selectedDate) => {
              setMostrarSelectorFecha(false);
              if (selectedDate) {
                setHorario({ ...horario, fecha: selectedDate });
              }
            }}
          />
        )}

        {mostrarSelectorInicio && (
          <DateTimePicker
            value={horario.horarioInicio}
            mode="time"
            onChange={(event, selectedTime) => {
              setMostrarSelectorInicio(false);
              if (selectedTime) {
                setHorario({ ...horario, horarioInicio: selectedTime });
              }
            }}
          />
        )}

        {mostrarSelectorFin && (
          <DateTimePicker
            value={horario.horarioFin}
            mode="time"
            onChange={(event, selectedTime) => {
              setMostrarSelectorFin(false);
              if (selectedTime) {
                setHorario({ ...horario, horarioFin: selectedTime });
              }
            }}
          />
        )}

        <TouchableOpacity
          style={[styles.botonGuardar, enviando && styles.botonDeshabilitado]}
          onPress={guardarHorario}
          disabled={enviando}
        >
          {enviando ? (
            <ActivityIndicator size="small" color={colores.textoClaro} />
          ) : (
            <Text style={styles.textoBotonGuardar}>Asignar Horario</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
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
    marginBottom: 16,
  },
  campo: {
    marginBottom: 16,
  },
  etiqueta: {
    fontSize: 16,
    color: colores.texto,
    marginBottom: 4,
  },
  selectorFecha: {
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: 4,
    padding: 12,
    backgroundColor: '#ffffff',
  },
  textoSelector: {
    fontSize: 16,
    color: colores.texto,
  },
  botonGuardar: {
    backgroundColor: colores.primario,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
  },
  botonDeshabilitado: {
    opacity: 0.6,
  },
  textoBotonGuardar: {
    color: colores.textoClaro,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PantallaAsignarHorario;
