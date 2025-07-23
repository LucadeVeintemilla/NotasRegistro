import { Picker } from '@react-native-picker/picker';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../contextos/AuthContext';
import { colores } from '../estilos/estilosGlobales';
import { registrarPorTecnico } from '../servicios/auth/authService';
import validarCedula from '../utils/validarCedula';

const PantallaRegistroUsuarios = ({ navigation }) => {
  const [tipoDocumento, setTipoDocumento] = useState('cedula');
  const [errorCedula, setErrorCedula] = useState('');
  
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    cedula: '',
    correo: '',
    telefono: '',
    contraseña: '',
    tipo: 'lector'
  });
  const [cargando, setCargando] = useState(false);
  const auth = useAuth();

  const handleChange = (name, value) => {
    if (name === 'cedula') {
      if (tipoDocumento === 'cedula') {
      if (value.length === 10) {
        setErrorCedula(validarCedula(value) ? '' : 'Cédula inválida');
      } else {
        setErrorCedula('');
      }
    }
  }
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleRegistro = async () => {
    if (!formData.nombre || !formData.apellido || !formData.cedula || !formData.correo || 
        !formData.telefono) {
      return Alert.alert('Error', 'Todos los campos son obligatorios');
    }

    if (tipoDocumento === 'cedula' && errorCedula) {
      return Alert.alert('Error', errorCedula);
    }
    
    const datosEnvio = {
      ...formData,
      tipoDocumento,
      contraseña: formData.cedula
    };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.correo)) {
      return Alert.alert('Error', 'El formato del correo electrónico no es válido');
    }

    if (formData.tipo !== 'lector' && formData.tipo !== 'director') {
      return Alert.alert('Error', 'Solo puede registrar usuarios con rol de lector o director');
    }

    try {
      setCargando(true);
      
      const data = await registrarPorTecnico(datosEnvio);
      
      Alert.alert(
        'Registro exitoso',
        `Se ha registrado un nuevo usuario con rol de ${formData.tipo}`,
        [
          {
            text: 'OK',
            onPress: () => {
              setFormData({
                nombre: '',
                apellido: '',
                cedula: '',
                correo: '',
                telefono: '',
                contraseña: '',
                tipo: 'lector'
              });
              navigation.navigate('PantallaInicioSecretario');
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error de registro:', error);
      Alert.alert(
        'Error de registro',
        error.message || 'No se pudo completar el registro. Inténtelo nuevamente.'
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={28} color="#fff" />
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Registro de Usuarios</Text>
      </View>
      
      <View style={styles.formContainer}>
        <Text style={styles.formTitulo}>Crear Nuevo Usuario</Text>
        
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
          <Text style={styles.label}>Tipo de Documento</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={tipoDocumento}
              style={styles.picker}
              onValueChange={(value) => {
                setTipoDocumento(value);
                setErrorCedula('');
              }}
            >
              <Picker.Item label="Cédula" value="cedula" />
              <Picker.Item label="Pasaporte" value="pasaporte" />
            </Picker>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{tipoDocumento === 'cedula' ? 'Cédula' : 'Pasaporte'}</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingrese el número de identificación"
            keyboardType="number-pad"
            value={formData.cedula}
            onChangeText={(value) => handleChange('cedula', value)}
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Correo Electrónico</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingrese el correo"
            keyboardType="email-address"
            autoCapitalize="none"
            value={formData.correo}
            onChangeText={(value) => handleChange('correo', value)}
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Teléfono</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingrese el número de teléfono"
            keyboardType="phone-pad"
            value={formData.telefono}
            onChangeText={(value) => handleChange('telefono', value)}
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.nota}>
            <Text style={{fontWeight: 'bold'}}>Nota:</Text> La contraseña se establecerá automáticamente como el número de cédula del usuario.
          </Text>
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tipo de Usuario</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.tipo}
              style={styles.picker}
              onValueChange={(value) => handleChange('tipo', value)}
            >
              <Picker.Item label="Lector" value="lector" />
              <Picker.Item label="Director" value="director" />
            </Picker>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.botonRegistro}
          onPress={handleRegistro}
          disabled={cargando}
        >
          {cargando ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.textoBoton}>Registrar Usuario</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: colores.primario,
    padding: 15,
    paddingVertical: 55,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 12,
    marginRight: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 5,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  formContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formTitulo: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: colores.primario,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    color: colores.texto,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  pickerContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  picker: {
    height: 50,
  },
  botonRegistro: {
    backgroundColor: colores.primario,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  textoBoton: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  nota: {
    color: '#666',
    fontSize: 14,
    marginTop: 5,
    fontStyle: 'italic',
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 5,
    borderLeftWidth: 3,
    borderLeftColor: colores.primario
  },
});

export default PantallaRegistroUsuarios;
