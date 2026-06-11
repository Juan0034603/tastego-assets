// app/(tabs)/index.tsx

import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  obtenerRestaurantes,
  Restaurante,
} from "../../services/servicioRestaurantes";
import { obtenerUsuario, Usuario } from "../../services/servicioAutenticacion";

const { width } = Dimensions.get("window");

// Mapeador de imagen_key → require() local
const IMAGENES: Record<string, any> = {
  "colombian-restaurant": require("../../assets/images/colombian-restaurant.jpg"),
  "typical-food": require("../../assets/images/typical-food.jpg"),
  "pizza": require("../../assets/images/pizza.jpg"),
  "seafood": require("../../assets/images/seafood.jpg"),
  "burger": require("../../assets/images/burger.jpg"),
  "bandeja-paisa": require("../../assets/images/bandeja-paisa.jpg"),
  "colombian-soup": require("../../assets/images/colombian-soup.jpg"),
  "fried-fish": require("../../assets/images/fried-fish.jpg"),
  "coconut-rice": require("../../assets/images/coconut-rice.jpg"),
  "restaurant-food": require("../../assets/images/restaurant-food.jpg"),
  "pollo": require("../../assets/images/pollo.png"),
};

export default function HomeScreen() {
  const router = useRouter();
  const [restaurantes, setRestaurantes] = useState<Restaurante[]>([]);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargar() {
      const [datos, user] = await Promise.all([
        obtenerRestaurantes(),
        obtenerUsuario(),
      ]);
      setRestaurantes(datos);
      setUsuario(user);
      setCargando(false);
    }
    cargar();
  }, []);

  // Top 4 por calificación para la sección horizontal
  const masVisitados = restaurantes.slice(0, 4);

  // ─── Cabecera del FlatList (todo lo que va arriba de la lista) ────────────
  function Cabecera() {
    return (
      <View>
        {/* TOP BAR */}
        <View style={styles.topBar}>
          <View style={styles.topLoc}>
            <Ionicons name="location-sharp" size={16} color="#E8392A" />
            <Text style={styles.topLocText}>Sincelejo, Sucre</Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/notificaciones")}>
            <Ionicons name="mail-outline" size={24} color="#1a1a1a" />
          </TouchableOpacity>
        </View>

        {/* SALUDO */}
        {usuario && (
          <Text style={styles.saludo}>
            Hola, {usuario.nombre.split(" ")[0]} 👋
          </Text>
        )}

        {/* SEARCH BAR */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => router.push("/busqueda")}
          activeOpacity={0.8}
        >
          <Ionicons name="search-outline" size={20} color="#999" />
          <Text style={styles.searchText}>Buscar restaurantes</Text>
          <Ionicons name="options-outline" size={20} color="#1a1a1a" />
        </TouchableOpacity>

        {/* BANNER */}
        <View style={styles.bannerWrap}>
          <Image
            source={IMAGENES["restaurant-food"]}
            style={styles.bannerImg}
            resizeMode="cover"
          />
          <LinearGradient
            colors={["rgba(232,57,42,0.85)", "rgba(255,107,53,0.75)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.bannerOverlay}
          >
            <View>
              <Text style={styles.bannerOff}>15% OFF</Text>
              <Text style={styles.bannerSub}>ALL PIZZA AND PASTA</Text>
              <View style={styles.bannerCode}>
                <Text style={styles.bannerCodeTxt}>Use code 25OFF</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* MÁS VISITADOS */}
        <Text style={styles.sectionTitle}>Los más visitados</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.visitadosScroll}
        >
          {masVisitados.map((item) => (
            <TouchableOpacity
              key={item.id_restaurante}
              style={styles.visitadoCard}
              onPress={() =>
                router.push({
                  pathname: "/restperfil",
                  params: { id: item.id_restaurante },
                })
              }
              activeOpacity={0.85}
            >
              <Image
                source={IMAGENES[item.imagen_key] ?? IMAGENES["restaurant-food"]}
                style={styles.visitadoImg}
                resizeMode="cover"
              />
              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.7)"]}
                style={styles.visitadoOverlay}
              >
                <Text style={styles.visitadoNombre} numberOfLines={1}>
                  {item.nombre}
                </Text>
                <Text style={styles.visitadoDir} numberOfLines={1}>
                  {item.direccion}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ENCABEZADO MÁS RESTAURANTES */}
        <View style={styles.secHdr}>
          <Text style={styles.sectionTitle}>Más restaurantes</Text>
          <TouchableOpacity onPress={() => router.push("/busqueda")}>
            <Text style={styles.verMas}>Ver más</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ─── Cada tarjeta de restaurante ──────────────────────────────────────────
  function TarjetaRestaurante({ item }: { item: Restaurante }) {
    return (
      <TouchableOpacity
        style={styles.restCard}
        onPress={() =>
          router.push({
            pathname: "/restperfil",
            params: { id: item.id_restaurante },
          })
        }
        activeOpacity={0.85}
      >
        <Image
          source={IMAGENES[item.imagen_key] ?? IMAGENES["restaurant-food"]}
          style={styles.restImg}
          resizeMode="cover"
        />
        <View style={styles.restInfo}>
          <Text style={styles.restNombre}>{item.nombre}</Text>
          <Text style={styles.restCat}>{item.tipo_comida}</Text>
          <View style={styles.restMeta}>
            <Text style={styles.restRating}>⭐ {item.calificacion}</Text>
            <Text style={styles.restMetaText}>{item.direccion}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  if (cargando) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color="#E8392A" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={restaurantes}
        keyExtractor={(item) => String(item.id_restaurante)}
        renderItem={({ item }) => <TarjetaRestaurante item={item} />}
        ListHeaderComponent={<Cabecera />}
        contentContainerStyle={styles.listaContenido}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: 50,
  },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  listaContenido: {
    paddingBottom: 20,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  topLoc: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  topLocText: {
    fontSize: 13,
    color: "#555",
    fontWeight: "500",
  },
  saludo: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 14,
    marginHorizontal: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
    gap: 10,
  },
  searchText: {
    flex: 1,
    fontSize: 14,
    color: "#999",
  },
  bannerWrap: {
    marginHorizontal: 20,
    borderRadius: 18,
    overflow: "hidden",
    height: 130,
    marginBottom: 20,
  },
  bannerImg: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  bannerOverlay: {
    flex: 1,
    padding: 18,
    justifyContent: "center",
  },
  bannerOff: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
  },
  bannerSub: {
    fontSize: 10,
    color: "rgba(255,255,255,0.85)",
    marginBottom: 8,
  },
  bannerCode: {
    backgroundColor: "#1a1a1a",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  bannerCodeTxt: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  secHdr: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingRight: 20,
    marginTop: 4,
    marginBottom: 12,
  },
  verMas: {
    fontSize: 13,
    color: "#E8392A",
    fontWeight: "600",
  },
  visitadosScroll: {
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  visitadoCard: {
    width: 140,
    height: 100,
    borderRadius: 14,
    overflow: "hidden",
  },
  visitadoImg: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  visitadoOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 8,
  },
  visitadoNombre: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
  },
  visitadoDir: {
    fontSize: 10,
    color: "rgba(255,255,255,0.8)",
  },
  restCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  restImg: {
    width: 70,
    height: 70,
    borderRadius: 14,
  },
  restInfo: {
    flex: 1,
  },
  restNombre: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  restCat: {
    fontSize: 12,
    color: "#999",
    marginTop: 1,
  },
  restMeta: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
    alignItems: "center",
  },
  restRating: {
    fontSize: 11,
    fontWeight: "700",
    color: "#E8392A",
  },
  restMetaText: {
    fontSize: 11,
    color: "#888",
    flex: 1,
  },
});