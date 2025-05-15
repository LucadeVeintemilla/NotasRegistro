import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colores, estilosGlobales } from '../estilos/estilosGlobales';

/**
 * Componente para mostrar y evaluar un criterio con sus indicadores
 * @param {Object} props Propiedades del componente
 * @param {Object} props.criterio Objeto con la información del criterio
 * @param {Object} props.valoresSeleccionados Objeto con los valores seleccionados
 * @param {Function} props.onSeleccionarValor Función para manejar la selección de valores
 * @returns {React.Component} Componente de criterio de evaluación
 */
const CriterioEvaluacion = ({ criterio, valoresSeleccionados, onSeleccionarValor }) => {
  const getColorPorValor = (label) => {
    switch (label) {
      case 'Deficiente': return colores.deficiente;
      case 'Regular': return colores.regular;
      case 'Bueno': return colores.bueno;
      case 'Muy Bueno': return colores.muyBueno;
      case 'Excelente': return colores.excelente;
      default: return colores.borde;
    }
  };

  return (
    <View style={styles.contenedor}>
      <Text style={styles.tituloCriterio}>{criterio.criterio}</Text>
      
      {criterio.indicadores.map((indicador) => (
        <View key={indicador.id} style={styles.indicador}>
          <Text style={styles.nombreIndicador}>{indicador.nombre}</Text>
          
          <View style={styles.opcionesGrilla}>
            {indicador.opciones.map((opcion) => {
              const estaSeleccionado = valoresSeleccionados[indicador.id] === opcion.value;
              
              return (
                <TouchableOpacity
                  key={`${indicador.id}-${opcion.label}`}
                  style={[
                    styles.opcion,
                    estaSeleccionado && { 
                      borderColor: getColorPorValor(opcion.label),
                      backgroundColor: `${getColorPorValor(opcion.label)}20`
                    }
                  ]}
                  onPress={() => onSeleccionarValor(indicador.id, opcion.value)}
                >
                  <Text 
                    style={[
                      styles.textoOpcion, 
                      estaSeleccionado && { color: getColorPorValor(opcion.label) }
                    ]}
                  >
                    {opcion.label}
                  </Text>
                  <Text 
                    style={[
                      styles.valorOpcion, 
                      estaSeleccionado && { color: getColorPorValor(opcion.label) }
                    ]}
                  >
                    {opcion.value}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  contenedor: {
    marginBottom: 16,
  },
  tituloCriterio: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colores.primario,
    marginTop: 16,
    marginBottom: 12,
    backgroundColor: '#e8eaf6',
    padding: 10,
    borderRadius: 4,
  },
  indicador: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colores.borde,
  },
  nombreIndicador: {
    fontSize: 16,
    fontWeight: '500',
    color: colores.texto,
    marginBottom: 8,
  },
  opcionesGrilla: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  opcion: {
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: 4,
    padding: 8,
    marginVertical: 4,
    width: '19%',
    alignItems: 'center',
  },
  textoOpcion: {
    fontSize: 12,
    textAlign: 'center',
    color: colores.texto,
  },
  valorOpcion: {
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
    color: colores.texto,
  },
});

export default CriterioEvaluacion;
