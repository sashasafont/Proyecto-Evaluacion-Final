const pool = require("../db");

const getUsuarios = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT usuario_id, username, email, creado_en 
            FROM usuarios 
            ORDER BY usuario_id
        `);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getUsuarioById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT usuario_id, username, email, avatar_url, creado_en 
            FROM usuarios 
            WHERE usuario_id = $1
        `, [id]);
        
        if (!result.rows[0]) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createUsuario = async (req, res) => {
    try {
        const { username, email, password_hash, avatar_url } = req.body;
        if (!username || !email || !password_hash) {
            return res.status(400).json({ error: "username, email y password_hash son obligatorios" });
        }
        const result = await pool.query(`
            INSERT INTO usuarios (username, email, password_hash, avatar_url)
            VALUES ($1, $2, $3, $4)
            RETURNING usuario_id, username, email, avatar_url, creado_en
        `, [username, email, password_hash, avatar_url]);
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, email, password_hash, avatar_url } = req.body;
        
        const updates = [];
        const values = [];
        
        if (username !== undefined) {
            updates.push(`username = $${values.length + 1}`);
            values.push(username);
        }
        if (email !== undefined) {
            updates.push(`email = $${values.length + 1}`);
            values.push(email);
        }
        if (password_hash !== undefined) {
            updates.push(`password_hash = $${values.length + 1}`);
            values.push(password_hash);
        }
        if (avatar_url !== undefined) {
            updates.push(`avatar_url = $${values.length + 1}`);
            values.push(avatar_url);
        }
        
        if (updates.length === 0) {
            return res.status(400).json({ error: "Debe enviar al menos un campo para actualizar" });
        }
        
        values.push(id);
        const result = await pool.query(`
            UPDATE usuarios
            SET ${updates.join(", ")}
            WHERE usuario_id = $${values.length}
            RETURNING usuario_id, username, email, avatar_url, creado_en
        `, values);
        
        if (!result.rows[0]) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            DELETE FROM usuarios 
            WHERE usuario_id = $1 
            RETURNING usuario_id, username
        `, [id]);
        
        if (!result.rows[0]) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }
        res.json({ message: "Usuario eliminado", usuario: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getUsuarios,
    getUsuarioById,
    createUsuario,
    updateUsuario,
    deleteUsuario
};
