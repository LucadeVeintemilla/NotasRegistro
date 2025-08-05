import { useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../contextos/AuthContext';
import { colores } from '../estilos/estilosGlobales';
import { login } from '../servicios/auth/authService';

const PantallaLogin = ({ navigation }) => {
  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [cargando, setCargando] = useState(false);
  const auth = useAuth(); 

  const handleLogin = async () => {
    if (!correo || !contraseña) {
      return Alert.alert('Error', 'Todos los campos son obligatorios');
    }

    try {
      setCargando(true);
      const data = await login(correo, contraseña);
      
 
      const alertButtons = [
        {
          text: 'OK',
          onPress: () => auth.refreshAuth()
        }
      ];
      if (data.usuario.tipo === 'lector') {
        alertButtons.push({
          text: 'Cambiar Contraseña',
          onPress: () => {
            navigation.navigate('CambiarContrasena');
          }
        });
      }

      Alert.alert(
        'Inicio de sesión exitoso',
        `Bienvenido ${data.usuario.nombre}`,
        alertButtons
      );
    } catch (error) {
      console.error('Error de login:', error);
      Alert.alert(
        'Error de autenticación',
        error.message || 'No se pudo iniciar sesión. Por favor, verifica tus credenciales.'
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
        <Text style={styles.titulo}>Sistema de Evaluación</Text>
        <Text style={styles.subtitulo}>Disertación Oral</Text>
        <Image
          source={require('../utilidades/Recurso 8.jpg')}
          style={styles.imagen}
          resizeMode="contain"
        />
      </View>
      
      <View style={styles.formContainer}>
        <Text style={styles.formTitulo}>Iniciar Sesión</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Correo Electrónico</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingrese su correo"
            keyboardType="email-address"
            autoCapitalize="none"
            value={correo}
            onChangeText={setCorreo}
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingrese su contraseña"
            secureTextEntry
            value={contraseña}
            onChangeText={setContraseña}
          />
        </View>
        
        <TouchableOpacity 
          style={styles.botonLogin}
          onPress={handleLogin}
          disabled={cargando}
        >
          {cargando ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.textoBoton}>Iniciar Sesión</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.botonRegistro}
          onPress={() => navigation.navigate('PantallaRegistro')}
          disabled={cargando}
        >
          <Text style={styles.textoBotonRegistro}>¿No tienes cuenta? Regístrate</Text>
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
    marginVertical: 30,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 10,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colores.primario,
    marginBottom: 5,
  },
  subtitulo: {
    fontSize: 16,
    color: colores.texto,
    marginBottom: 10,
  },
  imagen: {
    width: 200,
    height: 150,
    marginBottom: 20,
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
  botonLogin: {
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
  botonRegistro: {
    padding: 15,
    alignItems: 'center',
  },
  textoBotonRegistro: {
    color: colores.primario,
    fontSize: 14,
  },
});

export default PantallaLogin;
