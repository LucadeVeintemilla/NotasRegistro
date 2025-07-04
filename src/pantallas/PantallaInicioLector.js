import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import { useEffect, useState, useCallback } from 'react';
import { Alert, FlatList, Platform, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contextos/AuthContext';
import { colores } from '../estilos/estilosGlobales';
import { getCurrentUser, logout, setAuthToken } from '../servicios/auth/authService';
import { getApiUrl } from '../config/api';

const PantallaInicioLector = ({ navigation }) => {
  const [usuario, setUsuario] = useState(null);
  const [evaluacionesPendientes, setEvaluacionesPendientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const auth = useAuth(); 

  const cargarEvaluacionesPendientes = useCallback(async () => {
    try {
      setCargando(true);
      await setAuthToken();
      
      const response = await axios.get(getApiUrl('/api/evaluaciones'));
      
      const now = new Date();
      const pendientes = response.data.data.filter(evaluacion => {
        const inicio = new Date(evaluacion.horarioInicio);
        const fin = new Date(evaluacion.horarioFin);
        return evaluacion.estado === 'pendiente' && now >= inicio && now <= fin;
      });
      
      setEvaluacionesPendientes(pendientes);
    } catch (error) {
      console.error('Error al cargar evaluaciones:', error);
      Alert.alert('Error', 'No se pudieron cargar las evaluaciones pendientes');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    const cargarDatos = async () => {
      await cargarUsuario();
      await cargarEvaluacionesPendientes();
    };
    
    cargarDatos();
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

  const renderEvaluacionItem = ({ item }) => {
    const fin = new Date(item.horarioFin);
    const inicio = new Date(item.horarioInicio);
    const ahora = new Date(); 
    const tiempoRestante = fin - ahora;
    
    const horas = Math.floor(tiempoRestante / (1000 * 60 * 60));
    const minutos = Math.floor((tiempoRestante % (1000 * 60 * 60)) / (1000 * 60));
    
    const handlePress = () => {
      if (ahora < inicio) {
        Alert.alert(
          'Evaluación no disponible',
          'Esta evaluación aún no ha comenzado. Por favor, espere hasta la hora programada.',
          [{ text: 'OK' }]
        );
        return;
      }

      if (ahora > fin) {
        Alert.alert(
          'Evaluación expirada',
          'El tiempo para calificar esta evaluación ha expirado.',
          [{ text: 'OK' }]
        );
        return;
      }

      navigation.navigate('PantallaCalificarEvaluacion', { 
        evaluacionId: item._id,
        evaluacionCompleta: item,
        estudianteNombre: item.estudiante?.nombre || '',
        estudianteApellido: item.estudiante?.apellido || '',
        estudianteCodigo: item.estudiante?.codigo || '',
        estudianteCurso: item.estudiante?.curso || '',
        titulo: item.titulo || ''
      });
    };
    
    return (
      <TouchableOpacity 
        style={styles.evaluacionItem}
        onPress={handlePress}
      >
        <View style={styles.evaluacionHeader}>
          <Text style={styles.evaluacionEstudiante}>
            {item.estudiante?.nombre} {item.estudiante?.apellido}
          </Text>
          <View style={styles.tiempoContainer}>
            <MaterialIcons name="timer" size={16} color={colores.alerta} />
            <Text style={styles.tiempoRestante}>
              {horas}h {minutos}m restantes
            </Text>
          </View>
        </View>
        
        <Text style={styles.evaluacionTitulo}>{item.titulo}</Text>
        
        <View style={styles.evaluacionFooter}>
          <Text style={styles.evaluacionInfo}>
            <MaterialIcons name="event" size={14} color={colores.texto} /> {' '}
            {new Date(item.horarioInicio).toLocaleTimeString()} - {new Date(item.horarioFin).toLocaleTimeString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left', 'bottom']}>
      <StatusBar backgroundColor={colores.primario} barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Panel de Lector</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <MaterialIcons name="exit-to-app" size={24} color={colores.textoClaro} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Bienvenido/a,</Text>
          <Text style={styles.userName}>{usuario ? `${usuario.nombre} ${usuario.apellido}` : 'Lector'}</Text>
          <Text style={styles.userRole}>Lector / Evaluador</Text>
        </View>

        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Evaluaciones Pendientes</Text>
          
          {evaluacionesPendientes.length > 0 ? (
            <FlatList
              data={evaluacionesPendientes}
              renderItem={renderEvaluacionItem}
              keyExtractor={item => item._id}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="event-busy" size={40} color={colores.secundario} />
              <Text style={styles.emptyText}>No hay evaluaciones pendientes en este momento</Text>
            </View>
          )}
        </View>

        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Acciones</Text>
          
          <TouchableOpacity
            style={[styles.card, { backgroundColor: colores.secundario }]}
            onPress={() => navigation.navigate('PantallaBuscarEvaluaciones')}
          >
            <MaterialIcons name="search" size={28} color="#fff" />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Buscar Evaluaciones</Text>
              <Text style={styles.cardDescription}>Ver historial de evaluaciones realizadas</Text>
            </View>
          </TouchableOpacity>
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
  evaluacionItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  evaluacionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  evaluacionEstudiante: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colores.texto,
  },
  tiempoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tiempoRestante: {
    fontSize: 12,
    color: colores.alerta,
    marginLeft: 5,
  },
  evaluacionTitulo: {
    fontSize: 14,
    color: colores.texto,
    marginBottom: 10,
  },
  evaluacionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  evaluacionInfo: {
    fontSize: 12,
    color: colores.textoSecundario,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 14,
    color: colores.textoSecundario,
    textAlign: 'center',
  },
});

export default PantallaInicioLector;
