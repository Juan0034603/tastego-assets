// app/(tabs)/favoritos.tsx

import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { obtenerFavoritos, quitarFavorito } from '../../services/servicioFavoritos';
import { Restaurante } from '../../services/servicioRestaurantes';

const IMAGENES: Record<string, any> = {
  'colombian-restaurant': require('../../assets/images/colombian-restaurant.jpg'),
  'typical-food':         require('../../assets/images/typical-food.jpg'),
  'pizza':                require('../../assets/images/pizza.jpg'),
  'seafood':              require('../../assets/images/seafood.jpg'),
  'burger':               require('../../assets/images/burger.jpg'),
  'bandeja-paisa':        require('../../assets/images/bandeja-paisa.jpg'),
  'colombian-soup':       require('../../assets/images/colombian-soup.jpg'),
  'fried-fish':           require('../../assets/images/fried-fish.jpg'),
  'coconut-rice':         require('../../assets/images/coconut-rice.jpg'),
  'restaurant-food':      require('../../assets/images/restaurant-food.jpg'),
  'pollo':                require('../../assets/images/pollo.png'),
};

export default function FavoritosScreen() {
  const router = useRouter();
  const [favoritos, setFavoritos] = useState<Restaurante[]>([]);

  // ─── useFocusEffect recarga los favoritos cada vez que
  //     el usuario vuelve a esta pestaña ─────────────────────────────────
  useFocusEffect(
    useCallback(() => {
      async function cargar() {
        const datos = await obtenerFavoritos();
        setFavoritos(datos);
      }
      cargar();
    }, [])
  );

  async function manejarQuitarFavorito(id_restaurante: number) {
    await quitarFavorito(id_restaurante);
    setFavoritos((prev) =>
      prev.filter((f) => f.id_restaurante !== id_restaurante)
    );
  }

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Favoritos</Text>
        <Text style={styles.headerSub}>
          {favoritos.length}{' '}
          {favoritos.length === 1 ? 'restaurante guardado' : 'restaurantes guardados'}
        </Text>
      </View>

      {favoritos.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Ionicons name="heart-outline" size={64} color="#eee" />
          <Text style={styles.emptyTxt}>No tienes favoritos aún</Text>
          <TouchableOpacity
            style={styles.emptyBtn}
            onPress={() => router.push('/busqueda')}
          >
            <Text style={styles.emptyBtnTxt}>Explorar restaurantes</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
        >
          {favoritos.map((item) => (
            <TouchableOpacity
              key={item.id_restaurante}
              style={styles.card}
              activeOpacity={0.92}
              onPress={() =>
                router.push({
                  pathname: '/restperfil',
                  params: { id: item.id_restaurante },
                })
              }
            >
              {/* IMAGEN */}
              <Image
                source={IMAGENES[item.imagen_key] ?? IMAGENES['restaurant-food']}
                style={styles.cardImg}
                resizeMode="cover"
              />

              {/* BOTÓN CORAZÓN */}
              <TouchableOpacity
                style={styles.heartBtn}
                onPress={() => manejarQuitarFavorito(item.id_restaurante)}
              >
                <Ionicons name="heart" size={18} color="#E8392A" />
              </TouchableOpacity>

              {/* BADGE RATING */}
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={11} color="#FFD700" />
                <Text style={styles.ratingTxt}>{item.calificacion}</Text>
              </View>

              {/* INFO INFERIOR */}
              <View style={styles.cardInfo}>
                <Text style={styles.cardNombre}>{item.nombre}</Text>
                <View style={styles.cardMeta}>
                  <View style={styles.cardMetaItem}>
                    <Ionicons name="restaurant-outline" size={12} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.cardMetaTxt}>{item.tipo_comida}</Text>
                  </View>
                  <View style={styles.cardMetaItem}>
                    <Ionicons name="location-outline" size={12} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.cardMetaTxt} numberOfLines={1}>
                      {item.direccion}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          <View style={{ height: 20 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    paddingTop: 50,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  headerSub: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
  },
  list: {
    paddingHorizontal: 20,
    gap: 16,
  },
  card: {
    width: '100%',
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
  cardImg: {
    width: '100%',
    height: '100%',
  },
  heartBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ratingBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  ratingTxt: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  cardInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  cardNombre: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 6,
  },
  cardMeta: {
    flexDirection: 'row',
    gap: 14,
  },
  cardMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardMetaTxt: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyTxt: {
    fontSize: 16,
    color: '#bbb',
    fontWeight: '600',
  },
  emptyBtn: {
    marginTop: 8,
    backgroundColor: '#E8392A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
  },
  emptyBtnTxt: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});