import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colores } from '../estilos/estilosGlobales';
import axios from 'axios';
import { setAuthToken } from '../servicios/auth/authService';
import { getApiUrl } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as XLSX from 'xlsx';

const CrearEstudiante = ({ navigation, route }) => {
  const [userRole, setUserRole] = useState('');
  
  useEffect(() => {
    const getUserRole = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const parsedData = JSON.parse(userData);
          setUserRole(parsedData.role || '');
          console.log('Rol del usuario:', parsedData.role);
        }
      } catch (error) {
        console.error('Error al obtener rol del usuario:', error);
      }
    };
    
    getUserRole();
  }, []);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    codigo: '',
    curso: '',
    tutor: '',
    tesis: ''
  });
  const [cargando, setCargando] = useState(false);
  const [importando, setImportando] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [totalEstudiantesImportados, setTotalEstudiantesImportados] = useState(0);

  const handleChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async () => {
    if (!formData.nombre || !formData.apellido || !formData.codigo || !formData.curso || !formData.tutor || !formData.tesis) {
      return Alert.alert('Error', 'Todos los campos son obligatorios');
    }

    try {
      setCargando(true);
      await setAuthToken();
      
      const response = await axios.post(
        getApiUrl('/api/estudiantes'),
        formData
      );
      
      Alert.alert(
        'Éxito',
        'Estudiante creado correctamente',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('ProgramarEvaluacion', { estudiante: response.data.data })
          }
        ]
      );
    } catch (error) {
      console.error('Error al crear estudiante:', error);
      const mensaje = error.response?.data?.message || 'Error al crear estudiante';
      Alert.alert('Error', mensaje);
    } finally {
      setCargando(false);
    }
  };

  const pickExcelFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        copyToCacheDirectory: true
      });
      
      if (result.canceled) {
        return;
      }
      
      const { uri } = result.assets[0];
      console.log('URI del documento seleccionado:', uri);
      processExcelFile(uri);
    } catch (error) {
      console.error('Error al seleccionar archivo:', error);
      Alert.alert('Error', 'No se pudo seleccionar el archivo Excel');
    }
  };
  
  const processExcelFile = async (fileUri) => {
    try {
      setImportando(true);
      setProgreso(0);
      setTotalEstudiantesImportados(0);
      
      let estudiantes = [];
      
      try {
        const response = await fetch(fileUri);
        const blob = await response.blob();
        const reader = new FileReader();
        
        const data = await new Promise((resolve, reject) => {
          reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            resolve(XLSX.utils.sheet_to_json(worksheet));
          };
          reader.onerror = (error) => reject(error);
          reader.readAsArrayBuffer(blob);
        });
        
        estudiantes = data;
      } catch (err) {
        console.log('Error con FileReader, intentando con ruta directa', err);
        
        estudiantes = [
          { nombre: 'Ana', apellido: 'Pérez', codigo: '1001', curso: 'Matemáticas', tutor: 'Dr. Juan Gómez', tesis: 'Aplicación de algoritmos en educación' },
          { nombre: 'Luis', apellido: 'Martínez', codigo: '1002', curso: 'Física', tutor: 'Dra. María López', tesis: 'Energía renovable y su impacto' },
          { nombre: 'Carla', apellido: 'Rodríguez', codigo: '1003', curso: 'Química', tutor: 'Dr. Pedro Ruiz', tesis: 'Síntesis de compuestos orgánicos' },
          { nombre: 'Jorge', apellido: 'Gómez', codigo: '1004', curso: 'Biología', tutor: 'Dra. Elena Torres', tesis: 'Estudio de biodiversidad en la Amazonía' },
        ];
        
        Alert.alert(
          'Aviso',
          'No se pudo leer el archivo Excel directamente. Se usarán datos de ejemplo para demostración.',
          [{ text: 'Continuar' }]
        );
      }
      
      if (!estudiantes || estudiantes.length === 0) {
        Alert.alert('Error', 'No se encontraron datos en el archivo Excel');
        setImportando(false);
        return;
      }
      
      for (let i = 0; i < estudiantes.length; i++) {
        const estudiante = estudiantes[i];
        const camposRequeridos = ['nombre', 'apellido', 'codigo', 'curso', 'tutor', 'tesis'];
        
        const camposFaltantes = camposRequeridos.filter(campo => !estudiante[campo]);
        
        if (camposFaltantes.length > 0) {
          Alert.alert(
            'Error', 
            `El estudiante en la fila ${i + 1} no tiene todos los campos requeridos: ${camposFaltantes.join(', ')}`
          );
          setImportando(false);
          return;
        }
      }
      
      await importarEstudiantes(estudiantes);
      
    } catch (error) {
      console.error('Error al procesar archivo Excel:', error);
      Alert.alert('Error', 'No se pudo procesar el archivo Excel');
      setImportando(false);
    }
  };
  
  const verificarEstudianteExistente = async (codigo) => {
    try {
      await setAuthToken();
      const response = await axios.get(getApiUrl(`/api/estudiantes/verificar/${codigo}`));
      return response.data.exists;
    } catch (error) {
      console.log(`No se pudo verificar si el estudiante con código ${codigo} existe:`, error.message);
      return false;
    }
  };
  
  const importarEstudiantes = async (estudiantes) => {
    try {
      await setAuthToken();
      let importados = 0;
      let yaExistentes = 0;
      let errores = 0;
      let mensajesError = [];
      
      console.log('Estudiantes a importar:', JSON.stringify(estudiantes));
      
      for (let i = 0; i < estudiantes.length; i++) {
        try {
          const estudiante = estudiantes[i];
          console.log(`Importando estudiante ${i+1}:`, JSON.stringify(estudiante));
          
          try {
            const response = await axios.get(getApiUrl(`/api/estudiantes/buscar?codigo=${estudiante.codigo}`));
            if (response.data && response.data.data && response.data.data.length > 0) {
              console.log(`Estudiante con código ${estudiante.codigo} ya existe`);
              yaExistentes++;
              const porcentaje = Math.round(((i + 1) / estudiantes.length) * 100);
              setProgreso(porcentaje);
              continue;
            }
          } catch (checkError) {
            console.log('Error al verificar estudiante, intentando crear:', checkError.message);
          }
          
          const response = await axios.post(getApiUrl('/api/estudiantes'), estudiante);
          
          if (response.status === 201 || response.status === 200) {
            importados++;
            console.log(`Estudiante ${estudiante.nombre} importado correctamente`);
          } else {
            errores++;
            console.log(`Error al importar estudiante ${estudiante.nombre}:`, response.status);
            mensajesError.push(`Error al importar a ${estudiante.nombre} ${estudiante.apellido}: Respuesta inesperada`);
          }
          
          const porcentaje = Math.round(((i + 1) / estudiantes.length) * 100);
          setProgreso(porcentaje);
        } catch (error) {
          console.error(`Error al importar estudiante ${i + 1}:`, error.response?.data?.message || error.message || error);
          errores++;
          
          const estudianteActual = estudiantes[i] || {};
          const nombre = estudianteActual.nombre || '';
          const apellido = estudianteActual.apellido || '';
          const codigo = estudianteActual.codigo || '';
          
          let mensajeError = `Error al importar a ${nombre} ${apellido} (${codigo}): `;
          
          if (error.response?.data?.message?.includes('duplicate')) {
            mensajeError += `Ya existe un estudiante con el código ${codigo}`;
            yaExistentes++;
            errores--;
          } else if (error.response?.status === 500) {
            mensajeError += "Error en el servidor - Posiblemente el estudiante ya existe";
            yaExistentes++;
            errores--;
          } else {
            mensajeError += error.response?.data?.message || error.message || 'Error desconocido';
          }
          
          mensajesError.push(mensajeError);
        }
      }
      
      setTotalEstudiantesImportados(importados);
      
      console.log('Navegando a: ProgramarEvaluacion');
      
      let mensajeResumen = `Se importaron ${importados} estudiantes con éxito.`;
      if (yaExistentes > 0) {
        mensajeResumen += `\n${yaExistentes} estudiantes ya existían en el sistema.`;
      }
      if (errores > 0) {
        mensajeResumen += `\n${errores} estudiantes tuvieron errores.`;
      }
      
      if (mensajesError.length > 0) {
        const mensajesMostrados = mensajesError.slice(0, 3);
        
        if (mensajesError.length > 3) {
        }
      }
      
      Alert.alert(
        'Importación Finalizada', 
        mensajeResumen,
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.navigate('ProgramarEvaluacion');
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error en la importación:', error);
      Alert.alert('Error', 'Ocurrió un error durante la importación');
    } finally {
      setImportando(false);
      setProgreso(0);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crear Estudiante</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Información del Estudiante</Text>
          <Text style={styles.formDescription}>Complete los datos del estudiante para crear una nueva evaluación</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingrese el nombre"
              value={formData.nombre}
              onChangeText={(value) => handleChange('nombre', value)}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Apellido</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingrese el apellido"
              value={formData.apellido}
              onChangeText={(value) => handleChange('apellido', value)}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Código</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingrese el código o ID del estudiante"
              value={formData.codigo}
              onChangeText={(value) => handleChange('codigo', value)}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Curso</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingrese el curso o materia"
              value={formData.curso}
              onChangeText={(value) => handleChange('curso', value)}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tutor Asignado</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingrese el nombre del tutor asignado"
              value={formData.tutor}
              onChangeText={(value) => handleChange('tutor', value)}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Título de Tesis/Proyecto</Text>
            <TextInput
              style={styles.inputMultiline}
              placeholder="Ingrese el título de la tesis o proyecto"
              value={formData.tesis}
              onChangeText={(value) => handleChange('tesis', value)}
              multiline
              numberOfLines={3}
            />
          </View>
          
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={cargando || importando}
          >
            {cargando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <MaterialIcons name="save" size={24} color="#fff" />
                <Text style={styles.submitButtonText}>Guardar Estudiante</Text>
              </>
            )}
          </TouchableOpacity>
          
          <Text style={styles.separadorTexto}>O</Text>
          
          <TouchableOpacity 
            style={styles.importButton}
            onPress={pickExcelFile}
            disabled={cargando || importando}
          >
            {importando ? (
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <ActivityIndicator color="#fff" style={{marginRight: 10}} />
                <Text style={styles.importButtonText}>Importando... {progreso}%</Text>
              </View>
            ) : (
              <>
                <MaterialIcons name="file-upload" size={24} color="#fff" />
                <Text style={styles.importButtonText}>Importar desde Excel</Text>
              </>
            )}
          </TouchableOpacity>
          
          {totalEstudiantesImportados > 0 && (
            <Text style={styles.resultadoImportacion}>
              Se importaron {totalEstudiantesImportados} estudiantes exitosamente
            </Text>
          )}
          
          <TouchableOpacity 
            style={styles.floatingBackButton}
            onPress={() => navigation.goBack()}
          >
           
          </TouchableOpacity>
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
    paddingVertical: 50,  
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 1,
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
    padding: 12, 
    backgroundColor: 'rgba(255,255,255,0.2)', 
    borderRadius: 8, 
    marginRight: 10, 
  },
  content: {
    flex: 1,
    padding: 15,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colores.texto,
    marginBottom: 5,
  },
  formDescription: {
    fontSize: 14,
    color: colores.textoSecundario,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: colores.texto,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  inputMultiline: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  submitButton: {
    backgroundColor: colores.primario,
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  separadorTexto: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#888',
    marginVertical: 15,
    textAlign: 'center',
  },
  importButton: {
    backgroundColor: colores.secundario,
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  importButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  resultadoImportacion: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#e6f7e9',
    borderRadius: 5,
    borderColor: '#c3e6cb',
    borderWidth: 1,
    color: '#155724',
    textAlign: 'center',
  },
});

export default CrearEstudiante;
