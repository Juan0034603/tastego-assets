// app/visor3d.tsx

import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';

// ─── Cambia esta URL cuando subas el modelo a GitHub Pages ────────────────
const URL_MODELO = 'https://TU_USUARIO.github.io/TU_REPO/pizzaModelo.glb';

const HTML_VISOR = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #1a1a1a; overflow: hidden; }
    canvas { display: block; }
    #info {
      position: absolute;
      bottom: 20px;
      width: 100%;
      text-align: center;
      color: rgba(255,255,255,0.5);
      font-family: sans-serif;
      font-size: 13px;
    }
    #loading {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: white;
      font-family: sans-serif;
      font-size: 16px;
    }
  </style>
</head>
<body>
  <div id="loading">Cargando modelo...</div>
  <div id="info">Arrastra para rotar • Pellizca para zoom</div>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>

  <script>
    // ─── Escena ───────────────────────────────────────────────────────────
    const escena = new THREE.Scene();
    escena.background = new THREE.Color(0x1a1a1a);

    // ─── Cámara ───────────────────────────────────────────────────────────
    const camara = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camara.position.set(0, 1, 3);

    // ─── Renderer ─────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    // ─── Luces ────────────────────────────────────────────────────────────
    const luzAmbiente = new THREE.AmbientLight(0xffffff, 0.6);
    escena.add(luzAmbiente);

    const luzDireccional = new THREE.DirectionalLight(0xffffff, 1.2);
    luzDireccional.position.set(5, 10, 5);
    luzDireccional.castShadow = true;
    escena.add(luzDireccional);

    const luzRelleno = new THREE.DirectionalLight(0xFF8C42, 0.4);
    luzRelleno.position.set(-5, 0, -5);
    escena.add(luzRelleno);

    // ─── Controles táctiles ───────────────────────────────────────────────
    const controles = new THREE.OrbitControls(camara, renderer.domElement);
    controles.enableDamping = true;
    controles.dampingFactor = 0.05;
    controles.minDistance = 1;
    controles.maxDistance = 8;
    controles.autoRotate = true;
    controles.autoRotateSpeed = 1.5;

    // ─── Cargar modelo GLB ────────────────────────────────────────────────
    const cargador = new THREE.GLTFLoader();
    cargador.load(
      '${URL_MODELO}',
      function(gltf) {
        const modelo = gltf.scene;

        // Centrar el modelo automáticamente
        const caja = new THREE.Box3().setFromObject(modelo);
        const centro = caja.getCenter(new THREE.Vector3());
        const tamanio = caja.getSize(new THREE.Vector3());
        const escalaMax = Math.max(tamanio.x, tamanio.y, tamanio.z);
        const factorEscala = 2 / escalaMax;

        modelo.position.sub(centro);
        modelo.scale.setScalar(factorEscala);

        escena.add(modelo);
        document.getElementById('loading').style.display = 'none';
      },
      function(progreso) {
        const porcentaje = Math.round((progreso.loaded / progreso.total) * 100);
        document.getElementById('loading').textContent = 'Cargando ' + porcentaje + '%';
      },
      function(error) {
        document.getElementById('loading').textContent = 'Error al cargar el modelo';
        console.error('Error:', error);
      }
    );

    // ─── Bucle de animación ───────────────────────────────────────────────
    function animar() {
      requestAnimationFrame(animar);
      controles.update();
      renderer.render(escena, camara);
    }
    animar();

    // ─── Responsive ───────────────────────────────────────────────────────
    window.addEventListener('resize', () => {
      camara.aspect = window.innerWidth / window.innerHeight;
      camara.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  </script>
</body>
</html>
`;

export default function Visor3DScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>

      {/* BOTÓN BACK */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={18} color="#1a1a1a" />
      </TouchableOpacity>

      {/* VISOR 3D */}
      <WebView
        source={{ html: HTML_VISOR }}
        style={styles.webview}
        scrollEnabled={false}
        allowsInlineMediaPlayback
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={['*']}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  backBtn: {
    position: 'absolute',
    top: 52,
    left: 16,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  webview: {
    flex: 1,
  },
});