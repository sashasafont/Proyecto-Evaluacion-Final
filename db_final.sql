-- 1. TIPOS ENUM (Se crean solo si no existen para evitar errores)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estado_live') THEN
        CREATE TYPE estado_live AS ENUM ('en_vivo', 'finalizado');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_producto') THEN
        CREATE TYPE tipo_producto AS ENUM ('emote', 'badge', 'sticker');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_notificacion') THEN
        CREATE TYPE tipo_notificacion AS ENUM ('live_en_vivo', 'nuevo_seguidor', 'sistema', 'mensajes_nuevos');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estado_reporte') THEN
        CREATE TYPE estado_reporte AS ENUM ('pendiente', 'revisado', 'desestimado');
    END IF;
END $$;

-- 1. TABLA USUARIOS
CREATE TABLE IF NOT EXISTS usuarios (
    usuario_id SERIAL PRIMARY KEY,
    username VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(255),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. CANALES
CREATE TABLE IF NOT EXISTS canales (
    canal_id SERIAL PRIMARY KEY,
    usuario_id INT UNIQUE NOT NULL,
    nombre_canal VARCHAR(100) NOT NULL,
    descripcion TEXT,
    logo_url VARCHAR(255),
    stream_key VARCHAR(100) UNIQUE NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(usuario_id) ON DELETE CASCADE
);

-- 3. LIVE
CREATE TABLE IF NOT EXISTS live (
    live_id SERIAL PRIMARY KEY,
    canal_id INT NOT NULL,
    titulo VARCHAR(100) NOT NULL,
    contenido TEXT,
    descripcion TEXT,
    inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fin TIMESTAMP NULL,
    estado estado_live DEFAULT 'en_vivo',
    FOREIGN KEY (canal_id) REFERENCES canales(canal_id) ON DELETE CASCADE
);

-- 4. SEGUIDORES
CREATE TABLE IF NOT EXISTS seguidores (
    seguidor_id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    canal_id INT NOT NULL,
    UNIQUE(usuario_id, canal_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(usuario_id) ON DELETE CASCADE,
    FOREIGN KEY (canal_id) REFERENCES canales(canal_id) ON DELETE CASCADE
);

-- 5. HISTORIAL
CREATE TABLE IF NOT EXISTS historial (
    historial_id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    canal_id INT NOT NULL,
    contenido TEXT NOT NULL,
    FOREIGN KEY (canal_id) REFERENCES canales(canal_id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(usuario_id) ON DELETE CASCADE
);

-- 6. CHAT LIVE
CREATE TABLE IF NOT EXISTS chat_live (
    mensaje_live_id BIGSERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(usuario_id) ON DELETE CASCADE
);

-- 7. CHAT PRIVADO
CREATE TABLE IF NOT EXISTS chat_privado (
    mensaje_privado_id BIGSERIAL PRIMARY KEY,
    remitente_id INT NOT NULL,
    destinatario_id INT NOT NULL,
    contenido_texto TEXT NOT NULL,
    leido BOOLEAN DEFAULT FALSE,
    enviado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (remitente_id) REFERENCES usuarios(usuario_id) ON DELETE CASCADE,
    FOREIGN KEY (destinatario_id) REFERENCES usuarios(usuario_id) ON DELETE CASCADE
);

-- 8. TIENDA
CREATE TABLE IF NOT EXISTS tienda (
    producto_id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio_monedas INT NOT NULL,
    imagen_url VARCHAR(255) NOT NULL,
    tipo tipo_producto NOT NULL
);

-- 9. COLECCIÓN
CREATE TABLE IF NOT EXISTS coleccion (
    coleccion_id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    producto_id INT NOT NULL,
    UNIQUE(usuario_id, producto_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(usuario_id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES tienda(producto_id) ON DELETE CASCADE
);

-- 10. BLOQUEADOS
CREATE TABLE IF NOT EXISTS bloqueados (
    bloqueo_id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    usuario_bloqueado_id INT NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(usuario_id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_bloqueado_id) REFERENCES usuarios(usuario_id) ON DELETE CASCADE
);

-- 11. NOTIFICACIÓN
CREATE TABLE IF NOT EXISTS notificacion (
    notificacion_id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    titulo VARCHAR(100) NOT NULL,
    mensaje VARCHAR(255) NOT NULL,
    tipo tipo_notificacion NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(usuario_id) ON DELETE CASCADE
);

-- 12. BILLETERA
CREATE TABLE IF NOT EXISTS billetera (
    billetera_id SERIAL PRIMARY KEY,
    usuario_id INT UNIQUE NOT NULL,
    saldo_monedas INT DEFAULT 0,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(usuario_id) ON DELETE CASCADE
);

-- 13. REPORTES
CREATE TABLE IF NOT EXISTS reportes (
    reporte_id SERIAL PRIMARY KEY,
    denunciante_id INT NOT NULL,
    denunciado_id INT NOT NULL,
    motivo VARCHAR(500) NOT NULL,
    estado estado_reporte DEFAULT 'pendiente',
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (denunciante_id) REFERENCES usuarios(usuario_id) ON DELETE CASCADE,
    FOREIGN KEY (denunciado_id) REFERENCES usuarios(usuario_id) ON DELETE CASCADE
);