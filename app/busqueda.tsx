// app/busqueda.tsx

import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  obtenerRestaurantes,
  buscarRestaurantes,
  obtenerRestaurantesPorCategoria,
  Restaurante,
} from "../services/servicioRestaurantes";

const CATEGORIAS = [
  { id: "1", nombre: "Comida típica", imagen_key: "typical-food" },
  { id: "2", nombre: "Pizza",         imagen_key: "pizza" },
  { id: "3", nombre: "Hamburguesas",  imagen_key: "burger" },
  { id: "4", nombre: "Mariscos",      imagen_key: "seafood" },
  { id: "5", nombre: "Pollo",         imagen_key: "pollo" },
];

const IMAGENES: Record<string, any> = {
  "colombian-restaurant": require("../assets/images/colombian-restaurant.jpg"),
  "typical-food":         require("../assets/images/typical-food.jpg"),
  "pizza":                require("../assets/images/pizza.jpg"),
  "seafood":              require("../assets/images/seafood.jpg"),
  "burger":               require("../assets/images/burger.jpg"),
  "bandeja-paisa":        require("../assets/images/bandeja-paisa.jpg"),
  "colombian-soup":       require("../assets/images/colombian-soup.jpg"),
  "fried-fish":           require("../assets/images/fried-fish.jpg"),
  "coconut-rice":         require("../assets/images/coconut-rice.jpg"),
  "restaurant-food":      require("../assets/images/restaurant-food.jpg"),
  "pollo":                require("../assets/images/pollo.png"),
};

export default function BusquedaScreen() {
  const router = useRouter();

  const [texto, setTexto] = useState("");
  const [categoriaActiva, setCategoriaActiva] = useState<string | null>(null);
  const [restaurantes, setRestaurantes] = useState<Restaurante[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargar() {
      setCargando(true);
      let datos: Restaurante[] = [];

      if (texto.trim().length > 0) {
        datos = await buscarRestaurantes(texto.trim());
      } else if (categoriaActiva) {
        datos = await obtenerRestaurantesPorCategoria(categoriaActiva);
      } else {
        datos = await obtenerRestaurantes();
      }

      setRestaurantes(datos);
      setCargando(false);
    }
    cargar();
  }, [texto, categoriaActiva]);

  function toggleCategoria(nombre: string) {
    setCategoriaActiva((actual) => (actual === nombre ? null : nombre));
    setTexto("");
  }

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
            <Text style={styles.restMetaTxt} numberOfLines={1}>
              {item.direccion}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>

      {/* PARTE FIJA — no hace scroll */}
      <View style={styles.partesFijas}>

        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Buscar</Text>
        </View>

        {/* SEARCH BOX */}
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar restaurantes..."
            placeholderTextColor="#bbb"
            value={texto}
            onChangeText={(t) => {
              setTexto(t);
              setCategoriaActiva(null);
            }}
          />
          {texto.length > 0 && (
            <TouchableOpacity onPress={() => setTexto("")}>
              <Ionicons name="close-circle" size={18} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        {/* CATEGORÍAS — altura fija */}
        <View style={styles.catsWrap}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.catsScroll}
          >
            {CATEGORIAS.map((cat) => {
              const activa = categoriaActiva === cat.nombre;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.catItem}
                  onPress={() => toggleCategoria(cat.nombre)}
                >
                  <View style={[styles.catCircle, activa && styles.catCircleOn]}>
                    <Image
                      source={IMAGENES[cat.imagen_key]}
                      style={styles.catImg}
                      resizeMode="cover"
                    />
                  </View>
                  <Text style={[styles.catLabel, activa && styles.catLabelOn]}>
                    {cat.nombre}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* CONTADOR */}
        <Text style={styles.contador}>
          {restaurantes.length}{" "}
          {restaurantes.length === 1 ? "restaurante" : "restaurantes"}
        </Text>

      </View>

      {/* LISTA — ocupa el resto */}
      {cargando ? (
        <ActivityIndicator size="large" color="#E8392A" style={{ marginTop: 40 }} />
      ) : restaurantes.length === 0 ? (
        <View style={styles.sinResultados}>
          <Text style={styles.sinResultadosEmoji}>🍽️</Text>
          <Text style={styles.sinResultadosTxt}>No encontramos restaurantes</Text>
        </View>
      ) : (
        <FlatList
          data={restaurantes}
          keyExtractor={(item) => String(item.id_restaurante)}
          renderItem={({ item }) => <TarjetaRestaurante item={item} />}
          style={styles.flatList}
          contentContainerStyle={styles.restList}
          showsVerticalScrollIndicator={false}
        />
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 50,
  },
  partesFijas: {
    // agrupa todo lo que NO hace scroll
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  searchBox: {
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
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  catsWrap: {
    height: 90,         // ← altura fija para las categorías
    marginBottom: 12,
  },
  catsScroll: {
    paddingHorizontal: 20,
    gap: 16,
    alignItems: "center",
  },
  catItem: {
    alignItems: "center",
    gap: 6,
  },
  catCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
  },
  catCircleOn: {
    borderColor: "#E8392A",
  },
  catImg: {
    width: "100%",
    height: "100%",
  },
  catLabel: {
    fontSize: 11,
    color: "#666",
  },
  catLabelOn: {
    color: "#E8392A",
    fontWeight: "700",
  },
  contador: {
    fontSize: 12,
    color: "#999",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  flatList: {
    flex: 1,
  },
  restList: {
    paddingHorizontal: 20,
    gap: 16,
    paddingBottom: 20,
  },
  restCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
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
  restMetaTxt: {
    fontSize: 11,
    color: "#888",
    flex: 1,
  },
  sinResultados: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  sinResultadosEmoji: {
    fontSize: 48,
  },
  sinResultadosTxt: {
    fontSize: 15,
    color: "#999",
  },
});