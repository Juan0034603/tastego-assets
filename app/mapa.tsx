// app/mapa.tsx

import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
// ─── Coordenadas del restaurante (hardcodeadas por ahora) ─────────────────

// ─── API Key de OpenRouteService desde el .env ────────────────────────────
const ORS_API_KEY = process.env.EXPO_PUBLIC_ORS_API_KEY;

export default function MapaScreen() {
  const router = useRouter();

  // AGREGAR ESTO justo después del const router
  const { nombre, latitud, longitud } = useLocalSearchParams<{
    nombre: string;
    latitud: string;
    longitud: string;
  }>();

  const RESTAURANTE = {
    nombre: nombre ?? "Restaurante",
    latitud: parseFloat(latitud ?? "9.3047"),
    longitud: parseFloat(longitud ?? "-75.3978"),
  };

  // Ubicación del usuario
  const [ubicacionUsuario, setUbicacionUsuario] = useState<{
    latitud: number;
    longitud: number;
  } | null>(null);

  // Puntos de la ruta que devuelve ORS
  // Cada punto es { latitude, longitude } que entiende react-native-maps
  const [puntosRuta, setPuntosRuta] = useState<
    { latitude: number; longitude: number }[]
  >([]);

  const [cargando, setCargando] = useState(true);
  const [cargandoRuta, setCargandoRuta] = useState(false);
  const [error, setError] = useState("");

  // ─── Al abrir la pantalla: obtener ubicación y luego trazar ruta ─────────
  useEffect(() => {
    async function iniciar() {
      // 1. Pedir permiso
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Necesitamos permiso de ubicación para mostrarte el mapa.");
        setCargando(false);
        return;
      }

      // 2. Obtener coordenadas del usuario
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced, //presisicon media, consume menso bagterias
      });

      const coords = {
        latitud: location.coords.latitude,
        longitud: location.coords.longitude,
      };

      setUbicacionUsuario(coords);
      setCargando(false);

      // 3. Con las coordenadas ya listas, pedir la ruta a ORS
      await trazarRuta(coords.longitud, coords.latitud);
    }

    iniciar();
  }, []);

  // ─── Llamada a OpenRouteService para obtener la ruta ─────────────────────
  async function trazarRuta(lngOrigen: number, latOrigen: number) {
    setCargandoRuta(true);

    try {
      const respuesta = await fetch(
        "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${ORS_API_KEY}`,
          },
          body: JSON.stringify({
            // ORS recibe las coordenadas en formato [longitud, latitud]
            // OJO: es al revés de como normalmente pensamos
            coordinates: [
              [lngOrigen, latOrigen], // origen: usuario
              [RESTAURANTE.longitud, RESTAURANTE.latitud], // destino: restaurante
            ],
          }),
        },
      );

      const datos = await respuesta.json();

      // ORS devuelve los puntos dentro de features[0].geometry.coordinates
      // Cada punto viene como [longitud, latitud]
      // react-native-maps necesita { latitude, longitude }
      // por eso hacemos el map para convertirlos
      const puntos = datos.features[0].geometry.coordinates.map(
        //Obtiene todos los puntos de la ruta.
        (punto: number[]) => ({
          latitude: punto[1],
          longitude: punto[0],
        }),
      );

      setPuntosRuta(puntos);
    } catch (e) {
      // Si falla la ruta no bloqueamos el mapa, solo no se dibuja la línea
      console.log("Error trazando ruta:", e);
    }

    setCargandoRuta(false);
  }

  // ─── Mientras obtiene ubicación ───────────────────────────────────────────
  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#E8392A" />
        <Text style={styles.cargandoTxt}>Obteniendo tu ubicación...</Text>
      </View>
    );
  }

  // ─── Si no dio permiso ────────────────────────────────────────────────────
  if (error) {
    return (
      <View style={styles.centrado}>
        <Ionicons name="location-outline" size={48} color="#E8392A" />
        <Text style={styles.errorTxt}>{error}</Text>
        <TouchableOpacity
          style={styles.btnVolver}
          onPress={() => router.back()}
        >
          <Text style={styles.btnVolverTxt}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── Región inicial del mapa centrada entre usuario y restaurante ─────────
  const regionInicial = {
    latitude: (ubicacionUsuario!.latitud + RESTAURANTE.latitud) / 2,
    longitude: (ubicacionUsuario!.longitud + RESTAURANTE.longitud) / 2,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  return (
    <View style={styles.container}>
      {/* BOTÓN BACK FLOTANTE */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={18} color="#1a1a1a" />
      </TouchableOpacity>

      {/* INDICADOR DE CARGA DE RUTA */}
      {cargandoRuta && (
        <View style={styles.rutaCargando}>
          <ActivityIndicator size="small" color="#E8392A" />
          <Text style={styles.rutaCargandoTxt}>Trazando ruta...</Text>
        </View>
      )}

      {/* MAPA */}
      <MapView
        style={styles.mapa}
        provider={PROVIDER_GOOGLE}
        initialRegion={regionInicial}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {/* Pin del usuario */}
        <Marker
          coordinate={{
            latitude: ubicacionUsuario!.latitud,
            longitude: ubicacionUsuario!.longitud,
          }}
          title="Tu ubicación"
          pinColor="#E8392A"
        />

        {/* Pin del restaurante */}
        <Marker
          coordinate={{
            latitude: RESTAURANTE.latitud,
            longitude: RESTAURANTE.longitud,
          }}
          title={RESTAURANTE.nombre}
          description="Toca para ver más"
          pinColor="#FF6B35"
        />

        {/* Línea de la ruta — solo se dibuja cuando ORS responde */}
        {puntosRuta.length > 0 && (
          <Polyline
            coordinates={puntosRuta}
            strokeColor="#E8392A"
            strokeWidth={4}
            lineDashPattern={[0]}
          />
        )}
      </MapView>

      {/* CARD INFERIOR CON INFO DEL RESTAURANTE */}
      <View style={styles.infoCard}>
        <View style={styles.infoCardIzq}>
          <Text style={styles.infoNombre}>{RESTAURANTE.nombre}</Text>
          <View style={styles.infoFila}>
            <Ionicons name="location-outline" size={13} color="#E8392A" />
            <Text style={styles.infoTxt}>Sincelejo, Sucre</Text>
          </View>
        </View>
        <View style={styles.infoChip}>
          <Ionicons name="navigate-outline" size={14} color="#fff" />
          <Text style={styles.infoChipTxt}>En ruta</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  centrado: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    padding: 24,
    gap: 16,
  },
  cargandoTxt: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
  },
  errorTxt: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
  btnVolver: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E8392A",
  },
  btnVolverTxt: {
    fontSize: 14,
    fontWeight: "700",
    color: "#E8392A",
  },
  backBtn: {
    position: "absolute",
    top: 52,
    left: 16,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.95)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  rutaCargando: {
    position: "absolute",
    top: 52,
    alignSelf: "center",
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  rutaCargandoTxt: {
    fontSize: 12,
    color: "#E8392A",
    fontWeight: "600",
  },
  mapa: {
    flex: 1,
  },
  infoCard: {
    position: "absolute",
    bottom: 32,
    left: 16,
    right: 16,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  infoCardIzq: {
    gap: 4,
  },
  infoNombre: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  infoFila: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  infoTxt: {
    fontSize: 12,
    color: "#999",
  },
  infoChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#E8392A",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  infoChipTxt: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
  },
});
