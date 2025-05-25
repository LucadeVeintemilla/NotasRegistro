import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { inicializarRubrica } from './src/basedatos/rubricaServicio';
import NavegacionPrincipal from './src/navegacion/NavegacionPrincipal';

/**
 * Componente principal de la aplicación
 * @returns {React.Component} Componente raíz de la aplicación
 */
export default function App() {
  useEffect(() => {
    inicializarRubrica();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor="#3f51b5" />
      <NavegacionPrincipal />
    </SafeAreaProvider>
  );
}
