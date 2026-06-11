// app/restperfil.tsx

import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  obtenerRestaurantePorId,
  Restaurante,
  obtenerPlatosPorRestaurante, // ← agregar
  Plato,
} from "../services/servicioRestaurantes";
import { esFavorito, toggleFavorito } from "../services/servicioFavoritos";

const IMAGENES: Record<string, any> = {
  "colombian-restaurant": require("../assets/images/colombian-restaurant.jpg"),
  "typical-food": require("../assets/images/typical-food.jpg"),
  pizza: require("../assets/images/pizza.jpg"),
  seafood: require("../assets/images/seafood.jpg"),
  burger: require("../assets/images/burger.jpg"),
  "bandeja-paisa": require("../assets/images/bandeja-paisa.jpg"),
  "colombian-soup": require("../assets/images/colombian-soup.jpg"),
  "fried-fish": require("../assets/images/fried-fish.jpg"),
  "coconut-rice": require("../assets/images/coconut-rice.jpg"),
  "restaurant-food": require("../assets/images/restaurant-food.jpg"),
  pollo: require("../assets/images/pollo.png"),
};

export default function RestPerfilScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [restaurante, setRestaurante] = useState<Restaurante | null>(null);
  const [cargando, setCargando] = useState(true);
  const [esFav, setEsFav] = useState(false);

  const [platos, setPlatos] = useState<Plato[]>([]);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    async function cargar() {
      if (!id) return;
      const [datos, favorito, platosData] = await Promise.all([
        obtenerRestaurantePorId(Number(id)),
        esFavorito(Number(id)),
        obtenerPlatosPorRestaurante(Number(id)), // ← agregar
      ]);
      setRestaurante(datos);
      setEsFav(favorito);
      setCargando(false);
      setPlatos(platosData); // ← agregar
    }
    cargar();
  }, [id]);

  async function manejarToggleFavorito() {
    if (!restaurante) return;
    const nuevoEstado = await toggleFavorito(restaurante.id_restaurante);
    setEsFav(nuevoEstado);
  }

  if (cargando) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color="#E8392A" />
      </View>
    );
  }

  if (!restaurante) {
    return (
      <View style={styles.loadingWrap}>
        <Text style={{ color: "#999" }}>Restaurante no encontrado.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* MODAL MENÚ — va aquí adentro */}
      <Modal
        visible={menuVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalFondo}
          onPress={() => setMenuVisible(false)}
        />
        <View style={styles.modalHoja}>
          <View style={styles.modalHandle} />
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Menú</Text>
            <Text style={styles.modalCount}>{platos.length} platos</Text>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {platos.map((plato, index) => (
              <View
                key={plato.id_plato}
                style={[
                  styles.platoCard,
                  index === platos.length - 1 && { borderBottomWidth: 0 },
                ]}
              >
                <Image
                  source={
                    IMAGENES[plato.imagen_key] ?? IMAGENES["restaurant-food"]
                  }
                  style={styles.platoImg}
                  resizeMode="cover"
                />
                <View style={styles.platoInfo}>
                  <Text style={styles.platoNombre}>{plato.nombre}</Text>
                  <Text style={styles.platoDesc} numberOfLines={2}>
                    {plato.descripcion}
                  </Text>
                  <Text style={styles.platoPrecio}>
                    ${plato.precio.toLocaleString("es-CO")}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.arBtn}
                  onPress={() => {
                    setMenuVisible(false);
                    router.push({
                      pathname: "/visor3d" as any,
                      params: {
                        imagenKey: plato.imagen_key,
                        nombrePlato: plato.nombre,
                      },
                    });
                  }}
                >
                  <Text style={styles.arBtnTxt}>3D</Text>
                </TouchableOpacity>
              </View>
            ))}
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </Modal>

      {/* HERO CON IMAGEN REAL */}
      <View style={styles.hero}>
        <Image
          source={
            IMAGENES[restaurante.imagen_key] ?? IMAGENES["restaurant-food"]
          }
          style={styles.heroImg}
          resizeMode="cover"
        />
        <LinearGradient
          colors={["rgba(0,0,0,0.2)", "rgba(0,0,0,0.5)"]}
          style={styles.heroOverlay}
        />

        {/* BOTÓN BACK */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={18} color="#1a1a1a" />
        </TouchableOpacity>

        {/* BOTÓN CÓMO LLEGAR */}
        <TouchableOpacity
          style={styles.mapaBtn}
          onPress={() =>
            router.push({
              pathname: "/mapa",
              params: {
                id: restaurante.id_restaurante,
                nombre: restaurante.nombre,
                latitud: restaurante.latitud,
                longitud: restaurante.longitud,
              },
            })
          }
        >
          <Ionicons name="navigate-outline" size={16} color="#E8392A" />
          <Text style={styles.mapaBtnTxt}>Cómo llegar</Text>
        </TouchableOpacity>

        {/* BOTÓN CORAZÓN */}
        <TouchableOpacity
          style={styles.heartBtn}
          onPress={manejarToggleFavorito}
        >
          <Ionicons
            name={esFav ? "heart" : "heart-outline"}
            size={18}
            color="#E8392A"
          />
        </TouchableOpacity>

        {/* CHIP RATING */}
        <View style={styles.ratingChip}>
          <Ionicons name="star" size={12} color="#FFB800" />
          <Text style={styles.ratingTxt}>⭐ {restaurante.calificacion}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* INFO CARD */}
        <View style={styles.infoCard}>
          <Text style={styles.restNombre}>{restaurante.nombre}</Text>
          <Text style={styles.restCat}>{restaurante.tipo_comida}</Text>

          <View style={styles.separador} />

          <View style={styles.metaRow}>
            <View style={styles.metaChip}>
              <Ionicons name="location-outline" size={13} color="#E8392A" />
              <Text style={styles.metaTxt} numberOfLines={1}>
                {restaurante.direccion}
              </Text>
            </View>
            <View style={styles.metaChip}>
              <Ionicons name="star" size={13} color="#E8392A" />
              <Text style={styles.metaTxt}>{restaurante.calificacion} / 5</Text>
            </View>
          </View>
        </View>

        {/* DESCRIPCIÓN */}
        <Text style={styles.desc}>{restaurante.descripcion}</Text>

        {/* BOTÓN VER PLATOS */}
        <TouchableOpacity
          style={styles.btnWrapper}
          activeOpacity={0.85}
          onPress={() => setMenuVisible(true)}
        >
          <LinearGradient
            colors={["#FF8C42", "#E8392A"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.btn}
          >
            <Text style={styles.btnTxt}>Ver platos</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  hero: {
    width: "100%",
    height: 280,
    position: "relative",
  },
  heroImg: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  heroOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backBtn: {
    position: "absolute",
    top: 48,
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  mapaBtn: {
    position: "absolute",
    top: 48,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  mapaBtnTxt: {
    fontSize: 12,
    fontWeight: "700",
    color: "#E8392A",
  },
  heartBtn: {
    position: "absolute",
    bottom: 16,
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  ratingChip: {
    position: "absolute",
    bottom: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  ratingTxt: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  infoCard: {
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 8,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  restNombre: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  restCat: {
    fontSize: 13,
    color: "#999",
  },
  separador: {
    height: 1,
    backgroundColor: "#f5f5f5",
    marginVertical: 16,
  },
  metaRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  metaTxt: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  desc: {
    fontSize: 13,
    color: "#666",
    lineHeight: 22,
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 28,
  },
  btnWrapper: {
    marginHorizontal: 20,
    height: 54,
    borderRadius: 27,
    overflow: "hidden",
  },
  btn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  btnTxt: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  modalFondo: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalHoja: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    maxHeight: "75%",
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#e0e0e0",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  modalCount: {
    fontSize: 12,
    color: "#999",
  },
  platoCard: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
    alignItems: "center",
  },
  platoImg: {
    width: 75,
    height: 75,
    borderRadius: 14,
  },
  platoInfo: {
    flex: 1,
    gap: 4,
  },
  platoNombre: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  platoDesc: {
    fontSize: 12,
    color: "#999",
    lineHeight: 18,
  },
  platoPrecio: {
    fontSize: 14,
    fontWeight: "700",
    color: "#E8392A",
    marginTop: 2,
  },

  platoFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  arBtn: {
    backgroundColor: "#E8392A",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  arBtnTxt: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
});
