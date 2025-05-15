import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { colores, estilosGlobales } from '../estilos/estilosGlobales';
import Cabecera from '../componentes/Cabecera';
import { obtenerEvaluacionPorId, obtenerRubricaCompleta } from '../basedatos/rubricaServicio';
import { MaterialIcons } from '@expo/vector-icons';

/**
 * Pantalla que muestra el detalle de una evaluación
 * @param {Object} props Propiedades del componente
 * @param {Object} props.route Objeto de ruta con parámetros
 * @param {Object} props.navigation Objeto de navegación
 * @returns {React.Component} Componente de pantalla de detalle de evaluación
 */
const PantallaDetalleEvaluacion = ({ route, navigation }) => {
  const { evaluacionId } = route.params;
  const [evaluacion, setEvaluacion] = useState(null);
  const [rubrica, setRubrica] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [detallesIndicadores, setDetallesIndicadores] = useState({});

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Obtener la evaluación por su ID
        const datosEvaluacion = await obtenerEvaluacionPorId(evaluacionId);
        
        if (!datosEvaluacion) {
          Alert.alert('Error', 'No se encontró la evaluación');
          navigation.goBack();
          return;
        }
        
        // Obtener la rúbrica completa para mostrar los detalles
        const datosRubrica = await obtenerRubricaCompleta();
        
        // Crear un mapa para facilitar la búsqueda de indicadores y opciones
        const mapaDetalles = {};
        datosRubrica.forEach(criterio => {
          criterio.indicadores.forEach(indicador => {
            mapaDetalles[indicador.id] = {
              nombre: indicador.nombre,
              criterio: criterio.criterio,
              opciones: indicador.opciones,
            };
          });
        });
        
        setEvaluacion(datosEvaluacion);
        setRubrica(datosRubrica);
        setDetallesIndicadores(mapaDetalles);
      } catch (error) {
        console.error('Error al cargar detalle de evaluación:', error);
        Alert.alert('Error', 'No se pudieron cargar los detalles de la evaluación');
        navigation.goBack();
      } finally {
        setCargando(false);
      }
    };
    
    cargarDatos();
  }, [evaluacionId, navigation]);

  const calcularPuntajeTotal = () => {
    if (!evaluacion || !evaluacion.notas) return 0;
    
    return evaluacion.notas.reduce((total, nota) => total + nota.valor, 0);
  };

  const obtenerCalificacionPorValor = (indicadorId, valor) => {
    const indicador = detallesIndicadores[indicadorId];
    if (!indicador) return '';
    
    const opcion = indicador.opciones.find(opt => opt.value === valor);
    return opcion ? opcion.label : '';
  };

  const obtenerColorPorCalificacion = (calificacion) => {
    switch (calificacion) {
      case 'Deficiente': return colores.deficiente;
      case 'Regular': return colores.regular;
      case 'Bueno': return colores.bueno;
      case 'Muy Bueno': return colores.muyBueno;
      case 'Excelente': return colores.excelente;
      default: return colores.texto;
    }
  };

  const compartirEvaluacion = async () => {
    if (!evaluacion) return;

    try {
      const nombreEstudiante = `${evaluacion.estudiante.nombre} ${evaluacion.estudiante.apellido}`;
      const puntajeTotal = calcularPuntajeTotal().toFixed(2);
      const fecha = new Date(evaluacion.fecha).toLocaleDateString();

      let mensaje = `📝 *${evaluacion.titulo}*\n`;
      mensaje += `👤 Estudiante: ${nombreEstudiante}\n`;
      mensaje += `📋 Código: ${evaluacion.estudiante.codigo}\n`;
      mensaje += `📅 Fecha: ${fecha}\n\n`;
      mensaje += `*PUNTAJE TOTAL: ${puntajeTotal}*\n\n`;
      
      // Agrupar por criterio
      const notasPorCriterio = {};
      
      evaluacion.notas.forEach(nota => {
        const detalles = detallesIndicadores[nota.indicadorId];
        if (!detalles) return;
        
        const criterioClave = detalles.criterio;
        if (!notasPorCriterio[criterioClave]) {
          notasPorCriterio[criterioClave] = [];
        }
        
        notasPorCriterio[criterioClave].push({
          nombre: detalles.nombre,
          valor: nota.valor,
          calificacion: obtenerCalificacionPorValor(nota.indicadorId, nota.valor),
        });
      });
      
      // Generar mensaje por criterio
      Object.entries(notasPorCriterio).forEach(([criterio, notas]) => {
        mensaje += `*${criterio}*\n`;
        
        notas.forEach(nota => {
          mensaje += `- ${nota.nombre}: ${nota.calificacion} (${nota.valor})\n`;
        });
        
        mensaje += '\n';
      });
      
      mensaje += "Evaluación generada con la App de Registro de Notas";

      await Share.share({
        message: mensaje,
      });
    } catch (error) {
      console.error('Error al compartir evaluación:', error);
      Alert.alert('Error', 'No se pudo compartir la evaluación');
    }
  };

  if (cargando) {
    return (
      <View style={estilosGlobales.contenedorCentrado}>
        <ActivityIndicator size="large" color={colores.primario} />
        <Text style={styles.textoCargando}>Cargando evaluación...</Text>
      </View>
    );
  }

  if (!evaluacion) {
    return (
      <View style={estilosGlobales.contenedorCentrado}>
        <Text style={styles.textoError}>No se encontró la evaluación</Text>
        <TouchableOpacity
          style={styles.botonVolver}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.textoBotonVolver}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const puntajeTotal = calcularPuntajeTotal();
  const estudiante = evaluacion.estudiante;
  const nombreCompleto = `${estudiante.nombre} ${estudiante.apellido}`;

  return (
    <View style={estilosGlobales.contenedor}>
      <Cabecera
        titulo="Detalle de Evaluación"
        onAtras={() => navigation.goBack()}
      />
      
      <ScrollView contentContainerStyle={styles.contenido}>
        <View style={styles.seccionEncabezado}>
          <Text style={styles.tituloEvaluacion}>{evaluacion.titulo}</Text>
          <Text style={styles.fechaEvaluacion}>
            Fecha: {new Date(evaluacion.fecha).toLocaleDateString()}
          </Text>
          
          <View style={styles.infoEstudiante}>
            <Text style={styles.nombreEstudiante}>{nombreCompleto}</Text>
            {estudiante.codigo && (
              <Text style={styles.codigoEstudiante}>Código: {estudiante.codigo}</Text>
            )}
            {estudiante.curso && (
              <Text style={styles.cursoEstudiante}>Curso: {estudiante.curso}</Text>
            )}
          </View>
          
          <View style={styles.seccionPuntaje}>
            <Text style={styles.etiquetaPuntaje}>Puntaje Total:</Text>
            <Text style={styles.valorPuntaje}>{puntajeTotal.toFixed(2)}</Text>
          </View>
        </View>
        
        <View style={styles.seccionResultados}>
          <Text style={styles.tituloSeccion}>Resultados por Criterio</Text>
          
          {rubrica.map((criterio) => {
            // Filtrar las notas que pertenecen a este criterio
            const notasCriterio = evaluacion.notas.filter(nota => {
              const indicador = criterio.indicadores.find(i => i.id === nota.indicadorId);
              return !!indicador;
            });
            
            if (notasCriterio.length === 0) return null;
            
            return (
              <View key={criterio.id} style={styles.criterioResultado}>
                <Text style={styles.tituloCriterio}>{criterio.criterio}</Text>
                
                {criterio.indicadores.map((indicador) => {
                  const nota = evaluacion.notas.find(n => n.indicadorId === indicador.id);
                  if (!nota) return null;
                  
                  const calificacion = obtenerCalificacionPorValor(indicador.id, nota.valor);
                  const colorCalificacion = obtenerColorPorCalificacion(calificacion);
                  
                  return (
                    <View key={indicador.id} style={styles.indicadorResultado}>
                      <Text style={styles.nombreIndicador}>{indicador.nombre}</Text>
                      <View style={styles.valorContainer}>
                        <Text style={[styles.valorCalificacion, { color: colorCalificacion }]}>
                          {calificacion}
                        </Text>
                        <Text style={styles.valorNumerico}>({nota.valor})</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            );
          })}
        </View>
        
        <TouchableOpacity
          style={styles.botonCompartir}
          onPress={compartirEvaluacion}
        >
          <MaterialIcons name="share" size={20} color={colores.textoClaro} />
          <Text style={styles.textoBotonCompartir}>Compartir Evaluación</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  contenido: {
    padding: 16,
    paddingBottom: 32,
  },
  seccionEncabezado: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tituloEvaluacion: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colores.texto,
    marginBottom: 8,
  },
  fechaEvaluacion: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 16,
  },
  infoEstudiante: {
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 16,
  },
  nombreEstudiante: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colores.texto,
    marginBottom: 4,
  },
  codigoEstudiante: {
    fontSize: 14,
    color: colores.texto,
    marginBottom: 4,
  },
  cursoEstudiante: {
    fontSize: 14,
    color: colores.texto,
  },
  seccionPuntaje: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colores.borde,
  },
  etiquetaPuntaje: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colores.texto,
  },
  valorPuntaje: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colores.primario,
  },
  seccionResultados: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tituloSeccion: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colores.texto,
    marginBottom: 16,
  },
  criterioResultado: {
    marginBottom: 20,
  },
  tituloCriterio: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colores.primario,
    backgroundColor: '#e8eaf6',
    padding: 8,
    borderRadius: 4,
    marginBottom: 12,
  },
  indicadorResultado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  nombreIndicador: {
    flex: 1,
    fontSize: 15,
    color: colores.texto,
  },
  valorContainer: {
    alignItems: 'flex-end',
  },
  valorCalificacion: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  valorNumerico: {
    fontSize: 14,
    color: '#757575',
    marginTop: 2,
  },
  botonCompartir: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colores.secundario,
    borderRadius: 8,
    padding: 14,
    marginTop: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  textoBotonCompartir: {
    color: colores.textoClaro,
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  textoCargando: {
    marginTop: 16,
    fontSize: 16,
    color: colores.texto,
  },
  textoError: {
    fontSize: 18,
    color: colores.error,
    marginBottom: 16,
  },
  botonVolver: {
    backgroundColor: colores.primario,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
  },
  textoBotonVolver: {
    color: colores.textoClaro,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default PantallaDetalleEvaluacion;
