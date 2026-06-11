// app/onboarding.tsx

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CLAVES } from '../services/claves';

const { width, height } = Dimensions.get('window');

const PANTALLAS = [
  {
    id: 1,
    titulo: 'Descubre los sabores que te rodean',
    descripcion: 'Explora rutas gastronómicas y encuentra los mejores restaurantes y platos típicos cerca de ti.',
    boton: '¡Comenzar!',
  },
  {
    id: 2,
    titulo: 'Una nueva forma de disfrutar la comida',
    descripcion: 'Prueba los platos en 3D con realidad aumentada y vive experiencias únicas antes de ordenar.',
    boton: '¡Quiero probar!',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [pantallaActual, setPantallaActual] = useState(0);

  const pantalla = PANTALLAS[pantallaActual];

  // ─── Al presionar el botón ────────────────────────────────────────────────
  async function manejarBoton() {
    if (pantallaActual < PANTALLAS.length - 1) {
      // Hay más pantallas → avanzar a la siguiente
      setPantallaActual(pantallaActual + 1);
    } else {
      // Era la última pantalla → guardar que ya vio el onboarding y ir a Home
      await AsyncStorage.setItem(CLAVES.ONBOARDING_VISTO, 'true');
      router.replace('/(tabs)');
    }
  }

  return (
    <View style={styles.container}>

      {/* CÍRCULO DECORATIVO */}
      <View style={styles.circulo} />

      {/* CONTENIDO */}
      <View style={styles.contenido}>

        {/* INDICADORES DE PÁGINA */}
        <View style={styles.indicadores}>
          {PANTALLAS.map((_, i) => (
            <View
              key={i}
              style={[
                styles.indicador,
                i === pantallaActual && styles.indicadorActivo,
              ]}
            />
          ))}
        </View>

        {/* TÍTULO */}
        <Text style={styles.titulo}>{pantalla.titulo}</Text>

        {/* DESCRIPCIÓN */}
        <Text style={styles.descripcion}>{pantalla.descripcion}</Text>

        {/* BOTÓN */}
        <TouchableOpacity
          style={styles.btn}
          activeOpacity={0.85}
          onPress={manejarBoton}
        >
          <Text style={styles.btnTxt}>{pantalla.boton}</Text>
        </TouchableOpacity>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  circulo: {
    width: width * 0.75,
    height: width * 0.75,
    borderRadius: width * 0.375,
    backgroundColor: '#E8392A',
    marginTop: height * 0.1,
  },
  contenido: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 40,
  },
  indicadores: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 28,
  },
  indicador: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E5E5',
  },
  indicadorActivo: {
    width: 24,
    backgroundColor: '#E8392A',
  },
  titulo: {
    fontSize: 24,
    fontWeight: '700',
    color: '#E8392A',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 32,
  },
  descripcion: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
  },
  btn: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E8392A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnTxt: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});