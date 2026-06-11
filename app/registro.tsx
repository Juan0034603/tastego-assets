// app/registro.tsx

import { useState } from "react";
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
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts, Pacifico_400Regular } from "@expo-google-fonts/pacifico";
import { Ionicons } from "@expo/vector-icons";
import { registrar } from "../services/servicioAutenticacion";

export default function RegistroScreen() {
  const router = useRouter();

  // Campos del formulario
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [telefono, setTelefono] = useState("");

  // Para mostrar carga mientras se guarda
  const [cargando, setCargando] = useState(false);

  const [fontsLoaded] = useFonts({ Pacifico_400Regular });
  if (!fontsLoaded) return null;

  // ─── Función que se ejecuta al presionar "Crear cuenta" ───────────────────
  async function manejarRegistro() {
    // 1. Validar que todos los campos estén llenos
    if (!nombre || !email || !password || !ciudad || !telefono) {
      Alert.alert("Campos incompletos", "Por favor llena todos los campos.");
      return;
    }

    // 2. Validar que el email tenga formato correcto
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailValido) {
      Alert.alert("Email inválido", "Por favor ingresa un correo válido.");
      return;
    }

    // 3. Validar que la contraseña tenga al menos 6 caracteres
    if (password.length < 6) {
      Alert.alert(
        "Contraseña muy corta",
        "La contraseña debe tener al menos 6 caracteres.",
      );
      return;
    }

    // 4. Todo bien, intentar registrar
    setCargando(true);

    const resultado = await registrar({ nombre, email, password, ciudad, telefono });

    setCargando(false);

    if (resultado.ok) {
      // Registro exitoso → va a la app
      Alert.alert("¡Listo!", resultado.mensaje, [
        { text: "Continuar", onPress: () => router.replace("/(tabs)") },
      ]);
    } else {
      // Algo salió mal → mostrar el mensaje de error
      Alert.alert("Error", resultado.mensaje);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* BACK */}
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>

        {/* LOGO */}
        <View style={styles.logoWrap}>
          <Text style={styles.logoText}>TasteGo.</Text>
        </View>

        <Text style={styles.subtitle}>Crea tu cuenta</Text>

        {/* CAMPOS */}
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Nombre completo"
            placeholderTextColor="#bbb"
            value={nombre}
            onChangeText={setNombre}
            autoCapitalize="words"
          />
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
          <TextInput
            style={styles.input}
            placeholder="Ciudad"
            placeholderTextColor="#bbb"
            value={ciudad}
            onChangeText={setCiudad}
            autoCapitalize="words"
          />

          <TextInput
            style={styles.input}
            placeholder="Número de teléfono"
            placeholderTextColor="#bbb"
            value={telefono}
            onChangeText={setTelefono}
            keyboardType="phone-pad"
          />
        </View>

        {/* BOTÓN */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.btnWrapper}
          onPress={manejarRegistro}
          disabled={cargando}
        >
          <LinearGradient
            colors={["#FF8C42", "#E8392A"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.btn}
          >
            <Text style={styles.btnText}>
              {cargando ? "Guardando..." : "Crear cuenta"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* LOGIN LINK */}
        <View style={styles.loginRow}>
          <Text style={styles.loginGray}>¿Ya tienes una cuenta? </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.loginLink}>Inicia sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  back: {
    marginBottom: 20,
  },
  logoWrap: {
    marginBottom: 8,
  },
  logoText: {
    fontFamily: "Pacifico_400Regular",
    fontSize: 42,
    color: "#E8392A",
  },
  subtitle: {
    fontSize: 16,
    color: "#999",
    marginBottom: 32,
  },
  form: {
    width: "100%",
    gap: 14,
    marginBottom: 32,
  },
  input: {
    width: "100%",
    height: 56,
    backgroundColor: "#F5F5F5",
    borderRadius: 16,
    paddingHorizontal: 20,
    fontSize: 16,
    color: "#333",
  },
  btnWrapper: {
    width: "100%",
    height: 58,
    borderRadius: 29,
    marginBottom: 24,
    overflow: "hidden",
  },
  btn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  loginRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loginGray: {
    fontSize: 15,
    color: "#999",
  },
  loginLink: {
    fontSize: 15,
    color: "#E8392A",
    fontWeight: "700",
  },
});
