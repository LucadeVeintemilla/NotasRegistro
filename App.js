import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Navegacion from './src/navegacion/Navegacion';
import { inicializarRubrica } from './src/basedatos/rubricaServicio';

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
      <Navegacion />
    </SafeAreaProvider>
  );
}
