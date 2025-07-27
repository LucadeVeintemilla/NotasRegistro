import { Feather } from '@expo/vector-icons';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Cabecera from '../componentes/Cabecera';
import { colores, estilosGlobales } from '../estilos/estilosGlobales';
import { getCurrentUser, setAuthToken } from '../servicios/auth/authService';
import { getApiUrl } from '../config/api';

const PantallaBuscarEvaluaciones = ({ navigation, route }) => {
  const { modoCalificacion } = route.params || {};
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [evaluacionesFiltradas, setEvaluacionesFiltradas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [textoBusqueda, setTextoBusqueda] = useState('');

  const cargarEvaluaciones = async () => {
    setCargando(true);
    try {
      await setAuthToken();
      const userData = await getCurrentUser();
      
      if (!userData || !userData.id) {
        throw new Error('No se pudo obtener información del usuario');
      }
      
      const response = await axios.get(getApiUrl('/api/evaluaciones'));
      
      let evaluacionesPermitidas = response.data.data;
      
      if (userData.tipo === 'lector') {
        evaluacionesPermitidas = evaluacionesPermitidas.filter(
          evaluacion => 
            (evaluacion.evaluador && evaluacion.evaluador._id === userData.id) ||
            evaluacion.createdBy === userData.id
        );
      }
      
      
      setEvaluaciones(evaluacionesPermitidas);
      setEvaluacionesFiltradas(evaluacionesPermitidas);
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
    
    setEvaluacionesFiltradas(filtradas);  };
  const renderItem = ({ item }) => {
    const fecha = new Date(item.fecha).toLocaleDateString();
    const ahora = new Date();
    const inicio = new Date(item.horarioInicio);
    const fin = new Date(item.horarioFin);
    const estaDisponible = ahora >= inicio && ahora <= fin;
    
    return (
      <TouchableOpacity
        style={[
          styles.tarjetaEvaluacion,
          !estaDisponible && styles.tarjetaNoDisponible        ]}
        onPress={() => {
          // Si la evaluación ya está completada, redirigir a detalles
          if (item.estado === 'completada') {
            navigation.navigate('PantallaDetalleEvaluacion', { 
              evaluacionId: item._id,
              esLector: false // Indica que viene del director
            });
            return;
          }
          
          if (modoCalificacion) {
            navigation.navigate('PantallaCalificarEvaluacion', { 
              evaluacionId: item._id,
              evaluacionCompleta: item,
              estudianteNombre: item.estudiante?.nombre,
              estudianteApellido: item.estudiante?.apellido,
              estudianteCedula: item.estudiante?.cedula,
              estudianteTipo: item.estudiante?.tipo,
              estudianteMaestria: item.estudiante?.maestria,
              titulo: item.titulo
            });
          } else {
            navigation.navigate('PantallaDetalleEvaluacion', { 
              evaluacionId: item._id,
              esLector: false // Indica que viene del director
            });
          }
        }}
      >
        <View style={styles.contenidoTarjeta}>
          <View style={styles.infoEvaluacion}>
            <Text style={styles.tituloEvaluacion}>{item.titulo}</Text>
            <Text style={styles.fechaEvaluacion}>{fecha}</Text>
            <Text style={styles.estudianteEvaluacion}>
              {item.estudiante?.nombre || ''} {item.estudiante?.apellido || ''}
            </Text>
            <Text style={[styles.estadoEvaluacion, { color: item.estado === 'completada' ? colores.primario : colores.secundario }]}>
              {item.estado}
            </Text>
            <Text style={[
              styles.disponibilidadTexto,
              { color: estaDisponible ? colores.primario : colores.error }
            ]}>
              {estaDisponible ? '✓ Disponible ahora' : '✗ Fuera del horario permitido'}
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
        {textoBusqueda ? 'No se encontraron resultados' : 'No hay evaluaciones asignadas'}
      </Text>
      <Text style={styles.subtextoVacio}>
        {textoBusqueda 
          ? 'Intenta con otros términos de búsqueda'
          : 'Las evaluaciones que te sean asignadas aparecerán aquí'
        }
      </Text>
    </View>
  );

  return (
    <View style={estilosGlobales.contenedor}>
      <Cabecera 
        titulo={modoCalificacion ? "Calificar Evaluaciones" : "Mis Evaluaciones"} 
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
          keyExtractor={(item) => item._id}
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
  tarjetaNoDisponible: {
    opacity: 0.7,
    borderColor: colores.error,
    borderWidth: 1,
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
    marginBottom: 4,
  },
  estadoEvaluacion: {
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  disponibilidadTexto: {
    fontSize: 13,
    marginTop: 4,
    fontStyle: 'italic',
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
