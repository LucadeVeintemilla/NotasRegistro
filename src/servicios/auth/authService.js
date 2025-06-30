import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { getApiUrl } from '../../config/api';

const AUTH_BASE_PATH = '/api/auth';

export const registro = async (userData) => {
  try {
    const response = await axios.post(getApiUrl(`${AUTH_BASE_PATH}/registro`), userData);
    
    if (response.data.token) {
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('usuario', JSON.stringify(response.data.usuario));
    }
    
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Error en el servidor');
  }
};

export const login = async (correo, contraseña) => {
  try {
    const response = await axios.post(getApiUrl(`${AUTH_BASE_PATH}/login`), {
      correo,
      contraseña
    });
    
    if (response.data.token) {
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('usuario', JSON.stringify(response.data.usuario));
    }
    
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Error en el servidor');
  }
};

export const logout = async () => {
  try {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('usuario');
    return true;
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    return false;
  }
};

export const getCurrentUser = async () => {
  try {
    const usuario = await AsyncStorage.getItem('usuario');
    return usuario ? JSON.parse(usuario) : null;
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    return null;
  }
};

export const isAuthenticated = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    return !!token;
  } catch (error) {
    console.error('Error al verificar autenticación:', error);
    return false;
  }
};

export const setAuthToken = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return token;
    } else {
      delete axios.defaults.headers.common['Authorization'];
      throw new Error('No hay token de autenticación');
    }
  } catch (error) {
    console.error('Error al configurar token:', error);
    throw error;
  }
};

export const getUserRole = async () => {
  try {
    const usuario = await AsyncStorage.getItem('usuario');
    if (usuario) {
      const { tipo } = JSON.parse(usuario);
      return tipo;
    }
    return null;
  } catch (error) {
    console.error('Error al obtener rol del usuario:', error);
    return null;
  }
};

export const registrarPorTecnico = async (userData) => {
  try {
    await setAuthToken();
    const response = await axios.post(getApiUrl(`${AUTH_BASE_PATH}/registrar-por-tecnico`), userData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Error en el servidor');
  }
};

/**
 * Cambia la contraseña del usuario actual
 * @param {string} contraseñaActual - La contraseña actual del usuario
 * @param {string} nuevaContraseña - La nueva contraseña
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const cambiarContraseña = async (contraseñaActual, nuevaContraseña) => {
  try {
    const token = await setAuthToken();
    const response = await axios.put(
      getApiUrl(`${AUTH_BASE_PATH}/cambiar-password`), 
      { contraseñaActual, nuevaContraseña },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error en cambiarContraseña:', error.response?.data || error.message);
    throw error.response ? error.response.data : new Error('Error al cambiar la contraseña');
  }
};
