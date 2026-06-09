const pool = require("../db");

const getLives = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT * FROM live ORDER BY live_id DESC
        `);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getLiveById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT * FROM live WHERE live_id = $1
        `, [id]);
        
        if (!result.rows[0]) {
            return res.status(404).json({ error: "Live no encontrado" });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createLive = async (req, res) => {
    try {
        const { canal_id, titulo, contenido, descripcion, fin, estado } = req.body;
        if (!canal_id || !titulo) {
            return res.status(400).json({ error: "canal_id y titulo son obligatorios" });
        }
        const result = await pool.query(`
            INSERT INTO live (canal_id, titulo, contenido, descripcion, fin, estado)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `, [canal_id, titulo, contenido, descripcion, fin, estado || 'en_vivo']);
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateLive = async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, contenido, descripcion, fin, estado } = req.body;
        
        const updates = [];
        const values = [];
        
        if (titulo !== undefined) {
            updates.push(`titulo = $${values.length + 1}`);
            values.push(titulo);
        }
        if (contenido !== undefined) {
            updates.push(`contenido = $${values.length + 1}`);
            values.push(contenido);
        }
        if (descripcion !== undefined) {
            updates.push(`descripcion = $${values.length + 1}`);
            values.push(descripcion);
        }
        if (fin !== undefined) {
            updates.push(`fin = $${values.length + 1}`);
            values.push(fin);
        }
        if (estado !== undefined) {
            updates.push(`estado = $${values.length + 1}`);
            values.push(estado);
        }
        
        if (updates.length === 0) {
            return res.status(400).json({ error: "Debe enviar al menos un campo para actualizar" });
        }
        
        values.push(id);
        const result = await pool.query(`
            UPDATE live
            SET ${updates.join(", ")}
            WHERE live_id = $${values.length}
            RETURNING *
        `, values);
        
        if (!result.rows[0]) {
            return res.status(404).json({ error: "Live no encontrado" });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteLive = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            DELETE FROM live WHERE live_id = $1 RETURNING *
        `, [id]);
        
        if (!result.rows[0]) {
            return res.status(404).json({ error: "Live no encontrado" });
        }
        res.json({ message: "Live eliminado", live: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getLives,
    getLiveById,
    createLive,
    updateLive,
    deleteLive
};
