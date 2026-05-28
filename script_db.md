```sql
-- ========================================================

CREATE TYPE estado_live AS ENUM (
    'en_vivo',
    'finalizado'
);

CREATE TYPE tipo_producto AS ENUM (
    'emote',
    'badge',
    'sticker'
);

CREATE TYPE tipo_notificacion AS ENUM (
    'live_en_vivo',
    'nuevo_seguidor',
    'sistema',
    'mensajes_nuevos'
);

CREATE TYPE estado_reporte AS ENUM (
    'pendiente',
    'revisado',
    'desestimado'
);

-- =========================================================
-- 1. USUARIOS
-- =========================================================

CREATE TABLE usuarios (
    usuario_id SERIAL PRIMARY KEY,
    username VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(255),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- 2. CANALES
-- =========================================================

CREATE TABLE canales (
    canal_id SERIAL PRIMARY KEY,
    usuario_id INT UNIQUE NOT NULL,
    nombre_canal VARCHAR(100) NOT NULL,
    descripcion TEXT,
    logo_url VARCHAR(255),
    stream_key VARCHAR(100) UNIQUE NOT NULL,

    FOREIGN KEY (usuario_id)
    REFERENCES usuarios(usuario_id)
    ON DELETE CASCADE
);

-- =========================================================
-- 3. LIVE
-- =========================================================

CREATE TABLE live (
    live_id SERIAL PRIMARY KEY,
    canal_id INT NOT NULL,
    titulo VARCHAR(100) NOT NULL,
    contenido TEXT,
    descripcion TEXT,
    inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fin TIMESTAMP NULL,
    estado estado_live DEFAULT 'en_vivo',

    FOREIGN KEY (canal_id)
    REFERENCES canales(canal_id)
    ON DELETE CASCADE
);

-- =========================================================
-- 4. SEGUIDORES
-- =========================================================

CREATE TABLE seguidores (
    seguidor_id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    canal_id INT NOT NULL,

    UNIQUE(usuario_id, canal_id),

    FOREIGN KEY (usuario_id)
    REFERENCES usuarios(usuario_id)
    ON DELETE CASCADE,

    FOREIGN KEY (canal_id)
    REFERENCES canales(canal_id)
    ON DELETE CASCADE
);

-- =========================================================
-- 5. HISTORIAL
-- =========================================================

CREATE TABLE historial (
    historial_id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    canal_id INT NOT NULL,
    live_id INT NOT NULL,

    FOREIGN KEY (usuario_id)
    REFERENCES usuarios(usuario_id)
    ON DELETE CASCADE,

    FOREIGN KEY (canal_id)
    REFERENCES canales(canal_id)
    ON DELETE CASCADE,

    FOREIGN KEY (live_id)
    REFERENCES live(live_id)
    ON DELETE CASCADE
);

-- =========================================================
-- 6. CHAT LIVE
-- =========================================================

CREATE TABLE chat_live (
    mensaje_live_id BIGSERIAL PRIMARY KEY,
    live_id INT NOT NULL,
    usuario_id INT NOT NULL,
    mensaje TEXT NOT NULL,
    enviado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (live_id)
    REFERENCES live(live_id)
    ON DELETE CASCADE,

    FOREIGN KEY (usuario_id)
    REFERENCES usuarios(usuario_id)
    ON DELETE CASCADE
);

-- =========================================================
-- 7. CHAT PRIVADO
-- =========================================================

CREATE TABLE chat_privado (
    mensaje_privado_id BIGSERIAL PRIMARY KEY,
    remitente_id INT NOT NULL,
    destinatario_id INT NOT NULL,
    contenido_texto TEXT NOT NULL,
    leido BOOLEAN DEFAULT FALSE,
    enviado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (remitente_id)
    REFERENCES usuarios(usuario_id)
    ON DELETE CASCADE,

    FOREIGN KEY (destinatario_id)
    REFERENCES usuarios(usuario_id)
    ON DELETE CASCADE
);

-- =========================================================
-- 8. TIENDA
-- =========================================================

CREATE TABLE tienda (
    producto_id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio_monedas INT NOT NULL,
    imagen_url VARCHAR(255) NOT NULL,
    tipo tipo_producto NOT NULL
);

-- =========================================================
-- 9. COLECCION
-- =========================================================

CREATE TABLE coleccion (
    coleccion_id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    producto_id INT NOT NULL,

    UNIQUE(usuario_id, producto_id),

    FOREIGN KEY (usuario_id)
    REFERENCES usuarios(usuario_id)
    ON DELETE CASCADE,

    FOREIGN KEY (producto_id)
    REFERENCES tienda(producto_id)
    ON DELETE CASCADE
);

-- =========================================================
-- 10. BLOQUEADOS
-- =========================================================

CREATE TABLE bloqueados (
    bloqueo_id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    usuario_bloqueado_id INT NOT NULL,

    FOREIGN KEY (usuario_id)
    REFERENCES usuarios(usuario_id)
    ON DELETE CASCADE,

    FOREIGN KEY (usuario_bloqueado_id)
    REFERENCES usuarios(usuario_id)
    ON DELETE CASCADE
);

-- =========================================================
-- 11. NOTIFICACION
-- =========================================================

CREATE TABLE notificacion (
    notificacion_id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    titulo VARCHAR(100) NOT NULL,
    mensaje VARCHAR(255) NOT NULL,
    tipo tipo_notificacion NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (usuario_id)
    REFERENCES usuarios(usuario_id)
    ON DELETE CASCADE
);

-- =========================================================
-- 12. BILLETERA
-- =========================================================

CREATE TABLE billetera (
    billetera_id SERIAL PRIMARY KEY,
    usuario_id INT UNIQUE NOT NULL,
    saldo_monedas INT DEFAULT 0,

    FOREIGN KEY (usuario_id)
    REFERENCES usuarios(usuario_id)
    ON DELETE CASCADE
);

-- =========================================================
-- 13. REPORTES
-- =========================================================

CREATE TABLE reportes (
    reporte_id SERIAL PRIMARY KEY,
    denunciante_id INT NOT NULL,
    denunciado_id INT NOT NULL,
    motivo VARCHAR(500) NOT NULL,
    estado estado_reporte DEFAULT 'pendiente',
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (denunciante_id)
    REFERENCES usuarios(usuario_id)
    ON DELETE CASCADE,

    FOREIGN KEY (denunciado_id)
    REFERENCES usuarios(usuario_id)
    ON DELETE CASCADE
);

-- =========================================================
-- INSERTS MASIVOS
-- =========================================================

-- =========================================================
-- USUARIOS (100)
-- =========================================================

INSERT INTO usuarios (
    username,
    email,
    password_hash,
    avatar_url,
    creado_en
)
SELECT
    'usuario' || gs,
    'usuario' || gs || '@mail.com',
    md5(random()::text),
    'https://cdn.streaming.com/avatar/' || gs || '.png',
    TIMESTAMP '2024-01-01 00:00:00'
        + (gs || ' days')::interval
FROM generate_series(1,100) AS gs;

-- =========================================================
-- CANALES (100)
-- =========================================================

INSERT INTO canales (
    usuario_id,
    nombre_canal,
    descripcion,
    logo_url,
    stream_key
)
SELECT
    usuario_id,
    'Canal_' || username,
    'Canal dedicado a videojuegos, charlas y entretenimiento.',
    'https://cdn.streaming.com/logo/' || usuario_id || '.png',
    md5(random()::text)
FROM usuarios;

-- =========================================================
-- BILLETERAS (100)
-- =========================================================

INSERT INTO billetera (
    usuario_id,
    saldo_monedas
)
SELECT
    usuario_id,
    (random() * 50000)::INT
FROM usuarios;

-- =========================================================
-- TIENDA (60 PRODUCTOS)
-- =========================================================

INSERT INTO tienda (
    nombre,
    descripcion,
    precio_monedas,
    imagen_url,
    tipo
)
SELECT
    'Producto_' || gs,
    'Objeto digital exclusivo número ' || gs,
    (random() * 5000 + 100)::INT,
    'https://cdn.streaming.com/store/' || gs || '.png',
    CASE
        WHEN gs % 3 = 0 THEN 'emote'::tipo_producto
        WHEN gs % 3 = 1 THEN 'badge'::tipo_producto
        ELSE 'sticker'::tipo_producto
    END
FROM generate_series(1,60) gs;

-- =========================================================
-- LIVE (200)
-- =========================================================

INSERT INTO live (
    canal_id,
    titulo,
    contenido,
    descripcion,
    inicio,
    fin,
    estado
)
SELECT
    ((gs - 1) % 100) + 1,
    CASE
        WHEN gs % 5 = 0 THEN 'Rankeds intensas en Valorant'
        WHEN gs % 5 = 1 THEN 'Charlando con el chat'
        WHEN gs % 5 = 2 THEN 'Gameplay competitivo de LoL'
        WHEN gs % 5 = 3 THEN 'Minecraft survival hardcore'
        ELSE 'Directo reaccionando videos'
    END,
    'Contenido del stream #' || gs,
    'Streaming en español con interacción en vivo.',
    TIMESTAMP '2025-01-01 10:00:00'
        + (gs || ' hours')::interval,
    TIMESTAMP '2025-01-01 12:00:00'
        + (gs || ' hours')::interval,
    CASE
        WHEN gs % 4 = 0 THEN 'finalizado'::estado_live
        ELSE 'en_vivo'::estado_live
    END
FROM generate_series(1,200) gs;

-- =========================================================
-- SEGUIDORES (500)
-- =========================================================

INSERT INTO seguidores (
    usuario_id,
    canal_id
)
SELECT DISTINCT
    (random() * 99 + 1)::INT,
    (random() * 99 + 1)::INT
FROM generate_series(1,800)
ON CONFLICT DO NOTHING;

-- =========================================================
-- HISTORIAL (500)
-- =========================================================

INSERT INTO historial (
    usuario_id,
    canal_id,
    live_id
)
SELECT
    (random() * 99 + 1)::INT,
    ((gs - 1) % 100) + 1,
    (random() * 199 + 1)::INT
FROM generate_series(1,500) gs;

-- =========================================================
-- CHAT LIVE (3000 MENSAJES)
-- =========================================================

INSERT INTO chat_live (
    live_id,
    usuario_id,
    mensaje,
    enviado_en
)
SELECT
    (random() * 199 + 1)::INT,
    (random() * 99 + 1)::INT,
    CASE
        WHEN gs % 8 = 0 THEN 'jajajaja'
        WHEN gs % 8 = 1 THEN 'buen stream'
        WHEN gs % 8 = 2 THEN 'saludos desde España'
        WHEN gs % 8 = 3 THEN 'epico gameplay'
        WHEN gs % 8 = 4 THEN 'que buena calidad'
        WHEN gs % 8 = 5 THEN 'primero'
        WHEN gs % 8 = 6 THEN 'dale una mas'
        ELSE 'increible directo'
    END,
    TIMESTAMP '2025-02-01 15:00:00'
        + (gs || ' seconds')::interval
FROM generate_series(1,3000) gs;

-- =========================================================
-- CHAT PRIVADO (1500 MENSAJES)
-- =========================================================

INSERT INTO chat_privado (
    remitente_id,
    destinatario_id,
    contenido_texto,
    leido,
    enviado_en
)
SELECT
    (random() * 99 + 1)::INT,
    (random() * 99 + 1)::INT,
    CASE
        WHEN gs % 6 = 0 THEN 'hola como estas'
        WHEN gs % 6 = 1 THEN 'vamos a jugar luego'
        WHEN gs % 6 = 2 THEN 'viste el ultimo stream'
        WHEN gs % 6 = 3 THEN 'te mande invitacion'
        WHEN gs % 6 = 4 THEN 'gracias por seguirme'
        ELSE 'nos vemos mañana'
    END,
    (gs % 2 = 0),
    TIMESTAMP '2025-03-01 10:00:00'
        + (gs || ' minutes')::interval
FROM generate_series(1,1500) gs;

-- =========================================================
-- COLECCION (800)
-- =========================================================

INSERT INTO coleccion (
    usuario_id,
    producto_id
)
SELECT DISTINCT
    (random() * 99 + 1)::INT,
    (random() * 59 + 1)::INT
FROM generate_series(1,1200)
ON CONFLICT DO NOTHING;

-- =========================================================
-- BLOQUEADOS (150)
-- =========================================================

INSERT INTO bloqueados (
    usuario_id,
    usuario_bloqueado_id
)
SELECT DISTINCT
    (random() * 99 + 1)::INT,
    (random() * 99 + 1)::INT
FROM generate_series(1,300)
WHERE random() > 0.3;

-- =========================================================
-- NOTIFICACIONES (1000)
-- =========================================================

INSERT INTO notificacion (
    usuario_id,
    titulo,
    mensaje,
    tipo,
    creado_en
)
SELECT
    (random() * 99 + 1)::INT,
    CASE
        WHEN gs % 4 = 0 THEN 'Nuevo seguidor'
        WHEN gs % 4 = 1 THEN 'Live iniciado'
        WHEN gs % 4 = 2 THEN 'Nuevo mensaje'
        ELSE 'Sistema'
    END,
    CASE
        WHEN gs % 4 = 0 THEN 'Alguien comenzó a seguir tu canal.'
        WHEN gs % 4 = 1 THEN 'Tu streamer favorito está en vivo.'
        WHEN gs % 4 = 2 THEN 'Tienes mensajes sin leer.'
        ELSE 'Actualización importante del sistema.'
    END,
    CASE
        WHEN gs % 4 = 0 THEN 'nuevo_seguidor'::tipo_notificacion
        WHEN gs % 4 = 1 THEN 'live_en_vivo'::tipo_notificacion
        WHEN gs % 4 = 2 THEN 'mensajes_nuevos'::tipo_notificacion
        ELSE 'sistema'::tipo_notificacion
    END,
    TIMESTAMP '2025-04-01 00:00:00'
        + (gs || ' minutes')::interval
FROM generate_series(1,1000) gs;

-- =========================================================
-- REPORTES (300)
-- =========================================================

INSERT INTO reportes (
    denunciante_id,
    denunciado_id,
    motivo,
    estado,
    creado_en
)
SELECT
    (random() * 99 + 1)::INT,
    (random() * 99 + 1)::INT,
    CASE
        WHEN gs % 5 = 0 THEN 'Spam en el chat'
        WHEN gs % 5 = 1 THEN 'Lenguaje ofensivo'
        WHEN gs % 5 = 2 THEN 'Contenido inapropiado'
        WHEN gs % 5 = 3 THEN 'Acoso a usuarios'
        ELSE 'Uso indebido de la plataforma'
    END,
    CASE
        WHEN gs % 3 = 0 THEN 'pendiente'::estado_reporte
        WHEN gs % 3 = 1 THEN 'revisado'::estado_reporte
        ELSE 'desestimado'::estado_reporte
    END,
    TIMESTAMP '2025-05-01 00:00:00'
        + (gs || ' hours')::interval
FROM generate_series(1,300) gs;

-- =========================================================
-- ÍNDICES PARA PRUEBAS DE RENDIMIENTO
-- =========================================================

CREATE INDEX idx_live_canal_id ON live(canal_id);
CREATE INDEX idx_chat_live_live_id ON chat_live(live_id);
CREATE INDEX idx_chat_live_usuario_id ON chat_live(usuario_id);
CREATE INDEX idx_historial_usuario_id ON historial(usuario_id);
CREATE INDEX idx_historial_live_id ON historial(live_id);
CREATE INDEX idx_seguidores_usuario_id ON seguidores(usuario_id);
CREATE INDEX idx_seguidores_canal_id ON seguidores(canal_id);
CREATE INDEX idx_notificacion_usuario_id ON notificacion(usuario_id);

-- =========================================================
-- CONSULTAS PESADAS PARA TESTING
-- =========================================================

-- Top canales con más seguidores
SELECT
    c.nombre_canal,
    COUNT(s.usuario_id) AS total_seguidores
FROM canales c
JOIN seguidores s ON c.canal_id = s.canal_id
GROUP BY c.nombre_canal
ORDER BY total_seguidores DESC
LIMIT 10;

-- Lives con más mensajes
SELECT
    l.titulo,
    COUNT(cl.mensaje_live_id) AS total_mensajes
FROM live l
JOIN chat_live cl ON l.live_id = cl.live_id
GROUP BY l.titulo
ORDER BY total_mensajes DESC
LIMIT 20;

-- Usuarios con más saldo
SELECT
    u.username,
    b.saldo_monedas
FROM usuarios u
JOIN billetera b ON u.usuario_id = b.usuario_id
ORDER BY b.saldo_monedas DESC
LIMIT 20;

-- Reportes agrupados por estado
SELECT
    estado,
    COUNT(*) AS total
FROM reportes
GROUP BY estado;

-- Usuarios más activos en chat
SELECT
    u.username,
    COUNT(cl.mensaje_live_id) AS mensajes
FROM usuarios u
JOIN chat_live cl ON u.usuario_id = cl.usuario_id
GROUP BY u.username
ORDER BY mensajes DESC
LIMIT 15;

