import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getUsuarios, actualizarUsuario, eliminarUsuario } from '../servicios/auth/authService';
import { Picker } from '@react-native-picker/picker';
import { colores, estilosGlobales } from '../estilos/estilosGlobales';

const PantallaGestionUsuarios = ({ navigation }) => {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [usuarioEdit, setUsuarioEdit] = useState(null);
  const [formData, setFormData] = useState({ 
    nombre: '', 
    apellido: '', 
    correo: '', 
    telefono: '', 
    tipo: 'lector',
    contraseña: ''
  });

  const fetchUsuarios = async () => {
    try {
      setCargando(true);
      const data = await getUsuarios();
      setUsuarios(data);
    } catch (err) {
      Alert.alert('Error', err.message || 'No se pudo obtener usuarios');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchUsuarios);
    return unsubscribe;
  }, [navigation]);

  const abrirModalEdicion = (usuario) => {
    setUsuarioEdit(usuario);
    setFormData({
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      correo: usuario.correo,
      telefono: usuario.telefono || '',
      tipo: usuario.tipo,
    });
    setModalVisible(true);
  };

  const handleGuardar = async () => {
    try {
      // Validar formato de correo
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (formData.correo && !emailRegex.test(formData.correo)) {
        Alert.alert('Error', 'Por favor ingrese un correo electrónico válido');
        return;
      }

      // Validar longitud de contraseña si se proporciona
      if (formData.contraseña && formData.contraseña.length < 6) {
        Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
        return;
      }

      // Crear un objeto con solo los campos que tienen valor (excepto contraseña vacía)
      const datosActualizacion = { ...formData };
      if (!datosActualizacion.contraseña) {
        delete datosActualizacion.contraseña;
      }
      
      await actualizarUsuario(usuarioEdit.id || usuarioEdit._id, datosActualizacion);
      Alert.alert('Éxito', 'Usuario actualizado');
      setModalVisible(false);
      fetchUsuarios();
    } catch (err) {
      // Mostrar mensajes de error más amigables
      if (err.message.includes('shorter than the minimum allowed length')) {
        Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      } else if (err.message.includes('Ya existe un usuario')) {
        Alert.alert('Error', 'Ya existe un usuario con ese correo');
      } else if (err.message.includes('correo') || err.message.includes('correo electrónico')) {
        Alert.alert('Error', err.message);
      } else {
        Alert.alert('Error', err.message || 'No se pudo actualizar');
      }
    }
  };

  const handleEliminar = (usuario) => {
    Alert.alert('Confirmar eliminación', `¿Eliminar usuario ${usuario.nombre}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive', onPress: async () => {
          try {
            await eliminarUsuario(usuario.id || usuario._id);
            fetchUsuarios();
          } catch (err) {
            Alert.alert('Error', err.message || 'No se pudo eliminar');
          }
        }
      }
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <View>
        <Text style={styles.nombre}>{item.nombre} {item.apellido}</Text>
        <Text style={styles.detalle}>{item.correo}</Text>
        <Text style={styles.detalle}>Tel: {item.telefono || '—'} | Rol: {item.tipo}</Text>
      </View>
      <View style={styles.itemActions}>
        <TouchableOpacity onPress={() => abrirModalEdicion(item)} style={styles.actionButton}>
          <MaterialIcons name="edit" size={24} color="#fff" />
        </TouchableOpacity>
        
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={28} color="#fff" />
          <Text style={styles.backText}>Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gestión de Usuarios</Text>
      </View>

      {cargando ? (
        <ActivityIndicator size="large" color={colores.primario} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={usuarios}
          keyExtractor={(item) => item._id || item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
        />
      )}

      {/* Modal edición */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Editar Usuario</Text>
            {['nombre','apellido','correo','telefono','contraseña'].map((campo)=>(
              <View key={campo} style={styles.inputRow}>
                <Text style={styles.label}>{campo.charAt(0).toUpperCase()+campo.slice(1)}</Text>
                <TextInput
                  style={[styles.input,{flex:1}]}
                  value={formData[campo]}
                  onChangeText={(v)=>setFormData({...formData,[campo]:v})}
                  secureTextEntry={campo === 'contraseña'}
                  placeholder={campo === 'contraseña' ? 'Dejar en blanco para no cambiar' : ''}
                />
              </View>
            ))}
            <View style={styles.inputRow}>
              <Text style={styles.label}>Tipo</Text>
              <Picker
                selectedValue={formData.tipo}
                style={{flex:1}}
                onValueChange={(itemValue)=>setFormData({...formData,tipo:itemValue})}
              >
                <Picker.Item label="Lector" value="lector" />
                <Picker.Item label="Secretario" value="secretario" />
                <Picker.Item label="Tecnico" value="tecnico" />
                <Picker.Item label="Director" value="director" />
              </Picker>
            </View>
            <View style={{ flexDirection:'row',justifyContent:'space-between',marginTop:10 }}>
              <TouchableOpacity style={[styles.btn,{backgroundColor:colores.primario}]} onPress={handleGuardar}>
                <Text style={styles.btnText}>Guardar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn,{backgroundColor:colores.deficiente}]} onPress={()=>setModalVisible(false)}>
                <Text style={styles.btnText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container:{ flex:1, backgroundColor:'#f5f5f5' },
  header:{ backgroundColor:colores.primario, padding:15, paddingTop:Platform.OS==='android'?StatusBar.currentHeight+10:45, flexDirection:'row', alignItems:'center'},
  backButton:{ flexDirection:'row', alignItems:'center'},
  backText:{ color:'#fff', marginLeft:4 },
  headerTitle:{ color:'#fff', fontSize:18, fontWeight:'bold', marginLeft:16 },
  itemContainer:{ flexDirection:'row', justifyContent:'space-between', backgroundColor:'#fff', padding:12, marginBottom:10, borderRadius:6, elevation:2 },
  nombre:{ fontSize:16, fontWeight:'bold' },
  detalle:{ fontSize:12, color:'#555' },
  itemActions:{ flexDirection:'row', alignItems:'center' },
  actionButton:{ backgroundColor:colores.secundario, padding:6, borderRadius:4, marginLeft:8 },
  modalOverlay:{ flex:1, backgroundColor:'rgba(0,0,0,0.5)', justifyContent:'center', alignItems:'center' },
  modalContainer:{ backgroundColor:'#fff', width:'85%', padding:16, borderRadius:8 },
  modalTitle:{ fontSize:16, fontWeight:'bold', marginBottom:10 },
  input:{ borderWidth:1, borderColor:'#ccc', borderRadius:4, padding:8, marginBottom:8 },
  btn:{ flex:1, padding:10, borderRadius:4, alignItems:'center', marginHorizontal:4 },
  btnText:{ color:'#fff', fontWeight:'bold' },
  inputRow:{ flexDirection:'row', alignItems:'center', marginBottom:8 },
  label:{ width:90 }
});

export default PantallaGestionUsuarios;
