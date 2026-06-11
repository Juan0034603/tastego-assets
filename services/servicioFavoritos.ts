// services/servicioFavoritos.ts

import { obtenerDB } from './baseDatos';
import { obtenerUsuario } from './servicioAutenticacion';
import { Restaurante } from './servicioRestaurantes';

// ─── Obtener todos los favoritos del usuario activo ───────────────────────
// Hace un JOIN entre favoritos y restaurantes para devolver
// el objeto Restaurante completo de cada favorito
export async function obtenerFavoritos(): Promise<Restaurante[]> {
  try {
    const db = obtenerDB();
    const usuario = await obtenerUsuario();
    if (!usuario?.id_usuario) return [];

    const resultado = await db.getAllAsync<Restaurante>(
      `SELECT r.* FROM restaurantes r
       INNER JOIN favoritos f ON r.id_restaurante = f.id_restaurante
       WHERE f.id_usuario = ?
       ORDER BY f.fecha_guardado DESC`,
      [usuario.id_usuario]
    );

    return resultado;
  } catch {
    return [];
  }
}

// ─── Verificar si un restaurante es favorito ─────────────────────────────
export async function esFavorito(id_restaurante: number): Promise<boolean> {
  try {
    const db = obtenerDB();
    const usuario = await obtenerUsuario();
    if (!usuario?.id_usuario) return false;

    const resultado = await db.getFirstAsync<{ total: number }>(
      `SELECT COUNT(*) as total FROM favoritos
       WHERE id_usuario = ? AND id_restaurante = ?`,
      [usuario.id_usuario, id_restaurante]
    );

    return (resultado?.total ?? 0) > 0;
  } catch {
    return false;
  }
}

// ─── Agregar un restaurante a favoritos ───────────────────────────────────
export async function agregarFavorito(id_restaurante: number): Promise<boolean> {
  try {
    const db = obtenerDB();
    const usuario = await obtenerUsuario();
    if (!usuario?.id_usuario) return false;

    await db.runAsync(
      `INSERT OR IGNORE INTO favoritos (id_usuario, id_restaurante)
       VALUES (?, ?)`,
      [usuario.id_usuario, id_restaurante]
    );

    return true;
  } catch {
    return false;
  }
}

// ─── Quitar un restaurante de favoritos ───────────────────────────────────
export async function quitarFavorito(id_restaurante: number): Promise<boolean> {
  try {
    const db = obtenerDB();
    const usuario = await obtenerUsuario();
    if (!usuario?.id_usuario) return false;

    await db.runAsync(
      `DELETE FROM favoritos
       WHERE id_usuario = ? AND id_restaurante = ?`,
      [usuario.id_usuario, id_restaurante]
    );

    return true;
  } catch {
    return false;
  }
}

// ─── Toggle — si es favorito lo quita, si no lo agrega ───────────────────
export async function toggleFavorito(id_restaurante: number): Promise<boolean> {
  const favorito = await esFavorito(id_restaurante);
  if (favorito) {
    await quitarFavorito(id_restaurante);
    return false; // ahora NO es favorito
  } else {
    await agregarFavorito(id_restaurante);
    return true; // ahora SÍ es favorito
  }
}