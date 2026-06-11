// services/servicioRestaurantes.ts

import { obtenerDB } from "./baseDatos";

export interface Restaurante {
  id_restaurante: number;
  nombre: string;
  descripcion: string;
  tipo_comida: string;
  direccion: string;
  ciudad: string;
  latitud: number;
  longitud: number;
  imagen_key: string;
  telefono: string;
  horario: string;
  calificacion: number;
}

// Todos los restaurantes
export async function obtenerRestaurantes(): Promise<Restaurante[]> {
  const db = obtenerDB();
  const resultado = await db.getAllAsync<Restaurante>(
    "SELECT * FROM restaurantes ORDER BY calificacion DESC"
  );
  return resultado;
}

// Filtro por nombre (búsqueda libre)
export async function buscarRestaurantes(texto: string): Promise<Restaurante[]> {
  const db = obtenerDB();
  const resultado = await db.getAllAsync<Restaurante>(
    "SELECT * FROM restaurantes WHERE nombre LIKE ? OR tipo_comida LIKE ? ORDER BY calificacion DESC",
    [`%${texto}%`, `%${texto}%`]
  );
  return resultado;
}

// Un restaurante por id (para restperfil y mapa)
export async function obtenerRestaurantePorId(id: number): Promise<Restaurante | null> {
  const db = obtenerDB();
  const resultado = await db.getFirstAsync<Restaurante>(
    "SELECT * FROM restaurantes WHERE id_restaurante = ?",
    [id]
  );
  return resultado ?? null;
}

// Filtro por categoría/tipo de comida (para búsqueda por categoría)
export async function obtenerRestaurantesPorCategoria(tipo: string): Promise<Restaurante[]> {
  const db = obtenerDB();
  const resultado = await db.getAllAsync<Restaurante>(
    "SELECT * FROM restaurantes WHERE tipo_comida = ? ORDER BY calificacion DESC",
    [tipo]
  );
  return resultado;
}






//Función para obtener los platos de un restaurante específico, se usará en el perfil del restaurante y en el menú
export interface Plato {
  id_plato: number;
  id_restaurante: number;
  id_categoria: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen_key: string;
  disponible: number;
}

// Platos de un restaurante específico
export async function obtenerPlatosPorRestaurante(id: number): Promise<Plato[]> {
  const db = obtenerDB();
  const resultado = await db.getAllAsync<Plato>(
    "SELECT * FROM platos WHERE id_restaurante = ? AND disponible = 1",
    [id]
  );
  return resultado;
}