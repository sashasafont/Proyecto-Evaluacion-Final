const pool = require("../db");

// 1. Queremos ver que usuarios tengo bloqueados.
const getBloqueadosByUsuarioId = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT 
                b.usuario_bloqueado_id,
                u.username AS nombre_usuario_bloqueado
            FROM bloqueados b
            INNER JOIN usuarios u ON b.usuario_bloqueado_id = u.usuario_id
            WHERE b.usuario_id = $1
        `, [id]);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 2. Comprobar cuantos seguidores tiene un canal
const getSeguidoresCountByCanalUsuarioId = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT 
                c.usuario_id,
                c.nombre_canal,
                COUNT(s.seguidor_id) AS total_seguidores
            FROM canales c
            LEFT JOIN seguidores s ON c.canal_id = s.canal_id
            WHERE c.usuario_id = $1
            GROUP BY c.usuario_id, c.nombre_canal
        `, [id]);
        if (!result.rows[0]) {
            return res.status(404).json({ error: "Canal no encontrado para el usuario especificado" });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 3. Comprobar el saldo en la billetera
const getBilleteraByUsuarioId = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT 
                u.username,
                b.saldo_monedas
            FROM billetera b
            INNER JOIN usuarios u ON b.usuario_id = u.usuario_id
            WHERE b.usuario_id = $1
        `, [id]);
        if (!result.rows[0]) {
            return res.status(404).json({ error: "Billetera no encontrada para el usuario especificado" });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 4. Comprobar los items que tienes comprados
const getColeccionByUsuarioId = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT 
                t.producto_id,
                t.nombre,
                t.descripcion,
                t.precio_monedas,
                t.tipo
            FROM coleccion c
            INNER JOIN tienda t ON c.producto_id = t.producto_id
            WHERE c.usuario_id = $1
        `, [id]);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 5. Consultar tus chats privados (Hora del mensaje, verificar que ha recibido el mensaje)
const getChatsPrivadosByUsuarioId = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT 
                cp.mensaje_privado_id,
                ur.username AS remitente,
                ud.username AS destinatario,
                cp.contenido_texto,
                cp.enviado_en AS hora_mensaje,
                cp.leido AS recibido
            FROM chat_privado cp
            INNER JOIN usuarios ur ON cp.remitente_id = ur.usuario_id
            INNER JOIN usuarios ud ON cp.destinatario_id = ud.usuario_id
            WHERE cp.remitente_id = $1 OR cp.destinatario_id = $1
            ORDER BY cp.enviado_en ASC
        `, [id]);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 6. Consultar que usuario mandó el mensaje al chat live
const getUsuarioByMensajeLiveId = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT 
                u.usuario_id,
                u.username,
                u.avatar_url
            FROM chat_live c
            INNER JOIN usuarios u ON c.usuario_id = u.usuario_id
            WHERE c.mensaje_live_id = $1
        `, [id]);
        if (!result.rows[0]) {
            return res.status(404).json({ error: "Mensaje de chat en vivo no encontrado" });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 7. Comprobar si estás en live o no (cuando le das a prender live o le das a cerrar)
const getLiveStatusByCanalId = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT 
                live_id,
                titulo,
                estado,
                inicio,
                fin
            FROM live
            WHERE canal_id = $1
            ORDER BY inicio DESC
            LIMIT 1
        `, [id]);
        if (!result.rows[0]) {
            return res.json({ estado: "finalizado", message: "No se registran emisiones para este canal" });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 8. Consultar el tipo de contenido que esta haciendo otro usuario
const getLiveContentByLiveId = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT 
                live_id,
                titulo,
                contenido
            FROM live
            WHERE live_id = $1
        `, [id]);
        if (!result.rows[0]) {
            return res.status(404).json({ error: "Emisión en vivo no encontrada" });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 9. Verificar que las notificaciones funcionen
const getNotificacionesByUsuarioId = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT 
                notificacion_id,
                titulo,
                mensaje,
                tipo,
                creado_en
            FROM notificacion
            WHERE usuario_id = $1
            ORDER BY creado_en DESC
        `, [id]);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 10. Consultar el estado de tu reporte
const getReportesByUsuarioId = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT 
                r.reporte_id,
                u_denunciado.username AS usuario_denunciado,
                r.motivo,
                r.estado,
                r.creado_en
            FROM reportes r
            INNER JOIN usuarios u_denunciado ON r.denunciado_id = u_denunciado.usuario_id
            WHERE r.denunciante_id = $1
            ORDER BY r.creado_en DESC
        `, [id]);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getBloqueadosByUsuarioId,
    getSeguidoresCountByCanalUsuarioId,
    getBilleteraByUsuarioId,
    getColeccionByUsuarioId,
    getChatsPrivadosByUsuarioId,
    getUsuarioByMensajeLiveId,
    getLiveStatusByCanalId,
    getLiveContentByLiveId,
    getNotificacionesByUsuarioId,
    getReportesByUsuarioId
};
