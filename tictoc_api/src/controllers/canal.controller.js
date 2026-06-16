const pool = require("../db");

const getCanales = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT * FROM canales ORDER BY canal_id
        `);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getCanalById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT * FROM canales WHERE canal_id = $1
        `, [id]);
        
        if (!result.rows[0]) {
            return res.status(404).json({ error: "Canal no encontrado" });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createCanal = async (req, res) => {
    try {
        const { usuario_id, nombre_canal, descripcion, logo_url, stream_key } = req.body;
        if (!usuario_id || !nombre_canal || !stream_key) {
            return res.status(400).json({ error: "usuario_id, nombre_canal y stream_key son obligatorios" });
        }
        const result = await pool.query(`
            INSERT INTO canales (usuario_id, nombre_canal, descripcion, logo_url, stream_key)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `, [usuario_id, nombre_canal, descripcion, logo_url, stream_key]);
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateCanal = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre_canal, descripcion, logo_url, stream_key } = req.body;
        
        const updates = [];
        const values = [];
        
        if (nombre_canal !== undefined) {
            updates.push(`nombre_canal = $${values.length + 1}`);
            values.push(nombre_canal);
        }
        if (descripcion !== undefined) {
            updates.push(`descripcion = $${values.length + 1}`);
            values.push(descripcion);
        }
        if (logo_url !== undefined) {
            updates.push(`logo_url = $${values.length + 1}`);
            values.push(logo_url);
        }
        if (stream_key !== undefined) {
            updates.push(`stream_key = $${values.length + 1}`);
            values.push(stream_key);
        }
        
        if (updates.length === 0) {
            return res.status(400).json({ error: "Debe enviar al menos un campo para actualizar" });
        }
        
        values.push(id);
        const result = await pool.query(`
            UPDATE canales
            SET ${updates.join(", ")}
            WHERE canal_id = $${values.length}
            RETURNING *
        `, values);
        
        if (!result.rows[0]) {
            return res.status(404).json({ error: "Canal no encontrado" });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteCanal = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            DELETE FROM canales WHERE canal_id = $1 RETURNING *
        `, [id]);
        
        if (!result.rows[0]) {
            return res.status(404).json({ error: "Canal no encontrado" });
        }
        res.json({ message: "Canal eliminado", canal: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getCanales,
    getCanalById,
    createCanal,
    updateCanal,
    deleteCanal
};
