import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const NOTIFS = [
  { id: '1', texto: 'Order #23 has been delivered',  sub: 'Your balance will be updated shortly', hora: '10:45 am', highlight: true  },
  { id: '2', texto: 'Order #03 has been delivered',  sub: 'Your balance will be updated shortly', hora: '10:34 am', highlight: false },
  { id: '3', texto: 'Special order request!!',        sub: 'Today, 01:00am',                       hora: '',         highlight: true, special: true },
  { id: '4', texto: 'Order #08 has been delivered',  sub: 'Your balance will be updated shortly', hora: '11:17 pm', highlight: false },
];

export default function NotificacionesScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={18} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.list}>
        {NOTIFS.map((item) => (
          <View
            key={item.id}
            style={[styles.card, item.special && styles.cardSpecial]}
          >
            <View style={[styles.bar, item.highlight && styles.barRed]} />
            <View style={styles.cardBody}>
              <Text style={[styles.cardTxt, item.special && styles.cardTxtSpecial]}>
                {item.texto}
              </Text>
              <Text style={styles.cardSub}>{item.sub}</Text>
            </View>
            {item.hora ? <Text style={styles.cardHora}>{item.hora}</Text> : null}
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  list: {
    paddingHorizontal: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f8f8',
  },
  cardSpecial: {
    backgroundColor: '#fff8e1',
    borderRadius: 12,
    paddingHorizontal: 10,
    marginBottom: 4,
  },
  bar: {
    width: 3,
    borderRadius: 2,
    alignSelf: 'stretch',
    backgroundColor: 'transparent',
  },
  barRed: {
    backgroundColor: '#E8392A',
  },
  cardBody: { flex: 1 },
  cardTxt: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  cardTxtSpecial: {
    color: '#e65100',
  },
  cardSub: {
    fontSize: 11,
    color: '#999',
    marginTop: 3,
  },
  cardHora: {
    fontSize: 10,
    color: '#bbb',
  },
});