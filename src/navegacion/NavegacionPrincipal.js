import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, StyleSheet, View, Alert, BackHandler } from 'react-native';
import { logout } from '../servicios/auth/authService';

import CrearEstudiante from '../pantallas/CrearEstudiante';
import PantallaAsignarHorario from '../pantallas/PantallaAsignarHorario';
import PantallaAyuda from '../pantallas/PantallaAyuda';
import PantallaBuscarEvaluaciones from '../pantallas/PantallaBuscarEvaluaciones';
import PantallaCalificarEvaluacion from '../pantallas/PantallaCalificarEvaluacion';
import PantallaCrearEstudiante from '../pantallas/PantallaCrearEstudiante';
import PantallaDetalleEvaluacion from '../pantallas/PantallaDetalleEvaluacion';
import PantallaEstadisticas from '../pantallas/PantallaEstadisticas';
import PantallaInicio from '../pantallas/PantallaInicio';
import PantallaInicioAdmin from '../pantallas/PantallaInicioAdmin';
import PantallaInicioLector from '../pantallas/PantallaInicioLector';
import PantallaInicioSecretario from '../pantallas/PantallaInicioSecretario';
import PantallaInicioTecnico from '../pantallas/PantallaInicioTecnico';
import PantallaLogin from '../pantallas/PantallaLogin';
import PantallaNuevaEvaluacion from '../pantallas/PantallaNuevaEvaluacion';
import PantallaRegistro from '../pantallas/PantallaRegistro';
import PantallaRegistroUsuarios from '../pantallas/PantallaRegistroUsuarios';
import PantallaRegistroUsuariosAdmin from '../pantallas/PantallaRegistroUsuariosAdmin';
import PantallaGestionUsuarios from '../pantallas/PantallaGestionUsuarios';
import ProgramarEvaluacion from '../pantallas/ProgramarEvaluacion';
import CambiarContrasena from '../pantallas/CambiarContrasena';

import { colores } from '../estilos/estilosGlobales';
import { getUserRole, isAuthenticated, setAuthToken } from '../servicios/auth/authService';

import AuthContext, { useAuth } from '../contextos/AuthContext';

export { useAuth };

const Stack = createStackNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="PantallaLogin" component={PantallaLogin} />
    <Stack.Screen name="PantallaRegistro" component={PantallaRegistro} />
    <Stack.Screen name="CambiarContrasena" component={CambiarContrasena} />
  </Stack.Navigator>
);

const AdminStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="PantallaInicioAdmin" component={PantallaInicioAdmin} />
    <Stack.Screen name="PantallaRegistroUsuariosAdmin" component={PantallaRegistroUsuariosAdmin} />
    <Stack.Screen name="PantallaGestionUsuarios" component={PantallaGestionUsuarios} />
    <Stack.Screen name="CrearEstudiante" component={CrearEstudiante} />
    <Stack.Screen name="ProgramarEvaluacion" component={ProgramarEvaluacion} />
    <Stack.Screen name="PantallaAyuda" component={PantallaAyuda} />
  </Stack.Navigator>
);

const LectorStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="PantallaInicioLector" component={PantallaInicioLector} />
    <Stack.Screen name="PantallaCalificarEvaluacion" component={PantallaCalificarEvaluacion} />
    <Stack.Screen name="PantallaNuevaEvaluacion" component={PantallaNuevaEvaluacion} />
    <Stack.Screen name="PantallaBuscarEvaluaciones" component={PantallaBuscarEvaluaciones} />
    <Stack.Screen name="PantallaDetalleEvaluacion" component={PantallaDetalleEvaluacion} />
    <Stack.Screen name="PantallaEstadisticas" component={PantallaEstadisticas} />
    <Stack.Screen name="PantallaAyuda" component={PantallaAyuda} />
    <Stack.Screen name="CambiarContrasena" component={CambiarContrasena} />
  </Stack.Navigator>
);

const DirectorStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="PantallaInicio" component={PantallaInicio} />
    <Stack.Screen name="CrearEstudiante" component={CrearEstudiante} />
    <Stack.Screen name="ProgramarEvaluacion" component={ProgramarEvaluacion} />
    <Stack.Screen name="PantallaNuevaEvaluacion" component={PantallaNuevaEvaluacion} />
    <Stack.Screen name="PantallaBuscarEvaluaciones" component={PantallaBuscarEvaluaciones} />
    <Stack.Screen name="PantallaDetalleEvaluacion" component={PantallaDetalleEvaluacion} />
    <Stack.Screen name="PantallaCalificarEvaluacion" component={PantallaCalificarEvaluacion} />
    <Stack.Screen name="PantallaEstadisticas" component={PantallaEstadisticas} />
    <Stack.Screen name="PantallaAyuda" component={PantallaAyuda} />
    <Stack.Screen name="CambiarContrasena" component={CambiarContrasena} />
  </Stack.Navigator>
);

const TecnicoStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="PantallaInicioTecnico" component={PantallaInicioTecnico} />
    <Stack.Screen name="PantallaRegistroUsuarios" component={PantallaRegistroUsuarios} />
    <Stack.Screen name="ProgramarEvaluacion" component={ProgramarEvaluacion} />
    <Stack.Screen name="PantallaAyuda" component={PantallaAyuda} />
  </Stack.Navigator>
);

const SecretarioStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="PantallaInicioSecretario" component={PantallaInicioSecretario} />
    <Stack.Screen name="PantallaRegistroUsuarios" component={PantallaRegistroUsuarios} />
    <Stack.Screen name="CrearEstudiante" component={CrearEstudiante} />
    <Stack.Screen name="ProgramarEvaluacion" component={ProgramarEvaluacion} />
    <Stack.Screen name="PantallaAyuda" component={PantallaAyuda} />
  </Stack.Navigator>
);

const NavegacionPrincipal = () => {
  const [cargandoAutenticacion, setCargandoAutenticacion] = useState(true);
  const [usuarioAutenticado, setUsuarioAutenticado] = useState(false);
  const [rol, setRol] = useState(null);
  const [tokenValido, setTokenValido] = useState(false);
  const tiempoInactividad = useRef(null);
  const tiempoInactividadRef = useRef(null);
  const SEGUNDOS_INACTIVIDAD = 15 * 60; // 15 minutos en segundos
  
  const actualizarAutenticacion = useCallback(async () => {
    setCargandoAutenticacion(true);
    try {
      const autenticado = await isAuthenticated();
      setUsuarioAutenticado(autenticado);
      
      if (autenticado) {
        const rolUsuario = await getUserRole();
        setRol(rolUsuario);
        setTokenValido(true);
      } else {
        setRol(null);
        setTokenValido(false);
      }
    } catch (error) {
      console.error('Error al verificar autenticación:', error);
      setUsuarioAutenticado(false);
      setRol(null);
      setTokenValido(false);
    } finally {
      setCargandoAutenticacion(false);
    }
  }, []);

  const checkAuth = useCallback(async () => {
    setCargandoAutenticacion(true);
    try {
      const autenticado = await isAuthenticated();
      setUsuarioAutenticado(autenticado);

      if (autenticado) {
        await setAuthToken();
        const rol = await getUserRole();
        setRol(rol);
      } else {
        setRol(null);
      }
    } catch (error) {
      console.error('Error al verificar autenticación:', error);
      setUsuarioAutenticado(false);
      setRol(null);
    } finally {
      setCargandoAutenticacion(false);
    }
  }, []);

  // Función para reiniciar el temporizador de inactividad
  const reiniciarTemporizador = useCallback(() => {
    if (tiempoInactividadRef.current) {
      clearTimeout(tiempoInactividadRef.current);
    }
    
    tiempoInactividadRef.current = setTimeout(async () => {
      // Mostrar alerta antes de cerrar sesión
      Alert.alert(
        'Sesión inactiva',
        'Su sesión ha expirado por inactividad. Será redirigido a la pantalla de inicio de sesión.',
        [
          {
            text: 'Aceptar',
            onPress: async () => {
              await logout();
              setUsuarioAutenticado(false);
              setRol(null);
              setTokenValido(false);
            },
          },
        ],
        { cancelable: false }
      );
    }, SEGUNDOS_INACTIVIDAD * 1000);
  }, []);

  // Efecto para manejar la inactividad
  useEffect(() => {
    if (!usuarioAutenticado) return;
    
    // Configurar el temporizador inicial
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    // Iniciar el temporizador
    reiniciarTemporizador();
    
    // Limpiar al desmontar
    return () => {
      if (tiempoInactividadRef.current) {
        clearTimeout(tiempoInactividadRef.current);
      }
      subscription.remove();
    };
  }, [usuarioAutenticado, reiniciarTemporizador]);
  
  // Manejar cambios en el estado de la aplicación
  const handleAppStateChange = (nextAppState) => {
    if (nextAppState === 'active') {
      // Reiniciar el temporizador cuando la app vuelve a primer plano
      reiniciarTemporizador();
    } else if (nextAppState === 'background' || nextAppState === 'inactive') {
      // Limpiar el temporizador cuando la app va a segundo plano
      if (tiempoInactividadRef.current) {
        clearTimeout(tiempoInactividadRef.current);
      }
    }
  };

  // Efecto para verificar autenticación y manejar cambios en el estado de la app
  useEffect(() => {
    checkAuth();
    
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        checkAuth();
        // Reiniciar el temporizador cuando la app vuelve a estar activa
        if (usuarioAutenticado) {
          reiniciarTemporizador();
        }
      } else if (nextAppState === 'background') {
        // Limpiar el temporizador cuando la app va a segundo plano
        if (tiempoInactividadRef.current) {
          clearTimeout(tiempoInactividadRef.current);
        }
      }
    });
    
    return () => {
      subscription.remove();
      if (tiempoInactividadRef.current) {
        clearTimeout(tiempoInactividadRef.current);
      }
    };
  }, [checkAuth, usuarioAutenticado, reiniciarTemporizador]);

  if (cargandoAutenticacion) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colores.primario} />
      </View>
    );
  }

  const authContextValue = {
    isAuthenticated: usuarioAutenticado,
    userRole: rol,
    loading: cargandoAutenticacion,
    refreshAuth: checkAuth 
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      <NavigationContainer>
        {!usuarioAutenticado ? (
          <AuthStack />
        ) : (
          <>
            {rol === 'administrador' && <AdminStack />}
            {rol === 'lector' && <LectorStack />}
            {rol === 'director' && <DirectorStack />}
            {rol === 'tecnico' && <TecnicoStack />}
            {rol === 'secretario' && <SecretarioStack />}
          </>
        )}
      </NavigationContainer>
    </AuthContext.Provider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});

export default NavegacionPrincipal;
