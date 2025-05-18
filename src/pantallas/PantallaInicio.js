import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
} from 'react-native';
import { colores, estilosGlobales } from '../estilos/estilosGlobales';
import Cabecera from '../componentes/Cabecera';

/**
 * Pantalla principal que muestra la pantalla de inicio con opciones de navegación
 * @param {Object} props Propiedades del componente
 * @param {Object} props.navigation Objeto de navegación
 * @returns {React.Component} Componente de pantalla de inicio
 */
const PantallaInicio = ({ navigation }) => {
  const navegarANuevaEvaluacion = () => {
    navigation.navigate('NuevaEvaluacion');
  };

  const navegarABuscarEvaluaciones = () => {
    navigation.navigate('BuscarEvaluaciones');
  };

  return (
    <View style={estilosGlobales.contenedor}>
      <Cabecera 
        titulo="Registro de Notas" 
        accionDerecha={
          <TouchableOpacity onPress={() => navigation.navigate('Ayuda')}>
            <Text style={styles.botonAyuda}>?</Text>
          </TouchableOpacity>
        }
      />
      <ScrollView contentContainerStyle={styles.contenido}>
        <View style={styles.bienvenida}>
          <Text style={styles.tituloBienvenida}>Bienvenido al Sistema de Registro de Notas</Text>
          <Text style={styles.subtituloBienvenida}>
            Esta aplicación te permite evaluar presentaciones utilizando una rúbrica predefinida
          </Text>
        </View>

        <View style={styles.opcionesContainer}>
          <TouchableOpacity
            style={[styles.opcion, { backgroundColor: colores.primario }]}
            onPress={navegarANuevaEvaluacion}
          >
            <Text style={styles.opcionTitulo}>Nueva Evaluación</Text>
            <Text style={styles.opcionDescripcion}>Registra una nueva evaluación para un estudiante</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.opcion, { backgroundColor: colores.secundario }]}
            onPress={navegarABuscarEvaluaciones}
          >
            <Text style={styles.opcionTitulo}>Buscar Evaluaciones</Text>
            <Text style={styles.opcionDescripcion}>Consulta evaluaciones realizadas anteriormente</Text>
          </TouchableOpacity>

         
          
        </View>

        <View style={styles.seccionAyuda}>
          <Text style={styles.tituloAyuda}>Información de la Rúbrica</Text>
          <Text style={styles.textoAyuda}>
            La rúbrica utilizada para las evaluaciones consta de 3 criterios principales:
          </Text>
          <View style={styles.listaCriterios}>
            <Text style={styles.itemCriterio}>• ACTITUD (2 indicadores)</Text>
            <Text style={styles.itemCriterio}>• DEL CONTENIDO DE LA PRESENTACIÓN (4 indicadores)</Text>
            <Text style={styles.itemCriterio}>• EXPOSICIÓN (4 indicadores)</Text>
          </View>
          <Text style={styles.textoAyuda}>
            Cada indicador se evalúa en una escala de Deficiente a Excelente, con valores numéricos específicos.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  contenido: {
    padding: 16,
    paddingBottom: 30,
  },
  botonAyuda: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colores.textoClaro,
    backgroundColor: colores.primario + '80',
    width: 30,
    height: 30,
    borderRadius: 15,
    textAlign: 'center',
    lineHeight: 30,
  },
  bienvenida: {
    marginBottom: 24,
  },
  tituloBienvenida: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colores.texto,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtituloBienvenida: {
    fontSize: 16,
    color: colores.textoSecundario,
    textAlign: 'center',
    lineHeight: 22,
  },
  opcionesContainer: {
    marginBottom: 24,
  },
  opcion: {
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  opcionTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
  },
  opcionDescripcion: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  seccionAyuda: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
  },
  tituloAyuda: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colores.texto,
    marginBottom: 8,
  },
  textoAyuda: {
    fontSize: 14,
    color: colores.textoSecundario,
    marginBottom: 8,
    lineHeight: 20,
  },
  listaCriterios: {
    marginVertical: 8,
    paddingLeft: 8,
  },
  itemCriterio: {
    fontSize: 14,
    color: colores.texto,
    marginBottom: 6,
  },
});

export default PantallaInicio;
