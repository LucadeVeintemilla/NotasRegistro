import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Modal,
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
  const [menuVisible, setMenuVisible] = useState(false);
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

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const handleCambiarContraseña = () => {
    setMenuVisible(false);
    navigation.navigate('CambiarContrasena');
  };

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left', 'bottom']}>
      <StatusBar backgroundColor={colores.primario} barStyle="light-content" />
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Bienvenido, {usuario?.nombre || 'Usuario'}</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity 
            style={[styles.iconButton, { marginRight: 15 }]}
            onPress={toggleMenu}
          >
            <MaterialIcons name="account-circle" size={28} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => navigation.navigate('PantallaAyuda')}
          >
            <MaterialIcons name="help-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        
        <Modal
          transparent={true}
          visible={menuVisible}
          animationType="fade"
          onRequestClose={() => setMenuVisible(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setMenuVisible(false)}
          >
            <View style={styles.menuContainer}>
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={handleCambiarContraseña}
              >
                <MaterialIcons name="lock" size={20} color={colores.primario} style={styles.menuIcon} />
                <Text style={styles.menuText}>Cambiar Contraseña</Text>
              </TouchableOpacity>
              <View style={styles.divider} />
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={handleLogout}
              >
                <MaterialIcons name="exit-to-app" size={20} color="#e74c3c" style={styles.menuIcon} />
                <Text style={[styles.menuText, { color: '#e74c3c' }]}>Cerrar Sesión</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
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
              <Text style={styles.cardDescription}>Añadir nuevo estudiante para disertación</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.card, { backgroundColor: colores.secundario }]}
            onPress={() => navigation.navigate('ProgramarEvaluacion')}
          >
            <MaterialIcons name="schedule" size={28} color="#fff" />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Programar Disertación</Text>
              <Text style={styles.cardDescription}>Definir rango horario para disertaciones</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Información</Text>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Rúbrica de Disertación</Text>
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
    padding: 45,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    paddingTop: 60,
    paddingRight: 20,
    alignItems: 'flex-end',
  },
  menuContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    width: 220,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  menuIcon: {
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  menuText: {
    fontSize: 16,
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 4,
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
