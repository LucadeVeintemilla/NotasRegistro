import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { colores } from '../estilos/estilosGlobales';
import { getCurrentUser, getUserRole, setAuthToken } from '../servicios/auth/authService';
import { getApiUrl } from '../config/api';

const ProgramarEvaluacion = ({ route, navigation }) => {
  const estudianteSeleccionado = route.params?.estudiante;
  
  const [estudiantes, setEstudiantes] = useState([]);
  const [evaluadores, setEvaluadores] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [cargandoDatos, setCargandoDatos] = useState(true);
  
  const [formData, setFormData] = useState({
    estudiante: estudianteSeleccionado?._id || '',
    evaluador: '',
    titulo: estudianteSeleccionado?.tesis || '',
    horarioInicio: new Date(),
    horarioFin: new Date(new Date().getTime() + 60 * 60 * 1000), 
    notaFinal: 0, 
    estado: 'pendiente' 
  });
  
  const [mostrarSelectorInicioFecha, setMostrarSelectorInicioFecha] = useState(false);
  const [mostrarSelectorInicioHora, setMostrarSelectorInicioHora] = useState(false);
  const [mostrarSelectorFinFecha, setMostrarSelectorFinFecha] = useState(false);
  const [mostrarSelectorFinHora, setMostrarSelectorFinHora] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargandoDatos(true);
      await setAuthToken();
      
      const respEstudiantes = await axios.get(getApiUrl('/api/estudiantes'));
      setEstudiantes(respEstudiantes.data.data);
      
      const respUsuarios = await axios.get(getApiUrl('/api/auth/usuarios?tipo=lector'));
      setEvaluadores(respUsuarios.data.data);
      
      if (estudianteSeleccionado) {
        setFormData(prev => ({
          ...prev,
          estudiante: estudianteSeleccionado._id,
          titulo: estudianteSeleccionado.tesis
        }));
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos necesarios');
    } finally {
      setCargandoDatos(false);
    }
  };

  const handleChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const ajustarFecha = (campo, unidad, cantidad) => {
    try {
      const fechaActual = new Date(formData[campo].getTime());
      
      if (unidad === 'day') {
        fechaActual.setDate(fechaActual.getDate() + cantidad);
      } else if (unidad === 'hour') {
        fechaActual.setHours(fechaActual.getHours() + cantidad);
      } else if (unidad === 'minute') {
        fechaActual.setMinutes(fechaActual.getMinutes() + cantidad);
      }
      
      if (campo === 'horarioInicio') {
        const horarioFin = formData.horarioFin;
        
        if (fechaActual >= horarioFin) {
          const nuevaFechaFin = new Date(fechaActual.getTime() + 60 * 60 * 1000);
          setFormData({
            ...formData,
            horarioInicio: fechaActual,
            horarioFin: nuevaFechaFin
          });
        } else {
         
          setFormData({
            ...formData,
            horarioInicio: fechaActual
          });
        }
      } else if (campo === 'horarioFin') {
        const horarioInicio = formData.horarioInicio;
        
        if (fechaActual <= horarioInicio) {
          Alert.alert('Error', 'La fecha de fin debe ser posterior a la de inicio');
        } else {
          setFormData({
            ...formData,
            horarioFin: fechaActual
          });
        }
      }
    } catch (error) {
      console.error('Error al ajustar fecha:', error);
    }
  };

  const handleSubmit = async () => {
    if (!formData.estudiante || !formData.evaluador || !formData.titulo) {
      return Alert.alert('Error', 'Todos los campos son obligatorios');
    }

    if (formData.horarioInicio >= formData.horarioFin) {
      return Alert.alert('Error', 'La hora de fin debe ser posterior a la hora de inicio');
    }

    try {
      setCargando(true);
      await setAuthToken();

      const currentUser = await getCurrentUser(); 

      const dataToSubmit = {
        estudiante: formData.estudiante,
        evaluador: formData.evaluador,
        titulo: formData.titulo,
        notaFinal: 0,
        horarioInicio: formData.horarioInicio.toISOString(),
        horarioFin: formData.horarioFin.toISOString(),
        estado: 'pendiente',
        fecha: new Date().toISOString(),
        resultados: [], 
        createdBy: currentUser?._id 
      };
      
      const config = {
        headers: {
          'Authorization': `Bearer ${await AsyncStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      };

      const response = await axios.post(
        'http://192.168.100.35:3000/api/evaluaciones',
        dataToSubmit,
        config
      );
      
      const userRole = await getUserRole();
      
      Alert.alert(
        'Éxito',
        'Evaluación programada correctamente',
        [
          {
            text: 'OK',
            onPress: () => {
              switch (userRole) {
                case 'director':
                  navigation.navigate('PantallaInicio');
                  break;
                case 'administrador':
                  navigation.navigate('PantallaInicioAdmin');
                  break;
                case 'lector':
                  navigation.navigate('PantallaInicioLector');
                  break;
                case 'secretario':
                  navigation.navigate('PantallaInicioSecretario');
                  break;
                default:
                  navigation.goBack();
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error al programar evaluación:', error);
      const mensaje = error.response?.data?.message || 'Error al programar la evaluación';
      Alert.alert('Error', mensaje);
    } finally {
      setCargando(false);
    }
  };

  const formatDateTime = (date) => {
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatearFechaHora = (fecha) => {
    return fecha.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Programar Evaluación</Text>
        <View style={{ width: 24 }} />
      </View>

      {cargandoDatos ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colores.primario} />
          <Text style={styles.loadingText}>Cargando datos...</Text>
        </View>
      ) : (
        <ScrollView style={styles.content}>
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Detalles de la Evaluación</Text>
            <Text style={styles.formDescription}>Configure el horario y asigne un evaluador</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Estudiante</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.estudiante}
                  style={styles.picker}
                  onValueChange={(value) => handleChange('estudiante', value)}
                  enabled={!estudianteSeleccionado}
                >
                  <Picker.Item label="Seleccione un estudiante" value="" />
                  {estudiantes.map(estudiante => (
                    <Picker.Item 
                      key={estudiante._id} 
                      label={`${estudiante.nombre} ${estudiante.apellido} (${estudiante.codigo})`} 
                      value={estudiante._id} 
                    />
                  ))}
                </Picker>
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Evaluador (Lector)</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.evaluador}
                  style={styles.picker}
                  onValueChange={(value) => handleChange('evaluador', value)}
                >
                  <Picker.Item label="Seleccione un evaluador" value="" />
                  {evaluadores.map(evaluador => (
                    <Picker.Item 
                      key={evaluador._id} 
                      label={`${evaluador.nombre} ${evaluador.apellido}`} 
                      value={evaluador._id} 
                    />
                  ))}
                </Picker>
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Título de la Evaluación</Text>
              <TouchableOpacity 
                style={styles.input}
                onPress={() => {
                  if (formData.estudiante) {
                    const estudiante = estudiantes.find(e => e._id === formData.estudiante);
                    if (estudiante) {
                      handleChange('titulo', estudiante.tesis);
                    }
                  }
                }}
              >
                <Text style={formData.titulo ? styles.inputText : styles.inputPlaceholder}>
                  {formData.titulo || 'Título de la evaluación (click para usar título de tesis)'}
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.dateTimeSection}>
              <Text style={styles.sectionTitle}>Programación de Fecha y Hora</Text>
              
              <View style={styles.campo}>
                <Text style={styles.etiqueta}>Fecha y Hora de Inicio:</Text>
                <View style={styles.selectorContainer}>
                  <TouchableOpacity
                    style={[styles.selectorFecha, styles.selectorFechaMitad]}
                    onPress={() => setMostrarSelectorInicioFecha(true)}
                  >
                    <MaterialIcons name="calendar-today" size={18} color={colores.primario} />
                    <Text style={styles.textoSelector}>
                      {formData.horarioInicio.toLocaleDateString('es-ES')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.selectorFecha, styles.selectorFechaMitad]}
                    onPress={() => setMostrarSelectorInicioHora(true)}
                  >
                    <MaterialIcons name="access-time" size={18} color={colores.primario} />
                    <Text style={styles.textoSelector}>
                      {formData.horarioInicio.toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'})}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.campo}>
                <Text style={styles.etiqueta}>Fecha y Hora de Fin:</Text>
                <View style={styles.selectorContainer}>
                  <TouchableOpacity
                    style={[styles.selectorFecha, styles.selectorFechaMitad]}
                    onPress={() => setMostrarSelectorFinFecha(true)}
                  >
                    <MaterialIcons name="calendar-today" size={18} color={colores.primario} />
                    <Text style={styles.textoSelector}>
                      {formData.horarioFin.toLocaleDateString('es-ES')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.selectorFecha, styles.selectorFechaMitad]}
                    onPress={() => setMostrarSelectorFinHora(true)}
                  >
                    <MaterialIcons name="access-time" size={18} color={colores.primario} />
                    <Text style={styles.textoSelector}>
                      {formData.horarioFin.toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'})}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Selectores para fecha y hora de inicio */}
            {mostrarSelectorInicioFecha && (
              <DateTimePicker
                value={formData.horarioInicio}
                mode="date"
                onChange={(event, selectedDate) => {
                  setMostrarSelectorInicioFecha(false);
                  if (selectedDate && event.type !== 'dismissed') {
                    const currentTime = formData.horarioInicio;
                    selectedDate.setHours(currentTime.getHours(), currentTime.getMinutes());
                    setFormData({ ...formData, horarioInicio: selectedDate });
                  }
                }}
              />
            )}

            {mostrarSelectorInicioHora && (
              <DateTimePicker
                value={formData.horarioInicio}
                mode="time"
                onChange={(event, selectedTime) => {
                  setMostrarSelectorInicioHora(false);
                  if (selectedTime && event.type !== 'dismissed') {
                    const newDate = new Date(formData.horarioInicio);
                    newDate.setHours(selectedTime.getHours(), selectedTime.getMinutes());
                    setFormData({ ...formData, horarioInicio: newDate });
                  }
                }}
              />
            )}

            {/* Selectores para fecha y hora de fin */}
            {mostrarSelectorFinFecha && (
              <DateTimePicker
                value={formData.horarioFin}
                mode="date"
                onChange={(event, selectedDate) => {
                  setMostrarSelectorFinFecha(false);
                  if (selectedDate && event.type !== 'dismissed') {
                    const currentTime = formData.horarioFin;
                    selectedDate.setHours(currentTime.getHours(), currentTime.getMinutes());
                    setFormData({ ...formData, horarioFin: selectedDate });
                  }
                }}
              />
            )}

            {mostrarSelectorFinHora && (
              <DateTimePicker
                value={formData.horarioFin}
                mode="time"
                onChange={(event, selectedTime) => {
                  setMostrarSelectorFinHora(false);
                  if (selectedTime && event.type !== 'dismissed') {
                    const newDate = new Date(formData.horarioFin);
                    newDate.setHours(selectedTime.getHours(), selectedTime.getMinutes());
                    setFormData({ ...formData, horarioFin: newDate });
                  }
                }}
              />
            )}

            <TouchableOpacity
              style={[styles.botonGuardar, cargando && styles.botonDeshabilitado]}
              onPress={handleSubmit}
              disabled={cargando}
            >
              {cargando ? (
                <ActivityIndicator size="small" color={colores.textoClaro} />
              ) : (
                <Text style={styles.textoBotonGuardar}>Programar Evaluación</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: colores.primario,
    padding: 15,
    paddingVertical: 50,  
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 12,  
    backgroundColor: 'rgba(255,255,255,0.2)',  
    borderRadius: 8,  
    marginRight: 10,  
  },
  content: {
    flex: 1,
    padding: 15,
    paddingBottom: 80, 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colores.texto,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colores.texto,
    marginBottom: 5,
  },
  formDescription: {
    fontSize: 14,
    color: colores.textoSecundario,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: colores.texto,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
  },
  picker: {
    height: 50,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    minHeight: 50,
    justifyContent: 'center',
  },
  inputText: {
    fontSize: 16,
    color: colores.texto,
  },
  inputPlaceholder: {
    fontSize: 16,
    color: '#aaa',
  },
  dateTimeSection: {
    marginTop: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colores.texto,
    marginBottom: 5,
  },
  dateTimeDescription: {
    fontSize: 14,
    color: colores.textoSecundario,
    marginBottom: 15,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateTimeGroup: {
    flex: 1,
    marginHorizontal: 5,
  },
  dateTimeLabel: {
    fontSize: 14,
    marginBottom: 5,
    color: colores.texto,
  },
  fechasContainer: {
    marginVertical: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 10,
  },
  fechaItem: {
    marginBottom: 15,
  },
  fechaLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: colores.texto,
  },
  fechaValor: {
    fontSize: 16,
    color: colores.texto,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
  },
  botonesAjuste: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  botonAjuste: {
    backgroundColor: colores.primario,
    padding: 8,
    borderRadius: 5,
    marginVertical: 5,
    width: '31%',  
    alignItems: 'center',
  },
  textoBotonAjuste: {
    color: '#fff',
    fontWeight: 'bold',
  },
  dateTimePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
  },
  dateTimeText: {
    fontSize: 14,
    color: colores.texto,
    marginLeft: 5,
  },
  iosDatePicker: {
    marginTop: 10,
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
  submitContainer: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  submitButton: {
    backgroundColor: colores.primario,
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
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
  campo: {
    marginBottom: 16,
  },
  etiqueta: {
    fontSize: 16,
    color: colores.texto,
    marginBottom: 4,
  },
  botonGuardar: {
    backgroundColor: colores.primario,
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  botonDeshabilitado: {
    backgroundColor: '#ccc',
  },
  textoBotonGuardar: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProgramarEvaluacion;
