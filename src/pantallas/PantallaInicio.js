import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contextos/AuthContext';
import { colores } from '../estilos/estilosGlobales';
import { getCurrentUser, logout } from '../servicios/auth/authService';

/**
 * Pantalla principal que muestra la pantalla de inicio con opciones de navegación
 * @param {Object} props Propiedades del componente
 * @param {Object} props.navigation Objeto de navegación
 * @returns {React.Component} Componente de pantalla de inicio
 */
const PantallaInicio = ({ navigation }) => {
  const [usuario, setUsuario] = useState(null);
  const auth = useAuth(); 

  useEffect(() => {
    cargarUsuario();
  }, []);

  const cargarUsuario = async () => {
    const userData = await getCurrentUser();
    setUsuario(userData);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Está seguro que desea cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Cerrar Sesión',
          onPress: async () => {
            await logout();
            auth.refreshAuth();
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left', 'bottom']}>
      <StatusBar backgroundColor={colores.primario} barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Panel de Director</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <MaterialIcons name="exit-to-app" size={24} color={colores.textoClaro} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Bienvenido/a,</Text>
          <Text style={styles.userName}>{usuario ? `${usuario.nombre} ${usuario.apellido}` : 'Director'}</Text>
          <Text style={styles.userRole}>Director del Sistema</Text>
        </View>

        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Gestión de Evaluaciones</Text>
          
          <TouchableOpacity
            style={[styles.card, { backgroundColor: colores.primario }]}
            onPress={() => navigation.navigate('PantallaNuevaEvaluacion')}
          >
            <MaterialIcons name="add-circle" size={28} color="#fff" />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Nueva Evaluación</Text>
              <Text style={styles.cardDescription}>Registra una nueva evaluación para un estudiante</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.card, { backgroundColor: colores.secundario }]}
            onPress={() => navigation.navigate('PantallaBuscarEvaluaciones')}
          >
            <MaterialIcons name="search" size={28} color="#fff" />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Buscar Evaluaciones</Text>
              <Text style={styles.cardDescription}>Consulta evaluaciones realizadas anteriormente</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.card, { backgroundColor: colores.primario }]}
            onPress={() => navigation.navigate('CrearEstudiante')}
          >
            <MaterialIcons name="person-add" size={28} color="#fff" />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Crear Estudiante</Text>
              <Text style={styles.cardDescription}>Añadir nuevo estudiante para evaluación</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.card, { backgroundColor: colores.secundario }]}
            onPress={() => navigation.navigate('ProgramarEvaluacion')}
          >
            <MaterialIcons name="schedule" size={28} color="#fff" />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Programar Evaluación</Text>
              <Text style={styles.cardDescription}>Definir rango horario para evaluaciones</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Información</Text>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Rúbrica de Evaluación</Text>
            <Text style={styles.infoContent}>
              El sistema utiliza una rúbrica estandarizada con los siguientes criterios principales:
            </Text>
            <View style={styles.infoList}>
              <Text style={styles.infoItem}>• ACTITUD</Text>
              <Text style={styles.infoItem}>• CONTENIDO DE PRESENTACIÓN</Text>
              <Text style={styles.infoItem}>• EXPOSICIÓN</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
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
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 15,
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
  logoutButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  welcomeSection: {
    marginBottom: 25,
  },
  welcomeText: {
    fontSize: 16,
    color: colores.texto,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colores.texto,
    marginVertical: 5,
  },
  userRole: {
    fontSize: 14,
    color: colores.primario,
    fontWeight: '500',
  },
  cardSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: colores.texto,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  cardContent: {
    marginLeft: 15,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cardDescription: {
    color: '#fff',
    fontSize: 13,
    opacity: 0.9,
  },
  infoCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: colores.texto,
  },
  infoContent: {
    fontSize: 14,
    color: colores.texto,
    marginBottom: 10,
  },
  infoList: {
    marginLeft: 10,
  },
  infoItem: {
    fontSize: 14,
    marginBottom: 5,
    color: colores.texto,
  },
});

export default PantallaInicio;
