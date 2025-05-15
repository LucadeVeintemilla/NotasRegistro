import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  Alert,
  TextInput
} from 'react-native';
import { colores, estilosGlobales } from '../estilos/estilosGlobales';
import Cabecera from '../componentes/Cabecera';
import { Feather } from '@expo/vector-icons';
import { obtenerEvaluaciones } from '../basedatos/rubricaServicio';

/**
 * Pantalla para buscar y filtrar evaluaciones
 * @param {Object} props Propiedades del componente
 * @param {Object} props.navigation Objeto de navegación
 * @returns {React.Component} Componente de búsqueda de evaluaciones
 */
const PantallaBuscarEvaluaciones = ({ navigation }) => {
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [evaluacionesFiltradas, setEvaluacionesFiltradas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [textoBusqueda, setTextoBusqueda] = useState('');

  const cargarEvaluaciones = async () => {
    setCargando(true);
    try {
      const datos = await obtenerEvaluaciones();
      setEvaluaciones(datos);
      setEvaluacionesFiltradas(datos);
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

  // Filtrar evaluaciones según el texto ingresado
  const filtrarEvaluaciones = (texto) => {
    setTextoBusqueda(texto);
    
    if (!texto.trim()) {
      setEvaluacionesFiltradas(evaluaciones);
      return;
    }
    
    const textoLower = texto.toLowerCase();
    const filtradas = evaluaciones.filter(evaluacion => 
      evaluacion.titulo?.toLowerCase().includes(textoLower) || 
      evaluacion.estudiante?.nombre?.toLowerCase().includes(textoLower) || 
      evaluacion.estudiante?.apellido?.toLowerCase().includes(textoLower)
    );
    
    setEvaluacionesFiltradas(filtradas);
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
              {`${item.estudiante?.nombre || ''} ${item.estudiante?.apellido || ''}`}
            </Text>
          </View>
          
          <View style={styles.notaContainer}>
            <Text style={styles.notaTexto}>{item.notaFinal?.toFixed(2) || '-'}</Text>
            <Text style={styles.notaLabel}>Nota</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const ListaVacia = () => (
    <View style={styles.contenedorVacio}>
      <Feather name="search" size={64} color={colores.texto + '80'} />
      <Text style={styles.textoVacio}>
        {textoBusqueda ? 'No se encontraron resultados' : 'No hay evaluaciones registradas'}
      </Text>
      <Text style={styles.subtextoVacio}>
        {textoBusqueda 
          ? 'Intenta con otros términos de búsqueda'
          : 'Crea una nueva evaluación desde la pantalla principal'
        }
      </Text>
    </View>
  );

  return (
    <View style={estilosGlobales.contenedor}>
      <Cabecera 
        titulo="Buscar Evaluaciones" 
        onAtras={() => navigation.goBack()}
      />
      
      <View style={styles.contenedorBusqueda}>
        <Feather name="search" size={20} color={colores.texto} style={styles.iconoBusqueda} />
        <TextInput
          style={styles.inputBusqueda}
          placeholder="Buscar por título o estudiante..."
          value={textoBusqueda}
          onChangeText={filtrarEvaluaciones}
          autoCapitalize="none"
        />
        {textoBusqueda ? (
          <TouchableOpacity 
            style={styles.botonLimpiar}
            onPress={() => filtrarEvaluaciones('')}
          >
            <Feather name="x" size={20} color={colores.texto} />
          </TouchableOpacity>
        ) : null}
      </View>
      
      {cargando ? (
        <View style={estilosGlobales.contenedorCentrado}>
          <ActivityIndicator size="large" color={colores.primario} />
          <Text style={styles.textoCargando}>Cargando evaluaciones...</Text>
        </View>
      ) : (
        <FlatList
          data={evaluacionesFiltradas}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listaContenido}
          ListEmptyComponent={ListaVacia}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  contenedorBusqueda: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    height: 50,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  iconoBusqueda: {
    marginRight: 8,
  },
  inputBusqueda: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: colores.texto,
  },
  botonLimpiar: {
    padding: 8,
  },
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
  notaContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colores.primario + '20',
    borderRadius: 8,
    padding: 8,
    minWidth: 60,
  },
  notaTexto: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colores.primario,
  },
  notaLabel: {
    fontSize: 12,
    color: colores.textoSecundario,
  },
  contenedorVacio: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  textoVacio: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colores.texto,
    marginTop: 16,
    textAlign: 'center',
  },
  subtextoVacio: {
    fontSize: 16,
    color: colores.textoSecundario,
    marginTop: 8,
    textAlign: 'center',
  },
  textoCargando: {
    marginTop: 16,
    fontSize: 16,
    color: colores.textoSecundario,
  },
});

export default PantallaBuscarEvaluaciones;
