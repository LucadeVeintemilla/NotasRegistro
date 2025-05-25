import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import PantallaAsignarHorario from '../pantallas/PantallaAsignarHorario';
import PantallaBuscarEvaluaciones from '../pantallas/PantallaBuscarEvaluaciones';
import PantallaCrearEstudiante from '../pantallas/PantallaCrearEstudiante';
import PantallaDetalleEvaluacion from '../pantallas/PantallaDetalleEvaluacion';
import PantallaEstadisticas from '../pantallas/PantallaEstadisticas';
import PantallaInicio from '../pantallas/PantallaInicio';
import PantallaNuevaEvaluacion from '../pantallas/PantallaNuevaEvaluacion';

const Stack = createNativeStackNavigator();

/**
 * Componente principal de navegación de la aplicación
 * @returns {React.Component} Navegación principal de la aplicación
 */
const Navegacion = () => {
  return (
    <NavigationContainer>      <Stack.Navigator
        initialRouteName="PantallaInicio"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >        <Stack.Screen name="PantallaInicio" component={PantallaInicio} />
        <Stack.Screen name="PantallaNuevaEvaluacion" component={PantallaNuevaEvaluacion} />
        <Stack.Screen name="PantallaDetalleEvaluacion" component={PantallaDetalleEvaluacion} />
        <Stack.Screen name="PantallaEstadisticas" component={PantallaEstadisticas} />
        <Stack.Screen name="PantallaBuscarEvaluaciones" component={PantallaBuscarEvaluaciones} />
        <Stack.Screen name="PantallaCrearEstudiante" component={PantallaCrearEstudiante} />
        <Stack.Screen name="PantallaAsignarHorario" component={PantallaAsignarHorario} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navegacion;
