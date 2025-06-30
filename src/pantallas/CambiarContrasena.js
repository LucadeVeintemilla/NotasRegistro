import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contextos/AuthContext';
import { colores } from '../estilos/estilosGlobales';
import { cambiarContraseña } from '../servicios/auth/authService';

const CambiarContrasena = ({ navigation }) => {
  const auth = useAuth();
  const [formData, setFormData] = useState({
    contraseñaActual: '',
    nuevaContraseña: '',
    confirmarContraseña: ''
  });
  const [cargando, setCargando] = useState(false);
  const { usuario } = useAuth();

  const handleChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.contraseñaActual || !formData.nuevaContraseña || !formData.confirmarContraseña) {
      return Alert.alert('Error', 'Todos los campos son obligatorios');
    }

    if (formData.nuevaContraseña !== formData.confirmarContraseña) {
      return Alert.alert('Error', 'Las contraseñas no coinciden');
    }

    if (formData.nuevaContraseña.length < 6) {
      return Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
    }

    try {
      setCargando(true);
      
      // Llamada a la API para cambiar la contraseña
      const response = await cambiarContraseña(formData.contraseñaActual, formData.nuevaContraseña);
      
      if (response.success) {
        // Si el backend devuelve un nuevo token, actualizarlo
        if (response.token) {
          await AsyncStorage.setItem('token', response.token);
        }
        
        Alert.alert(
          'Éxito',
          'Contraseña actualizada correctamente. Por favor, inicie sesión nuevamente.',
          [
            {
              text: 'OK',
              onPress: async () => {
                // Cerrar sesión después de cambiar la contraseña
                await auth.cerrarSesion();
                navigation.replace('PantallaLogin');
              }
            }
          ]
        );
      } else {
        throw new Error(response.message || 'Error al cambiar la contraseña');
      }
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      const errorMessage = error.response?.data?.message || error.message || 'No se pudo cambiar la contraseña';
      Alert.alert('Error', errorMessage);
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
        <Text style={styles.headerTitle}>Cambiar Contraseña</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Contraseña Actual</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingrese su contraseña actual"
            secureTextEntry
            value={formData.contraseñaActual}
            onChangeText={(text) => handleChange('contraseñaActual', text)}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nueva Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingrese su nueva contraseña"
            secureTextEntry
            value={formData.nuevaContraseña}
            onChangeText={(text) => handleChange('nuevaContraseña', text)}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Confirmar Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="Confirme su nueva contraseña"
            secureTextEntry
            value={formData.confirmarContraseña}
            onChangeText={(text) => handleChange('confirmarContraseña', text)}
          />
        </View>

        <TouchableOpacity 
          style={[styles.button, cargando && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={cargando}
        >
          {cargando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Guardar Cambios</Text>
          )}
        </TouchableOpacity>
      </View>
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
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  formContainer: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: colores.primario,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CambiarContrasena;
