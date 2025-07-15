import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colores } from '../estilos/estilosGlobales';

/**
 * Pantalla de Ayuda con información sobre la aplicación y su uso
 * @param {Object} navigation - Objeto de navegación
 * @returns {React.Component} Componente de la pantalla de ayuda
 */
const PantallaAyuda = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ayuda</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.seccion}>
          <Text style={styles.tituloSeccion}>Sobre la Aplicación</Text>
          <Text style={styles.parrafo}>
            Registro de Notas es una aplicación diseñada para facilitar la disertación 
            de estudiantes durante la presentación de sus proyectos o tesis.
          </Text>
        </View>

        <View style={styles.seccion}>
          <Text style={styles.tituloSeccion}>Roles de Usuario</Text>
          
          <Text style={styles.subtituloSeccion}>Administrador</Text>
          <Text style={styles.parrafo}>
            • Puede crear estudiantes{'\n'}
            • Puede programar disertaciones con rangos horarios{'\n'}
            • No puede calificar ni buscar disertaciones
          </Text>
          
          <Text style={styles.subtituloSeccion}>Lector</Text>
          <Text style={styles.parrafo}>
            • Solo puede calificar estudiantes ya creados{'\n'}
            • Solo puede calificar dentro del rango horario permitido{'\n'}
            • Puede buscar disertaciones realizadas
          </Text>
          
          <Text style={styles.subtituloSeccion}>Director</Text>
          <Text style={styles.parrafo}>
            • Puede crear estudiantes{'\n'}
            • Puede programar disertaciones{'\n'}
            • Puede calificar y buscar disertaciones
          </Text>
        </View>

        <View style={styles.seccion}>
          <Text style={styles.tituloSeccion}>Información de la Rúbrica</Text>
          <Text style={styles.parrafo}>
            La rúbrica utilizada para las disertaciones consta de 3 criterios principales:
          </Text>
          <View style={styles.listaCriterios}>
            <Text style={styles.itemCriterio}>• ACTITUD (2 indicadores)</Text>
            <Text style={styles.itemCriterio}>• DEL CONTENIDO DE LA PRESENTACIÓN (4 indicadores)</Text>
            <Text style={styles.itemCriterio}>• EXPOSICIÓN (4 indicadores)</Text>
          </View>
          <Text style={styles.parrafo}>
            Cada indicador se evalúa en una escala de Deficiente a Excelente, con valores numéricos específicos.
          </Text>
        </View>

        <View style={styles.seccion}>
          <Text style={styles.tituloSeccion}>Contacto</Text>
          <Text style={styles.parrafo}>
            Para cualquier consulta o soporte técnico, puede contactarnos a través de:
          </Text>
          <Text style={styles.contacto}>
            <MaterialIcons name="email" size={16} color={colores.primario} /> registronotas2025@gmail.com
          </Text>
        </View>
      </ScrollView>
    </View>
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
  backButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  seccion: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  tituloSeccion: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colores.primario,
    marginBottom: 10,
  },
  subtituloSeccion: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colores.texto,
    marginTop: 15,
    marginBottom: 5,
  },
  parrafo: {
    fontSize: 14,
    color: colores.texto,
    lineHeight: 20,
    marginBottom: 10,
  },
  listaCriterios: {
    marginLeft: 10,
    marginBottom: 10,
  },
  itemCriterio: {
    fontSize: 14,
    color: colores.texto,
    marginBottom: 5,
  },
  contacto: {
    fontSize: 14,
    color: colores.primario,
    marginLeft: 10,
    marginTop: 5,
    fontWeight: '500',
  },
});

export default PantallaAyuda;
