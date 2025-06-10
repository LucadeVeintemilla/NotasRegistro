import { Picker } from '@react-native-picker/picker';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colores } from '../estilos/estilosGlobales';
import { registro } from '../servicios/auth/authService';

const PantallaRegistro = ({ navigation }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    cedula: '',
    correo: '',
    telefono: '',
    contraseña: '',
    confirmarContraseña: '',
    tipo: 'lector'
  });
  const [cargando, setCargando] = useState(false);

  const handleChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleRegistro = async () => {
    if (!formData.nombre || !formData.apellido || !formData.cedula || !formData.correo || 
        !formData.telefono || !formData.contraseña || !formData.confirmarContraseña) {
      return Alert.alert('Error', 'Todos los campos son obligatorios');
    }

    if (formData.contraseña !== formData.confirmarContraseña) {
      return Alert.alert('Error', 'Las contraseñas no coinciden');
    }

    if (formData.contraseña.length < 6) {
      return Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
    }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.correo)) {
      return Alert.alert('Error', 'El formato del correo electrónico no es válido');
    }

    try {
      setCargando(true);
      
        const { confirmarContraseña, ...datosRegistro } = formData;
      
      const data = await registro(datosRegistro);
      
      Alert.alert(
        'Registro exitoso',
        'Se ha registrado correctamente',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.navigate('PantallaLogin');
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
      <View style={styles.logoContainer}>
        <Image
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.titulo}>Registro de Notas</Text>
      </View>
      
      <View style={styles.formContainer}>
        <Text style={styles.formTitulo}>Crear Cuenta</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nombre</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingrese su nombre"
            value={formData.nombre}
            onChangeText={(value) => handleChange('nombre', value)}
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Apellido</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingrese su apellido"
            value={formData.apellido}
            onChangeText={(value) => handleChange('apellido', value)}
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Cédula</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingrese su número de cédula"
            keyboardType="number-pad"
            value={formData.cedula}
            onChangeText={(value) => handleChange('cedula', value)}
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Correo Electrónico</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingrese su correo"
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
            placeholder="Ingrese su número de teléfono"
            keyboardType="phone-pad"
            value={formData.telefono}
            onChangeText={(value) => handleChange('telefono', value)}
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingrese su contraseña"
            secureTextEntry
            value={formData.contraseña}
            onChangeText={(value) => handleChange('contraseña', value)}
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Confirmar Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="Confirme su contraseña"
            secureTextEntry
            value={formData.confirmarContraseña}
            onChangeText={(value) => handleChange('confirmarContraseña', value)}
          />
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
              <Picker.Item label="Administrador" value="administrador" />
              <Picker.Item label="Director" value="director" />
              <Picker.Item label="Técnico" value="tecnico" />
              <Picker.Item label="Secretario" value="secretario" />
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
            <Text style={styles.textoBoton}>Registrarse</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.botonLogin}
          onPress={() => navigation.navigate('PantallaLogin')}
          disabled={cargando}
        >
          <Text style={styles.textoBotonLogin}>¿Ya tienes cuenta? Inicia sesión</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colores.primario,
    marginBottom: 5,
  },
  formContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  formTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colores.texto,
    marginBottom: 20,
    textAlign: 'center',
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
  },
  picker: {
    height: 50,
  },
  botonRegistro: {
    backgroundColor: colores.primario,
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  textoBoton: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  botonLogin: {
    padding: 15,
    alignItems: 'center',
  },
  textoBotonLogin: {
    color: colores.primario,
    fontSize: 14,
  },
});

export default PantallaRegistro;
