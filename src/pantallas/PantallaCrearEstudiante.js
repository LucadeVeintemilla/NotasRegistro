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
import { MaterialIcons } from '@expo/vector-icons';
import { colores } from '../estilos/estilosGlobales';
import { setAuthToken } from '../servicios/auth/authService';

const PantallaCrearEstudiante = ({ navigation }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    codigo: '',
    curso: '',
    tesis: ''
  });
  const [cargando, setCargando] = useState(false);

  const handleChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async () => {
    if (!formData.nombre || !formData.apellido || !formData.codigo || !formData.curso || !formData.tesis) {
      return Alert.alert('Error', 'Todos los campos son obligatorios');
    }

    try {
      setCargando(true);
      await setAuthToken();
      
      const response = await axios.post(
        'http://192.168.100.35:3000/api/estudiantes',
        formData
      );
      
      Alert.alert(
        'Éxito',
        'Estudiante creado correctamente',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('ProgramarEvaluacion', { estudiante: response.data.data })
          }
        ]
      );
    } catch (error) {
      console.error('Error al crear estudiante:', error);
      const mensaje = error.response?.data?.message || 'Error al crear estudiante';
      Alert.alert('Error', mensaje);
    } finally {
      setCargando(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crear Estudiante</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Información del Estudiante</Text>
          <Text style={styles.formDescription}>Complete los datos del estudiante para crear una nueva evaluación</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingrese el nombre"
              value={formData.nombre}
              onChangeText={(value) => handleChange('nombre', value)}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Apellido</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingrese el apellido"
              value={formData.apellido}
              onChangeText={(value) => handleChange('apellido', value)}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Código</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingrese el código o ID del estudiante"
              value={formData.codigo}
              onChangeText={(value) => handleChange('codigo', value)}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Curso</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingrese el curso del estudiante"
              value={formData.curso}
              onChangeText={(value) => handleChange('curso', value)}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Título de Tesis</Text>
            <TextInput
              style={styles.inputMultiline}
              placeholder="Ingrese el título de la tesis"
              value={formData.tesis}
              onChangeText={(value) => handleChange('tesis', value)}
              multiline
              numberOfLines={3}
            />
          </View>
          
          <TouchableOpacity
            style={[styles.submitButton, cargando && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={cargando}
          >
            {cargando ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <MaterialIcons name="save" size={24} color="#fff" />
                <Text style={styles.submitButtonText}>Guardar Estudiante</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    padding: 5,
  },
  content: {
    flex: 1,
    padding: 15,
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
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  inputMultiline: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 80,
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
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default PantallaCrearEstudiante;
