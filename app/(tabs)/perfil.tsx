import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  Image,
} from "react-native";
import { CLAVES } from '../../services/claves';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import {
  obtenerUsuario,
  cerrarSesion,
  Usuario,
} from "../../services/servicioAutenticacion";

const AVATARES = ["👨🏾", "👩🏾", "👨🏻", "👩🏻", "👨🏽", "👩🏽", "👨🏿", "👩🏿"];

export default function PerfilScreen() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);
  const [avatarEmoji, setAvatarEmoji] = useState("👨🏾");
  const [avatarFoto, setAvatarFoto] = useState<string | null>(null);
  const [modalAvatar, setModalAvatar] = useState(false);

  useEffect(() => {
    async function cargarUsuario() {
      const datos = await obtenerUsuario();
      setUsuario(datos);
      setCargando(false);
    }
    cargarUsuario();
  }, []);

  // ── Abrir cámara ──────────────────────────────────────────────────────────
  async function abrirCamara() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permiso requerido", "Necesitamos acceso a tu cámara.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setAvatarFoto(result.assets[0].uri);
      setModalAvatar(false);
    }
  }

  // ── Abrir galería ─────────────────────────────────────────────────────────
  async function abrirGaleria() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permiso requerido", "Necesitamos acceso a tu galería.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setAvatarFoto(result.assets[0].uri);
      setModalAvatar(false);
    }
  }

  async function manejarCierreSesion() {
    Alert.alert("Cerrar sesión", "¿Estás seguro que quieres cerrar sesión?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Cerrar sesión",
        style: "destructive",
        onPress: async () => {
          await cerrarSesion();
          router.replace("/inicio");
        },
      },
    ]);
  }

  if (cargando) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color="#E8392A" />
      </View>
    );
  }

  if (!usuario) {
    return (
      <View style={styles.loadingWrap}>
        <Text style={styles.errorTxt}>No se encontró información del usuario.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* MODAL SELECTOR DE AVATAR */}
      <Modal visible={modalAvatar} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Tomate Una Foto</Text>

            {/* OPCIONES CÁMARA Y GALERÍA */}
            <View style={styles.fotoRow}>
              <TouchableOpacity style={styles.fotoBtn} onPress={abrirCamara}>
                <View style={styles.fotoBtnIcon}>
                  <Ionicons name="camera" size={22} color="#E8392A" />
                </View>
                <Text style={styles.fotoBtnTxt}>Cámara</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.fotoBtn} onPress={abrirGaleria}>
                <View style={styles.fotoBtnIcon}>
                  <Ionicons name="images-outline" size={22} color="#E8392A" />
                </View>
                <Text style={styles.fotoBtnTxt}>Galería</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalDivider}>
              <View style={styles.modalDividerLine} />
              <Text style={styles.modalDividerTxt}>o elige un avatar</Text>
              <View style={styles.modalDividerLine} />
            </View>

            {/* GRID DE EMOJIS */}
            <View style={styles.avatarGrid}>
              {AVATARES.map((em) => (
                <TouchableOpacity
                  key={em}
                  style={[
                    styles.avatarOption,
                    !avatarFoto && avatarEmoji === em && styles.avatarOptionSel,
                  ]}
                  onPress={() => {
                    setAvatarEmoji(em);
                    setAvatarFoto(null);
                    setModalAvatar(false);
                  }}
                >
                  <Text style={styles.avatarOptionEmoji}>{em}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.modalCerrar}
              onPress={() => setModalAvatar(false)}
            >
              <Text style={styles.modalCerrarTxt}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* HEADER CON GRADIENTE */}
      <LinearGradient
        colors={["#E8392A", "#FF6B35"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.topBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <View style={styles.topLoc}>
            <Ionicons name="location-sharp" size={13} color="rgba(255,255,255,0.8)" />
            <Text style={styles.topLocText}>{usuario.ciudad}</Text>
          </View>
          <TouchableOpacity style={styles.topBtn}>
            <Ionicons name="mail-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* AVATAR */}
        <View style={styles.avatarSection}>
          <TouchableOpacity
            style={styles.avatarWrap}
            onPress={() => setModalAvatar(true)}
            activeOpacity={0.85}
          >
            <View style={styles.avatarCircle}>
              {avatarFoto ? (
                <Image
                  source={{ uri: avatarFoto }}
                  style={styles.avatarImg}
                />
              ) : (
                <Text style={styles.avatarEmoji}>{avatarEmoji}</Text>
              )}
            </View>
            <View style={styles.avatarCam}>
              <Ionicons name="camera" size={12} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.nombre}>{usuario.nombre}</Text>
          <Text style={styles.emailTxt}>{usuario.email}</Text>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>

        {/* INFORMACIÓN PERSONAL */}
        <Text style={styles.secTitle}>Información personal</Text>
        <View style={styles.fieldsCard}>
          <View style={styles.field}>
            <View style={styles.fieldIconWrap}>
              <Ionicons name="person-outline" size={18} color="#E8392A" />
            </View>
            <View style={styles.fieldBody}>
              <Text style={styles.fieldLabel}>Nombre completo</Text>
              <Text style={styles.fieldVal}>{usuario.nombre}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#ddd" />
          </View>

          <View style={styles.fieldSep} />

          <View style={styles.field}>
            <View style={styles.fieldIconWrap}>
              <Ionicons name="mail-outline" size={18} color="#E8392A" />
            </View>
            <View style={styles.fieldBody}>
              <Text style={styles.fieldLabel}>Email</Text>
              <Text style={styles.fieldVal}>{usuario.email}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#ddd" />
          </View>

          <View style={styles.fieldSep} />

          <View style={styles.field}>
            <View style={styles.fieldIconWrap}>
              <Ionicons name="location-outline" size={18} color="#E8392A" />
            </View>
            <View style={styles.fieldBody}>
              <Text style={styles.fieldLabel}>Ciudad</Text>
              <Text style={styles.fieldVal}>{usuario.ciudad}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#ddd" />
          </View>

          <View style={styles.fieldSep} />

          <View style={styles.field}>
            <View style={styles.fieldIconWrap}>
              <Ionicons name="call-outline" size={18} color="#E8392A" />
            </View>
            <View style={styles.fieldBody}>
              <Text style={styles.fieldLabel}>Número</Text>
              <Text style={styles.fieldVal}>{usuario.telefono}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#ddd" />
          </View>
        </View>

        {/* MÉTODO DE PAGO */}
        <Text style={styles.secTitle}>Método de pago</Text>
        <View style={styles.fieldsCard}>
          <View style={styles.field}>
            <View style={[styles.fieldIconWrap, { backgroundColor: "#fff0f0" }]}>
              <Ionicons name="card-outline" size={18} color="#E8392A" />
            </View>
            <View style={styles.fieldBody}>
              <Text style={styles.fieldLabel}>Tarjeta</Text>
              <Text style={styles.fieldVal}>No registrada</Text>
            </View>
            <View style={styles.addBtn}>
              <Text style={styles.addBtnTxt}>Agregar</Text>
            </View>
          </View>
        </View>

        {/* CERRAR SESIÓN */}
        <TouchableOpacity
          style={styles.btnCerrar}
          onPress={manejarCierreSesion}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={18} color="#E8392A" />
          <Text style={styles.btnCerrarTxt}>Cerrar sesión</Text>
        </TouchableOpacity>

        {/* BOTÓN DEV */}
        <TouchableOpacity
          style={styles.btnResetear}
          onPress={async () => {
            await AsyncStorage.removeItem(CLAVES.ONBOARDING_VISTO);
            Alert.alert("Listo", "El onboarding aparecerá la próxima vez que inicies sesión.");
          }}
        >
          <Text style={styles.btnResetearTxt}>🔧 Resetear onboarding</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  errorTxt: {
    fontSize: 14,
    color: "#999",
  },

  // HEADER
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  topBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  topLoc: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  topLocText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "500",
  },

  // AVATAR
  avatarSection: {
    alignItems: "center",
    gap: 6,
  },
  avatarWrap: {
    position: "relative",
    marginBottom: 4,
  },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderWidth: 3,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImg: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  avatarEmoji: {
    fontSize: 52,
  },
  avatarCam: {
    position: "absolute",
    bottom: 2,
    right: 2,
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    width: 26,
    height: 26,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  nombre: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  emailTxt: {
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
  },

  // SCROLL
  scroll: {
    flex: 1,
    paddingTop: 24,
  },

  // SECCIONES
  secTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#999",
    paddingHorizontal: 20,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  fieldsCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 18,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: "hidden",
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  fieldSep: {
    height: 1,
    backgroundColor: "#f8f8f8",
    marginLeft: 68,
  },
  fieldIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#fff5f5",
    alignItems: "center",
    justifyContent: "center",
  },
  fieldBody: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 11,
    color: "#bbb",
    marginBottom: 2,
  },
  fieldVal: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  addBtn: {
    backgroundColor: "#fff0f0",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  addBtnTxt: {
    fontSize: 12,
    fontWeight: "700",
    color: "#E8392A",
  },

  // BOTONES
  btnCerrar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#E8392A",
    backgroundColor: "#fff",
    marginBottom: 12,
  },
  btnCerrarTxt: {
    fontSize: 15,
    fontWeight: "700",
    color: "#E8392A",
  },
  btnResetear: {
    marginHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#eee",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  btnResetearTxt: {
    fontSize: 13,
    color: "#bbb",
  },

  // MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    width: "85%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 16,
  },
  fotoRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 20,
    width: "100%",
    justifyContent: "center",
  },
  fotoBtn: {
    alignItems: "center",
    gap: 6,
  },
  fotoBtnIcon: {
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: "#fff5f5",
    borderWidth: 1.5,
    borderColor: "#ffd5d0",
    alignItems: "center",
    justifyContent: "center",
  },
  fotoBtnTxt: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
  },
  modalDivider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: "100%",
    marginBottom: 16,
  },
  modalDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#eee",
  },
  modalDividerTxt: {
    fontSize: 11,
    color: "#bbb",
  },
  avatarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
    marginBottom: 20,
  },
  avatarOption: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2.5,
    borderColor: "transparent",
  },
  avatarOptionSel: {
    borderColor: "#E8392A",
    backgroundColor: "#fff0f0",
  },
  avatarOptionEmoji: {
    fontSize: 30,
  },
  modalCerrar: {
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#eee",
  },
  modalCerrarTxt: {
    fontSize: 14,
    color: "#999",
    fontWeight: "600",
  },
});