import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Platform } from 'react-native';
import { colores } from '../estilos/estilosGlobales';
import { AntDesign } from '@expo/vector-icons';

/**
 * Componente de cabecera para todas las pantallas
 * @param {Object} props Propiedades del componente
 * @param {string} props.titulo Título a mostrar en la cabecera
 * @param {Function} props.onAtras Función a ejecutar al presionar el botón de atrás (opcional)
 * @returns {React.Component} Componente de Cabecera
 */
const Cabecera = ({ titulo, onAtras }) => {
  return (
    <View style={styles.contenedor}>
      <StatusBar backgroundColor={colores.primario} barStyle="light-content" />
      <View style={styles.contenido}>
        {onAtras && (
          <TouchableOpacity style={styles.botonAtras} onPress={onAtras}>
            <AntDesign name="arrowleft" size={28} color={colores.textoClaro} />
          </TouchableOpacity>
        )}
        <Text style={styles.titulo} numberOfLines={1}>
          {titulo}
        </Text>
        <View style={styles.espacioDerecho} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  contenedor: {
    backgroundColor: colores.primario,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 5 : 50, 
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  contenido: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  titulo: {
    color: colores.textoClaro,
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  botonAtras: {
    padding: 10,
    marginLeft: 4,
    marginRight: 4,
  },
  espacioDerecho: {
    width: 40,
  },
});

export default Cabecera;
