import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { obtenerEvaluaciones, obtenerRubricaCompleta } from '../basedatos/rubricaServicio';
import Cabecera from '../componentes/Cabecera';
import { colores, estilosGlobales } from '../estilos/estilosGlobales';

/**
 * Pantalla que muestra estadísticas de las evaluaciones
 * @param {Object} props Propiedades del componente
 * @param {Object} props.navigation Objeto de navegación
 * @returns {React.Component} Componente de pantalla de estadísticas
 */
const PantallaEstadisticas = ({ navigation }) => {
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [rubrica, setRubrica] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    promedioGeneral: 0,
    porCriterio: {},
    distribucionCalificaciones: {
      Deficiente: 0,
      Regular: 0,
      Bueno: 0,
      'Muy Bueno': 0,
      Excelente: 0,
    },
  });

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const datosEvaluaciones = await obtenerEvaluaciones();
        const datosRubrica = await obtenerRubricaCompleta();
        
        setEvaluaciones(datosEvaluaciones);
        setRubrica(datosRubrica);
        
        if (datosEvaluaciones.length > 0) {
          calcularEstadisticas(datosEvaluaciones, datosRubrica);
        }
      } catch (error) {
        console.error('Error al cargar datos para estadísticas:', error);
        Alert.alert('Error', 'No se pudieron cargar los datos para estadísticas');
      } finally {
        setCargando(false);
      }
    };
    
    cargarDatos();
  }, []);

  const calcularEstadisticas = (evaluaciones, rubrica) => {
    const mapaIndicadores = {};
    let puntajeMaximoPosible = 0;
    
    rubrica.forEach(criterio => {
      criterio.indicadores.forEach(indicador => {
        mapaIndicadores[indicador.id] = {
          nombre: indicador.nombre,
          criterio: criterio.criterio,
          opciones: indicador.opciones,
          maxValue: Math.max(...indicador.opciones.map(o => o.value))
        };
        puntajeMaximoPosible += Math.max(...indicador.opciones.map(o => o.value));
      });
    });
    
    const porCriterio = {};
    const conteoOpciones = {
      Deficiente: 0,
      Regular: 0,
      Bueno: 0,
      'Muy Bueno': 0,
      Excelente: 0,
    };
    let sumaPuntajes = 0;
    
    rubrica.forEach(criterio => {
      porCriterio[criterio.criterio] = {
        totalPuntos: 0,
        maximoPosible: 0,
        promedio: 0,
        numeroIndicadores: criterio.indicadores.length,
        evaluacionesRealizadas: 0,
      };
      
      criterio.indicadores.forEach(indicador => {
        porCriterio[criterio.criterio].maximoPosible += 
          Math.max(...indicador.opciones.map(o => o.value)) * evaluaciones.length;
      });
    });
    
    evaluaciones.forEach(evaluacion => {
      let puntajeEvaluacion = 0;
      
      const conteosCriterio = {};
      rubrica.forEach(criterio => {
        conteosCriterio[criterio.criterio] = 0;
      });
      
      evaluacion.notas.forEach(nota => {
        const indicador = mapaIndicadores[nota.indicadorId];
        if (!indicador) return;
        
        puntajeEvaluacion += nota.valor;
        
        porCriterio[indicador.criterio].totalPuntos += nota.valor;
        conteosCriterio[indicador.criterio]++;
        
        const opcion = indicador.opciones.find(o => o.value === nota.valor);
        if (opcion) {
          conteoOpciones[opcion.label]++;
        }
      });
      
      Object.keys(conteosCriterio).forEach(criterio => {
        if (conteosCriterio[criterio] === porCriterio[criterio].numeroIndicadores) {
          porCriterio[criterio].evaluacionesRealizadas++;
        }
      });
      
      sumaPuntajes += puntajeEvaluacion;
    });
    
    Object.keys(porCriterio).forEach(criterio => {
      if (porCriterio[criterio].evaluacionesRealizadas > 0) {
        porCriterio[criterio].promedio = 
          porCriterio[criterio].totalPuntos / porCriterio[criterio].evaluacionesRealizadas;
      }
    });
    
    const promedioGeneral = sumaPuntajes / evaluaciones.length;
    
    setEstadisticas({
      total: evaluaciones.length,
      promedioGeneral,
      puntajeMaximoPosible,
      porCriterio,
      distribucionCalificaciones: conteoOpciones,
    });
  };

  const renderBarraProgreso = (valor, maximo, color) => {
    const porcentaje = maximo > 0 ? (valor / maximo) * 100 : 0;
    
    return (
      <View style={styles.barraContenedor}>
        <View 
          style={[
            styles.barraPrincipal,
            { width: `${porcentaje}%`, backgroundColor: color }
          ]}
        />
      </View>
    );
  };

  if (cargando) {
    return (
      <View style={estilosGlobales.contenedorCentrado}>
        <ActivityIndicator size="large" color={colores.primario} />
        <Text style={styles.textoCargando}>Calculando estadísticas...</Text>
      </View>
    );
  }

  if (evaluaciones.length === 0) {
    return (
      <View style={estilosGlobales.contenedor}>
        <Cabecera 
          titulo="Estadísticas" 
          onAtras={() => navigation.goBack()} 
        />
        <View style={styles.contenedorSinDatos}>
          <Text style={styles.textoSinDatos}>
            No hay evaluaciones registradas para generar estadísticas.
          </Text>
          <Text style={styles.subtextoSinDatos}>
            Cree evaluaciones para ver estadísticas de rendimiento.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={estilosGlobales.contenedor}>
      <Cabecera 
        titulo="Estadísticas" 
        onAtras={() => navigation.goBack()} 
      />
      
      <ScrollView contentContainerStyle={styles.contenido}>
        <View style={styles.seccion}>
          <Text style={styles.tituloSeccion}>Resumen General</Text>
          
          <View style={styles.cardEstadistica}>
            <Text style={styles.etiquetaEstadistica}>Total de evaluaciones:</Text>
            <Text style={styles.valorEstadistica}>{estadisticas.total}</Text>
          </View>
          
          <View style={styles.cardEstadistica}>
            <Text style={styles.etiquetaEstadistica}>Promedio general:</Text>
            <Text style={styles.valorEstadistica}>
              {estadisticas.promedioGeneral.toFixed(2)}
            </Text>
            {renderBarraProgreso(
              estadisticas.promedioGeneral, 
              estadisticas.puntajeMaximoPosible,
              colores.primario
            )}
            <Text style={styles.subtextoEstadistica}>
              de un máximo posible de {estadisticas.puntajeMaximoPosible.toFixed(2)} puntos
            </Text>
          </View>
        </View>
        
        <View style={styles.seccion}>
          <Text style={styles.tituloSeccion}>Por Criterio de Disertación</Text>
          
          {Object.keys(estadisticas.porCriterio).map((criterio) => {
            const datos = estadisticas.porCriterio[criterio];
            if (datos.evaluacionesRealizadas === 0) return null;
            
            const maximoPorEvaluacion = datos.maximoPosible / estadisticas.total;
            
            return (
              <View key={criterio} style={styles.cardCriterio}>
                <Text style={styles.tituloCriterioEstadistica}>{criterio}</Text>
                <View style={styles.filaDatos}>
                  <Text style={styles.etiquetaEstadistica}>Promedio:</Text>
                  <Text style={styles.valorEstadisticaCriterio}>
                    {datos.promedio.toFixed(2)}
                  </Text>
                </View>
                {renderBarraProgreso(
                  datos.promedio, 
                  maximoPorEvaluacion,
                  colores.info
                )}
                <Text style={styles.subtextoEstadistica}>
                  de un máximo posible de {maximoPorEvaluacion.toFixed(2)} puntos
                </Text>
                <Text style={styles.subtextoEstadistica}>
                  Basado en {datos.evaluacionesRealizadas} evaluaciones completas
                </Text>
              </View>
            );
          })}
        </View>
        
        <View style={styles.seccion}>
          <Text style={styles.tituloSeccion}>Distribución de Calificaciones</Text>
          
          <View style={styles.graficoDistribucion}>
            {Object.entries(estadisticas.distribucionCalificaciones).map(([calificacion, cantidad]) => {
              const porcentaje = estadisticas.total > 0 
                ? (cantidad / (estadisticas.total * 10)) * 100 
                : 0;
              
              let color;
              switch(calificacion) {
                case 'Deficiente': color = colores.deficiente; break;
                case 'Regular': color = colores.regular; break;
                case 'Bueno': color = colores.bueno; break;
                case 'Muy Bueno': color = colores.muyBueno; break;
                case 'Excelente': color = colores.excelente; break;
                default: color = colores.primario;
              }
              
              return (
                <View key={calificacion} style={styles.itemDistribucion}>
                  <View style={styles.barraDistribucionContainer}>
                    <View 
                      style={[
                        styles.barraDistribucion, 
                        { 
                          height: `${Math.max(porcentaje, 5)}%`,
                          backgroundColor: color,
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.textoCalificacion}>{calificacion}</Text>
                  <Text style={styles.textoCantidad}>{cantidad}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  contenido: {
    padding: 16,
    paddingBottom: 32,
  },
  seccion: {
    marginBottom: 24,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tituloSeccion: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colores.primario,
    marginBottom: 16,
  },
  cardEstadistica: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  etiquetaEstadistica: {
    fontSize: 16,
    color: colores.texto,
    marginBottom: 4,
  },
  valorEstadistica: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colores.primario,
    marginBottom: 8,
  },
  barraContenedor: {
    height: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
    overflow: 'hidden',
    marginTop: 4,
    marginBottom: 4,
  },
  barraPrincipal: {
    height: '100%',
    borderRadius: 5,
  },
  subtextoEstadistica: {
    fontSize: 12,
    color: '#757575',
    marginTop: 4,
  },
  cardCriterio: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  tituloCriterioEstadistica: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colores.texto,
    marginBottom: 8,
  },
  filaDatos: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  valorEstadisticaCriterio: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colores.info,
  },
  graficoDistribucion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 200,
    marginTop: 16,
  },
  itemDistribucion: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
  },
  barraDistribucionContainer: {
    width: '80%',
    flex: 1,
    justifyContent: 'flex-end',
  },
  barraDistribucion: {
    width: '100%',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  textoCalificacion: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    color: colores.texto,
  },
  textoCantidad: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colores.texto,
    marginTop: 2,
  },
  contenedorSinDatos: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  textoSinDatos: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colores.texto,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtextoSinDatos: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
  },
  textoCargando: {
    marginTop: 16,
    fontSize: 16,
    color: colores.texto,
  },
});

export default PantallaEstadisticas;
