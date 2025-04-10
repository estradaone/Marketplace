const pool = require('../database/db');
const bcrypt = require('bcrypt');

const UserModel = {
    async registrarUsuario({ nombre, apellidos, email, password, telefono, rol }) {
        const query = `
            INSERT INTO Usuarios (nombre, apellidos, email, password, telefono, estado, rol) 
            VALUES (?, ?, ?, ?, ?, 'activo', ?)
        `;
        const [result] = await pool.query(query, [nombre, apellidos, email, password, telefono, rol]);
        return result;
    },

    async authenticateUser(email, password = null) {
        const query = 'SELECT * FROM usuarios WHERE email = ?';
        const [rows] = await pool.query(query, [email]);
    
        if (rows.length > 0) {
            const user = rows[0];
            if (password) { // Solo comparar contraseñas si se proporciona
                const isMatch = await bcrypt.compare(password, user.password);
                if (isMatch) {
                    return user; // Retorna el usuario si la contraseña coincide
                }
            } else {
                return user; // Retorna el usuario si no se necesita comparación
            }
        }

        return null; // Retorna null si el usuario no existe o la contraseña no coincide
    },

    async getProductsByCategory(categoryName) {
        const query = 'SELECT p.* FROM productos p INNER JOIN categorias c ON p.id_categoria = c.id_categoria WHERE c.nombre_categoria = ?';
        const [rows] = await pool.query(query, [categoryName]);
        return rows;
    },

    async setResetToken(email, token, expiration) {
        const query = 'UPDATE usuarios SET reset_token = ?, token_expiration = ? WHERE email = ?';
        console.log('Guardando token:', { email, token, expiration }); // Depuración
        // Corregido el llamado a pool.query
        await pool.query(query, [token, expiration, email]);
    },

    async verifyResetToken(token) {
        const query = 'SELECT * FROM usuarios WHERE reset_token = ? AND token_expiration > NOW()';
        const [rows] = await pool.query(query, [token]);
        return rows[0]; // Retorna el usuario si el token es válido
    },

    async updatePassword(id, newPassword) {
        const query = 'UPDATE usuarios SET password = ?, reset_token = NULL, token_expiration = NULL WHERE id_usuario = ?';
        await pool.query(query, [newPassword, id]);
    }
};

module.exports = UserModel;
