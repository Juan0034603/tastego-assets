// app/index.tsx

import { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Dimensions, Animated } from "react-native";
import { useRouter } from "expo-router";
import { useFonts, Pacifico_400Regular } from "@expo-google-fonts/pacifico";
import { verificarSesion } from "../services/servicioAutenticacion";
import * as Location from "expo-location";

const { width, height } = Dimensions.get("window");

const DIAGONAL = Math.sqrt(width * width + height * height);
const TAMANIO_FINAL = DIAGONAL * 2;

export default function SplashScreen() {
  const router = useRouter();
  const [fontsLoaded] = useFonts({ Pacifico_400Regular });
  const [destino, setDestino] = useState<string | null>(null);

  const escala = useRef(new Animated.Value(1)).current;
  const opacidadLogo = useRef(new Animated.Value(0)).current;
  const posicionLogo = useRef(new Animated.Value(0)).current;

  // ─── Animación del círculo ────────────────────────────────────────────────
  function reproducirAnimacion(): Promise<void> {
    return new Promise((resolve) => {
      Animated.sequence([
        // Pausa inicial para que el usuario vea el splash
        Animated.delay(600),

        // Círculo crece hasta cubrir toda la pantalla
        Animated.timing(escala, {
          toValue: TAMANIO_FINAL / 180,
          duration: 900,
          useNativeDriver: true,
        }),

        // Logo grande aparece con fade
        Animated.timing(opacidadLogo, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),

        // Pausa para que el usuario vea el logo
        Animated.delay(400),

        // Logo sube hacia su posición final
        Animated.timing(posicionLogo, {
          toValue: -height * 0.9,
          duration: 800,
          useNativeDriver: true,
        }),

        // Pausa final antes de redirigir
        Animated.delay(900),
      ]).start(() => resolve());
    });
  }

  // ─── Verificación de sesión y permisos ───────────────────────────────────
  async function verificarTodo(): Promise<void> {
    const tiempoMinimo = new Promise((resolve) => setTimeout(resolve, 2500));

    const haySesion = await verificarSesion();
    await Location.requestForegroundPermissionsAsync();

    await tiempoMinimo;

    setDestino(haySesion ? "/(tabs)" : "/inicio");
  }

  // ─── Arrancar todo cuando las fuentes carguen ─────────────────────────────
  useEffect(() => {
    if (!fontsLoaded) return;

    async function iniciar() {
      await Promise.all([reproducirAnimacion(), verificarTodo()]);
    }

    iniciar();
  }, [fontsLoaded]);

  // ─── Redirigir cuando ambas cosas terminen ────────────────────────────────
  useEffect(() => {
    if (!destino) return;
    router.replace(destino as any);
  }, [destino]);

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      {/* CÍRCULO ANIMADO que crece hasta cubrir la pantalla */}
      <Animated.View
        style={[
          styles.circulo,
          {
            transform: [{ scale: escala }],
          },
        ]}
      />

      {/* LOGO CHICO dentro del círculo que se desvanece cuando crece */}
      <Animated.Text
        style={[
          styles.logoChico,
          {
            opacity: escala.interpolate({
              inputRange: [1, 2],
              outputRange: [1, 0],
              extrapolate: "clamp",
            }),
          },
        ]}
      >
        TasteGo.
      </Animated.Text>

      {/* LOGO GRANDE que aparece y luego sube */}
      <Animated.Text
        style={[
          styles.logoGrande,
          {
            opacity: opacidadLogo,
            transform: [{ translateY: posicionLogo }],
          },
        ]}
      >
        TasteGo.
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8392A",
    alignItems: "center",
    justifyContent: "center",
  },
  circulo: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#FFFFFF",
  },
  logoChico: {
    fontFamily: "Pacifico_400Regular",
    fontSize: 38,
    color: "#E8392A",
    zIndex: 1,
  },
  logoGrande: {
    position: "absolute",
    fontFamily: "Pacifico_400Regular",
    fontSize: 52,
    color: "#E8392A",
    zIndex: 2,
  },
});
