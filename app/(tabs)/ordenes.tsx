import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

const TABS = ['Pending', 'Completed', 'Cancelled', 'Special orders'];

const ORDENES = [
  { id: '1', nombre: 'Catfish Peppersoup', meta: 'Delivery Pro · Kalé',    status: 'pending',   emoji: '🐟' },
  { id: '2', nombre: 'Chicken Afroyo',     meta: 'Delivery Pro · Délite',  status: 'completed', emoji: '🍗' },
  { id: '3', nombre: 'Crayfish Ramen',     meta: 'Delivery Pro · Berries', status: 'cancelled', emoji: '🦞' },
];

const BADGE: Record<string, { label: string; bg: string; color: string }> = {
  pending:   { label: 'View Order',      bg: '#fff3e0', color: '#e65100' },
  completed: { label: 'Order fulfilled', bg: '#e8f5e9', color: '#2e7d32' },
  cancelled: { label: 'Order cancelled', bg: '#ffebee', color: '#c62828' },
};

export default function OrdenesScreen() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Orders</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.tabsRow}>
            {TABS.map((tab, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.tab, activeTab === i && styles.tabOn]}
                onPress={() => setActiveTab(i)}
              >
                <Text style={[styles.tabTxt, activeTab === i && styles.tabTxtOn]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.list}>
        {ORDENES.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.cardImg}>
              <Text style={styles.cardEmoji}>{item.emoji}</Text>
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardNombre}>{item.nombre}</Text>
              <Text style={styles.cardMeta}>{item.meta}</Text>
              <View style={[styles.badge, { backgroundColor: BADGE[item.status].bg }]}>
                <Text style={[styles.badgeTxt, { color: BADGE[item.status].color }]}>
                  {BADGE[item.status].label}
                </Text>
              </View>
            </View>
            <TouchableOpacity>
              <Ionicons
                name={item.status === 'pending' ? 'chatbubble-outline' : 'refresh-outline'}
                size={22}
                color="#999"
              />
            </TouchableOpacity>
          </View>
        ))}
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 14,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 12,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },
  tabOn: {
    backgroundColor: '#E8392A',
    borderColor: '#E8392A',
  },
  tabTxt: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
  },
  tabTxtOn: {
    color: '#fff',
  },
  list: {
    paddingHorizontal: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  cardImg: {
    width: 54,
    height: 54,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardEmoji: { fontSize: 26 },
  cardInfo: { flex: 1 },
  cardNombre: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  cardMeta: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  badge: {
    marginTop: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeTxt: {
    fontSize: 11,
    fontWeight: '700',
  },
});