import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, AppState, StyleSheet, View } from 'react-native';

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
import PantallaLogin from '../pantallas/PantallaLogin';
import PantallaNuevaEvaluacion from '../pantallas/PantallaNuevaEvaluacion';
import PantallaRegistro from '../pantallas/PantallaRegistro';
import ProgramarEvaluacion from '../pantallas/ProgramarEvaluacion';

import { colores } from '../estilos/estilosGlobales';
import { getUserRole, isAuthenticated, setAuthToken } from '../servicios/auth/authService';

import AuthContext, { useAuth } from '../contextos/AuthContext';

export { useAuth };

const Stack = createStackNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="PantallaLogin" component={PantallaLogin} />
    <Stack.Screen name="PantallaRegistro" component={PantallaRegistro} />
  </Stack.Navigator>
);

const AdminStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="PantallaInicioAdmin" component={PantallaInicioAdmin} />
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
    <Stack.Screen name="PantallaEstadisticas" component={PantallaEstadisticas} />
    <Stack.Screen name="PantallaAyuda" component={PantallaAyuda} />
  </Stack.Navigator>
);

const NavegacionPrincipal = () => {
  const [cargandoAutenticacion, setCargandoAutenticacion] = useState(true);
  const [usuarioAutenticado, setUsuarioAutenticado] = useState(false);
  const [rol, setRol] = useState(null);
  const [tokenValido, setTokenValido] = useState(false);
  
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

  useEffect(() => {
    checkAuth();
    
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        checkAuth();
      }
    });
    
    return () => {
      subscription.remove();
    };
  }, [checkAuth]);

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
