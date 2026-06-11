// services/servicioAutenticacion.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import { CLAVES } from './claves';
import { obtenerDB } from './baseDatos';

// ─── Tipo de dato Usuario ───────────────────────────────────────────────────
export interface Usuario {
  id_usuario?: number;
  nombre: string;
  email: string;
  password: string;
  ciudad: string;
  telefono: string;
}

// ─── Tipo de respuesta ──────────────────────────────────────────────────────
interface Respuesta {
  ok: boolean;
  mensaje: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// REGISTRAR
// Inserta el usuario en SQLite. Si el email ya existe, rechaza.
// Al éxito guarda el id_usuario en AsyncStorage y marca sesión activa.
// ─────────────────────────────────────────────────────────────────────────────
export async function registrar(usuario: Usuario): Promise<Respuesta> {
  try {
    const db = obtenerDB();

    // Verificar si ya existe ese email
    const existente = await db.getFirstAsync<{ id_usuario: number }>(
      'SELECT id_usuario FROM usuarios WHERE email = ?',
      [usuario.email]
    );

    if (existente) {
      return { ok: false, mensaje: 'Ya existe una cuenta con ese correo.' };
    }

    // Insertar el usuario nuevo
    const resultado = await db.runAsync(
      'INSERT INTO usuarios (nombre, email, password, ciudad, telefono) VALUES (?, ?, ?, ?, ?)',
      [usuario.nombre, usuario.email, usuario.password, usuario.ciudad, usuario.telefono]
    );

    // Guardar solo el id en AsyncStorage + marcar sesión activa
    await AsyncStorage.setItem(CLAVES.USUARIO, String(resultado.lastInsertRowId));
    await AsyncStorage.setItem(CLAVES.SESION_ACTIVA, 'true');

    return { ok: true, mensaje: 'Cuenta creada correctamente.' };
  } catch (error) {
    return { ok: false, mensaje: 'Ocurrió un error al guardar. Intenta de nuevo.' };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// INICIAR SESIÓN
// Busca el usuario por email en SQLite y compara la contraseña.
// Al éxito guarda el id_usuario en AsyncStorage y marca sesión activa.
// ─────────────────────────────────────────────────────────────────────────────
export async function iniciarSesion(email: string, password: string): Promise<Respuesta> {
  try {
    const db = obtenerDB();

    const usuario = await db.getFirstAsync<Usuario>(
      'SELECT * FROM usuarios WHERE email = ?',
      [email]
    );

    if (!usuario) {
      return { ok: false, mensaje: 'No hay ninguna cuenta registrada con ese correo.' };
    }

    if (usuario.password !== password) {
      return { ok: false, mensaje: 'La contraseña es incorrecta.' };
    }

    // Guardar id + marcar sesión activa
    await AsyncStorage.setItem(CLAVES.USUARIO, String(usuario.id_usuario));
    await AsyncStorage.setItem(CLAVES.SESION_ACTIVA, 'true');

    return { ok: true, mensaje: `Bienvenido de nuevo, ${usuario.nombre}.` };
  } catch (error) {
    return { ok: false, mensaje: 'Ocurrió un error al iniciar sesión. Intenta de nuevo.' };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// VERIFICAR SESIÓN
// Solo revisa AsyncStorage. Sin cambios respecto a la versión anterior.
// ─────────────────────────────────────────────────────────────────────────────
export async function verificarSesion(): Promise<boolean> {
  try {
    const sesion = await AsyncStorage.getItem(CLAVES.SESION_ACTIVA);
    return sesion === 'true';
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// OBTENER USUARIO
// Lee el id guardado en AsyncStorage y consulta SQLite para traer
// los datos frescos. Así siempre tenemos la info actualizada.
// ─────────────────────────────────────────────────────────────────────────────
export async function obtenerUsuario(): Promise<Usuario | null> {
  try {
    const db = obtenerDB();
    const idGuardado = await AsyncStorage.getItem(CLAVES.USUARIO);
    if (!idGuardado) return null;

    const usuario = await db.getFirstAsync<Usuario>(
      'SELECT * FROM usuarios WHERE id_usuario = ?',
      [parseInt(idGuardado)]
    );

    return usuario ?? null;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CERRAR SESIÓN
// Borra la sesión activa Y el id guardado. Los datos del usuario
// quedan intactos en SQLite.
// ─────────────────────────────────────────────────────────────────────────────
export async function cerrarSesion(): Promise<void> {
  await AsyncStorage.removeItem(CLAVES.SESION_ACTIVA);
  await AsyncStorage.removeItem(CLAVES.USUARIO);
}