import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Alert, Platform, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contextos/AuthContext';
import { colores } from '../estilos/estilosGlobales';
import { getCurrentUser, logout } from '../servicios/auth/authService';

const PantallaInicioTecnico = ({ navigation }) => {
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
        <Text style={styles.headerTitle}>Panel de Técnico</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <MaterialIcons name="exit-to-app" size={24} color={colores.textoClaro} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Bienvenido/a,</Text>
          <Text style={styles.userName}>{usuario ? `${usuario.nombre} ${usuario.apellido}` : 'Técnico'}</Text>
          <Text style={styles.userRole}>Técnico del Sistema</Text>
        </View>

        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Gestión de Usuarios</Text>
          
          <TouchableOpacity
            style={[styles.card, { backgroundColor: colores.primario }]}
            onPress={() => navigation.navigate('PantallaRegistroUsuarios')}
          >
            <MaterialIcons name="person-add" size={28} color="#fff" />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Registrar Usuario</Text>
              <Text style={styles.cardDescription}>Añadir nuevo usuario con rol Lector o Director</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Información</Text>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Funcionalidades del Técnico</Text>
            <Text style={styles.infoContent}>
              Como técnico del sistema, tiene acceso a las siguientes funcionalidades:
            </Text>
            <View style={styles.infoList}>
              <Text style={styles.infoItem}>• Registrar nuevos usuarios con rol Lector</Text>
              <Text style={styles.infoItem}>• Registrar nuevos usuarios con rol Director</Text>
              <Text style={styles.infoItem}>• Gestionar las cuentas creadas</Text>
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
    marginTop: 5,
  },
  infoItem: {
    fontSize: 14,
    color: colores.texto,
    marginBottom: 5,
  },
});

export default PantallaInicioTecnico;
