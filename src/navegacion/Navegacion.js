import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Importamos las pantallas
import PantallaInicio from '../pantallas/PantallaInicio';
import PantallaNuevaEvaluacion from '../pantallas/PantallaNuevaEvaluacion';
import PantallaDetalleEvaluacion from '../pantallas/PantallaDetalleEvaluacion';
import PantallaEstadisticas from '../pantallas/PantallaEstadisticas';

const Stack = createNativeStackNavigator();

/**
 * Componente principal de navegación de la aplicación
 * @returns {React.Component} Navegación principal de la aplicación
 */
const Navegacion = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Inicio"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Inicio" component={PantallaInicio} />
        <Stack.Screen name="NuevaEvaluacion" component={PantallaNuevaEvaluacion} />
        <Stack.Screen name="DetalleEvaluacion" component={PantallaDetalleEvaluacion} />
        <Stack.Screen name="Estadisticas" component={PantallaEstadisticas} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navegacion;
