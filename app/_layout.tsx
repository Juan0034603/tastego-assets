import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { inicializarBaseDatos } from '../services/baseDatos';

export default function RootLayout() {

  useEffect(() => {
    async function arrancar() {
      try {
        await inicializarBaseDatos();
        console.log('✅ Base de datos lista');
      } catch (error) {
        console.error('❌ Error iniciando base de datos:', error);
      }
    }
    arrancar();
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="inicio" />
        <Stack.Screen name="visor3d" />

        <Stack.Screen name="registro" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="busqueda" />
        <Stack.Screen name="restperfil" />
        <Stack.Screen name="menu" />
        <Stack.Screen name="notificaciones" />
        <Stack.Screen name="mapa" />
        <Stack.Screen name="onboarding" />
      </Stack>
    </>
  );
}