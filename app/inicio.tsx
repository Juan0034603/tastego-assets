// app/inicio.tsx

import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Pacifico_400Regular } from '@expo-google-fonts/pacifico';
import { iniciarSesion } from '../services/servicioAutenticacion';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CLAVES } from '../services/claves';

export default function InicioScreen() {
  const router = useRouter();

  // Campos del formulario
  // OJO: el original tenía 4 campos (nombre, email, password, repetir)
  // El login solo necesita email y contraseña
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Para mostrar carga mientras se verifica
  const [cargando, setCargando] = useState(false);

  const [fontsLoaded] = useFonts({ Pacifico_400Regular });
  if (!fontsLoaded) return null;

  // ─── Función que se ejecuta al presionar "Iniciar sesión" ─────────────────
  async function manejarLogin() {

    // 1. Validar que los campos no estén vacíos
    if (!email || !password) {
      Alert.alert('Campos incompletos', 'Por favor ingresa tu correo y contraseña.');
      return;
    }

    // 2. Todo bien, intentar iniciar sesión
    setCargando(true);

    const resultado = await iniciarSesion(email, password);

    setCargando(false);
// DESPUÉS — agrega el else
if (resultado.ok) {
  const yaVio = await AsyncStorage.getItem(CLAVES.ONBOARDING_VISTO);
  if (yaVio) {
    router.replace('/(tabs)');
  } else {
    router.replace('/onboarding');
  }
} else {
  Alert.alert('Error', resultado.mensaje);
}
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* LOGO */}  
        <View style={styles.logoWrap}>
          <Text style={styles.logoText}>TasteGo.</Text>
        </View>

        {/* CAMPOS */}
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#bbb"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor="#bbb"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {/* BOTÓN */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.btnWrapper}
          onPress={manejarLogin}
          disabled={cargando}
        >
          <LinearGradient
            colors={['#FF8C42', '#E8392A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.btn}
          >
            <Text style={styles.btnText}>
              {cargando ? 'Verificando...' : 'Iniciar sesión'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* DIVIDER */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>O inicia sesión con</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* REGISTRO LINK */}
        <View style={styles.registerRow}>
          <Text style={styles.registerGray}>¿No tienes una cuenta? </Text>
          <TouchableOpacity onPress={() => router.push('/registro')}>
            <Text style={styles.registerLink}>Regístrate</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  logoWrap: {
    marginBottom: 52,
  },
  logoText: {
    fontFamily: 'Pacifico_400Regular',
    fontSize: 52,
    color: '#E8392A',
  },
  form: {
    width: '100%',
    gap: 14,
    marginBottom: 32,
  },
  input: {
    width: '100%',
    height: 56,
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#333',
  },
  btnWrapper: {
    width: '100%',
    height: 58,
    borderRadius: 29,
    marginBottom: 32,
    overflow: 'hidden',
  },
  btn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 28,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E5E5',
  },
  dividerText: {
    fontSize: 13,
    color: '#999',
  },
  registerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  registerGray: {
    fontSize: 15,
    color: '#999',
  },
  registerLink: {
    fontSize: 15,
    color: '#E8392A',
    fontWeight: '700',
  },
});