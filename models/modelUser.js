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
    },

    // -----CRUD ADMIN ---------
    //Obtener Por categoria
    async obtenerCategorias() {
        const query = 'SELECT id_categoria, nombre_categoria FROM categorias';
        const [rows] = await pool.query(query);
        return rows;
    },

    //Agregar productos
    async agregarProducto({ nombre_producto, descripcion, precio, cantidad, imagen_url, id_categoria }) {
        const query = `
            INSERT INTO productos (nombre_producto, descripcion, precio, cantidad, imagen_url, id_categoria)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        await pool.query(query, [nombre_producto, descripcion, precio, cantidad, imagen_url, id_categoria]);
    },

    // Obtener productos por id
    async obtenerProductosPorId(id_producto) {
        const query = 'SELECT * FROM productos WHERE id_producto = ?';
        const [rows] = await pool.query(query, [id_producto]);
        return rows[0];
    },

    // Actualizar los productos
    async actualizarProducto(id_producto, { nombre_producto, descripcion, precio, cantidad, imagen_url, id_categoria }) {
        let query, params;
        if (imagen_url) {
            query = `
                UPDATE productos SET nombre_producto = ?, descripcion = ?, precio = ?, cantidad = ?, imagen_url = ?, id_categoria = ?
                WHERE id_producto = ?
            `;
            params = [nombre_producto, descripcion, precio, cantidad, imagen_url, id_categoria, id_producto];
        } else {
            query = `
                UPDATE productos SET nombre_producto = ?, descripcion = ?, precio = ?, cantidad = ?, id_categoria = ?
                WHERE id_producto = ?
            `;
            params = [nombre_producto, descripcion, precio, cantidad, id_categoria, id_producto];
        }
        await pool.query(query, params);
    },

    // ELiminar productos
    async eliminarProducto(id_producto) {
        const query = 'DELETE FROM productos WHERE id_producto = ?';
        await pool.query(query, [id_producto]);
    },

    async obtenerUsuarios() {
        const query = 'SELECT * FROM usuarios';
        const [rows] = await pool.query(query);
        return rows;
    },

    async agregarUsuario({ nombre, apellidos, email, password, telefono, rol }) {
        const query = `
            INSERT INTO usuarios (nombre, apellidos, email, password, telefono, estado, rol)
            VALUES (?, ?, ?, ?, ?, 'activo', ?)
        `;
        await pool.query(query, [nombre, apellidos, email, password, telefono, rol]);
    },

    async obtenerUsuarioPorId( id_usuario ) {
        const query = 'SELECT * FROM usuarios WHERE id_usuario = ?';
        const [rows] = await pool.query(query, [ id_usuario ]);
        return rows[0];
    },

    async actualizarUsuarios(id_usuario,  { nombre, apellidos, email,  telefono, rol }){
        const query = `
            UPDATE usuarios 
            SET nombre = ?, apellidos = ?, email = ?, telefono = ?, rol = ?
            WHERE id_usuario = ?
        `;
        await pool.query( query, [nombre, apellidos, email, telefono, rol, id_usuario]);
    },

    //Listar los usuarios suspendidos
    async obtenerUsuariosPorEstado( estado ) {
        const query = 'SELECT * FROM usuarios WHERE estado = ?';
        const [rows] = await pool.query( query, [ estado ]);
        return rows;
    },

    async cambiarEstadoUsuario(id_usuario, estado) {
        const query = 'UPDATE usuarios SET estado = ? WHERE id_usuario = ?';
        await pool.query( query, [estado, id_usuario]);
    }

};

module.exports = UserModel;
