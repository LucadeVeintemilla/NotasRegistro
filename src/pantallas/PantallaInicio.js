import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  Alert,
} from 'react-native';
import { colores, estilosGlobales } from '../estilos/estilosGlobales';
import Cabecera from '../componentes/Cabecera';
import { AntDesign, Feather } from '@expo/vector-icons';
import { obtenerEvaluaciones, eliminarEvaluacion, inicializarRubrica } from '../basedatos/rubricaServicio';

/**
 * Pantalla principal que muestra la lista de evaluaciones
 * @param {Object} props Propiedades del componente
 * @param {Object} props.navigation Objeto de navegación
 * @returns {React.Component} Componente de pantalla de inicio
 */
const PantallaInicio = ({ navigation }) => {
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargarEvaluaciones = async () => {
    setCargando(true);
    try {
      // Aseguramos que la rúbrica esté inicializada
      await inicializarRubrica();
      
      // Obtenemos las evaluaciones
      const datos = await obtenerEvaluaciones();
      setEvaluaciones(datos);
    } catch (error) {
      console.error('Error al cargar evaluaciones:', error);
      Alert.alert('Error', 'No se pudieron cargar las evaluaciones');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      cargarEvaluaciones();
    });

    return unsubscribe;
  }, [navigation]);

  const handleEliminarEvaluacion = (id) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Está seguro que desea eliminar esta evaluación? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await eliminarEvaluacion(id);
              cargarEvaluaciones();
              Alert.alert('Éxito', 'La evaluación ha sido eliminada correctamente');
            } catch (error) {
              console.error('Error al eliminar:', error);
              Alert.alert('Error', 'No se pudo eliminar la evaluación');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => {
    const fecha = new Date(item.fecha).toLocaleDateString();
    
    return (
      <TouchableOpacity
        style={styles.tarjetaEvaluacion}
        onPress={() => navigation.navigate('DetalleEvaluacion', { evaluacionId: item.id })}
      >
        <View style={styles.contenidoTarjeta}>
          <View style={styles.infoEvaluacion}>
            <Text style={styles.tituloEvaluacion}>{item.titulo}</Text>
            <Text style={styles.fechaEvaluacion}>{fecha}</Text>
            <Text style={styles.estudianteEvaluacion}>
              {`${item.estudiante.nombre} ${item.estudiante.apellido}`}
            </Text>
          </View>
          
          <View style={styles.accionesTarjeta}>
            <TouchableOpacity
              style={styles.botonAccion}
              onPress={() => handleEliminarEvaluacion(item.id)}
            >
              <Feather name="trash-2" size={22} color={colores.error} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const ListaVacia = () => (
    <View style={styles.contenedorVacio}>
      <Feather name="clipboard" size={64} color={colores.texto + '80'} />
      <Text style={styles.textoVacio}>No hay evaluaciones registradas</Text>
      <Text style={styles.subtextoVacio}>
        Presione el botón '+' para crear una nueva evaluación
      </Text>
    </View>
  );

  return (
    <View style={estilosGlobales.contenedor}>
      <Cabecera titulo="Registro de Notas" />
      
      {cargando ? (
        <View style={estilosGlobales.contenedorCentrado}>
          <ActivityIndicator size="large" color={colores.primario} />
          <Text style={styles.textoCargando}>Cargando evaluaciones...</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={evaluaciones}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listaContenido}
            ListEmptyComponent={ListaVacia}
          />
          
          <TouchableOpacity
            style={styles.botonFlotante}
            onPress={() => navigation.navigate('NuevaEvaluacion')}
          >
            <AntDesign name="plus" size={24} color={colores.textoClaro} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.botonEstadisticas}
            onPress={() => navigation.navigate('Estadisticas')}
          >
            <Feather name="bar-chart-2" size={22} color={colores.textoClaro} />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  listaContenido: {
    padding: 16,
    paddingBottom: 80,
    flexGrow: 1,
  },
  tarjetaEvaluacion: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  contenidoTarjeta: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoEvaluacion: {
    flex: 1,
  },
  tituloEvaluacion: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colores.texto,
    marginBottom: 4,
  },
  fechaEvaluacion: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 4,
  },
  estudianteEvaluacion: {
    fontSize: 16,
    color: colores.texto,
  },
  accionesTarjeta: {
    justifyContent: 'center',
    paddingLeft: 8,
  },
  botonAccion: {
    padding: 8,
  },
  botonFlotante: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colores.primario,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  botonEstadisticas: {
    position: 'absolute',
    right: 16,
    bottom: 88,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colores.secundario,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  contenedorVacio: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  textoVacio: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colores.texto,
    marginTop: 16,
    textAlign: 'center',
  },
  subtextoVacio: {
    fontSize: 14,
    color: '#757575',
    marginTop: 8,
    textAlign: 'center',
  },
  textoCargando: {
    marginTop: 16,
    fontSize: 16,
    color: colores.texto,
  },
});

export default PantallaInicio;
