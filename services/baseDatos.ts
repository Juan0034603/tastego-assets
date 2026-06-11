import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("tastego.db");

export async function inicializarBaseDatos(): Promise<void> {
  await db.execAsync(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS usuarios (
      id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      ciudad TEXT,
      telefono TEXT,
      fecha_registro TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categoria (
      id_categoria INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      descripcion TEXT
    );

    CREATE TABLE IF NOT EXISTS restaurantes (
      id_restaurante INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      descripcion TEXT,
      tipo_comida TEXT,
      direccion TEXT,
      ciudad TEXT DEFAULT 'Sincelejo',
      latitud REAL,
      longitud REAL,
      imagen_key TEXT,
      telefono TEXT,
      horario TEXT,
      calificacion REAL,
      fecha_creacion TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS platos (
      id_plato INTEGER PRIMARY KEY AUTOINCREMENT,
      id_restaurante INTEGER NOT NULL,
      id_categoria INTEGER NOT NULL,
      nombre TEXT NOT NULL,
      descripcion TEXT,
      precio REAL,
      imagen_key TEXT,
      disponible INTEGER DEFAULT 1,
      FOREIGN KEY (id_restaurante) REFERENCES restaurantes(id_restaurante) ON DELETE CASCADE,
      FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS favoritos (
      id_favorito INTEGER PRIMARY KEY AUTOINCREMENT,
      id_usuario INTEGER NOT NULL,
      id_restaurante INTEGER NOT NULL,
      fecha_guardado TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
      FOREIGN KEY (id_restaurante) REFERENCES restaurantes(id_restaurante) ON DELETE CASCADE,
      UNIQUE (id_usuario, id_restaurante)
    );

    CREATE TABLE IF NOT EXISTS review (
      id_review INTEGER PRIMARY KEY AUTOINCREMENT,
      id_plato INTEGER NOT NULL,
      id_restaurante INTEGER NOT NULL,
      id_usuario INTEGER NOT NULL,
      descripcion TEXT,
      calificacion REAL,
      fecha TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (id_plato) REFERENCES platos(id_plato) ON DELETE CASCADE,
      FOREIGN KEY (id_restaurante) REFERENCES restaurantes(id_restaurante) ON DELETE CASCADE,
      FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
    );
  `);

  await poblarDatosIniciales();
}

async function poblarDatosIniciales(): Promise<void> {
  // Solo pobla si no hay datos
  const categorias = await db.getFirstAsync<{ total: number }>(
    "SELECT COUNT(*) as total FROM categoria",
  );
  if (categorias && categorias.total > 0) return;

  // ── CATEGORÍAS ───────────────────────────────────────────────
  await db.execAsync(`
    INSERT INTO categoria (nombre, descripcion) VALUES
      ('Comida típica', 'Platos tradicionales de la región'),
      ('Pizza', 'Pizzas y pastas'),
      ('Hamburguesas', 'Hamburguesas y comida rápida'),
      ('Mariscos', 'Pescados y mariscos frescos'),
      ('Pollo', 'Pollo asado y frito');
  `);

  // ── RESTAURANTES ─────────────────────────────────────────────
  await db.execAsync(`
    INSERT INTO restaurantes (nombre, descripcion, tipo_comida, direccion, latitud, longitud, imagen_key, calificacion) VALUES
      ('Sabor y Fuego',       'Restaurante de comida típica costeña con los mejores sabores de Sincelejo', 'Comida típica',  'Cra 20 #25-10, Sincelejo', 12.3047, -75.3978, 'colombian-restaurant', 4.9),
      ('La Costeña',          'Tradición y sazón costeña en cada plato',                                  'Comida típica',  'Cll 30 #18-22, Sincelejo', 9.3112, -75.4021, 'typical-food',         4.7),
      ('Pizza Hot',           'Las mejores pizzas artesanales de la ciudad',                              'Pizza',          'Cra 15 #32-45, Sincelejo', 9.2989, -75.3901, 'pizza',                4.5),
      ('El Rincón del Mar',   'Mariscos frescos traídos directamente del Golfo de Morrosquillo',          'Mariscos',       'Cll 25 #20-15, Sincelejo', 9.3078, -75.3855, 'seafood',              4.8),
      ('Burger Bros',         'Hamburguesas artesanales con ingredientes frescos',                        'Hamburguesas',   'Cra 22 #28-30, Sincelejo', 9.2941, -75.4055, 'burger',               4.3),
      ('pollo loco',           'Pollo asado y frito con el mejor sabor de la costa',                        'Pollo',          'Cll 18 #22-10, Sincelejo', 9.3005, -75.4102, 'pollo',           4.6);
  `);

  // ── PLATOS ───────────────────────────────────────────────────
  await db.execAsync(`
    INSERT INTO platos (id_restaurante, id_categoria, nombre, descripcion, precio, imagen_key) VALUES
      (1, 1, 'Bandeja Paisa', 'Bandeja completa con frijoles, arroz, chicharrón, huevo y aguacate', 28000, 'bandeja-paisa'),
      (1, 1, 'Sancocho Costeño', 'Sancocho de gallina con yuca, ñame y mazorca', 18000, 'colombian-soup'),
      (1, 1, 'Arroz de Coco', 'Arroz con coco acompañado de patacones', 12000, 'coconut-rice'),
      (2, 1, 'Pescado Frito', 'Pescado entero frito con arroz de coco y ensalada', 25000, 'fried-fish'),
      (2, 1, 'Arroz de Mariscos', 'Arroz con camarones, calamares y almejas', 32000, 'seafood'),
      (3, 2, 'Pizza Hawaiana', 'Pizza con jamón, piña y queso mozzarella', 35000, 'pizza'),
      (3, 2, 'Pizza BBQ', 'Pizza con pollo BBQ, cebolla caramelizada y queso', 38000, 'pizza'),
      (4, 4, 'Cazuela de Mariscos', 'Cazuela cremosa con camarones, cangrejo y calamares', 42000, 'seafood'),
      (4, 4, 'Ceviche Costeño', 'Ceviche fresco con limón, cebolla y cilantro', 22000, 'seafood'),
      (5, 3, 'Burger Clásica', 'Hamburguesa con carne, lechuga, tomate y queso', 20000, 'burger'),
      (5, 3, 'Burger Doble', 'Doble carne con bacon, queso cheddar y salsa especial', 28000, 'burger');
  `);
}

export function obtenerDB() {
  return db;
}
