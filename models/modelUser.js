const pool = require('../database/db');
const bcrypt = require('bcrypt');
function calcularFechaEntrega(fechaBase) {
    let diasAgregados = 0;
    let fechaEntrega = new Date(fechaBase);
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

    while (diasAgregados < 3) {
        fechaEntrega.setDate(fechaEntrega.getDate() + 1);
        const dia = fechaEntrega.getDay();
        if (dia !== 0 && dia !== 6) diasAgregados++; // Excluye sábado (6) y domingo (0)
    }
    return fechaEntrega.toISOString().split('T')[0]; // formato YYYY-MM-DD
}


const UserModel = {
    async registrarUsuario({ nombre, apellidos, email, password }) {
        const query = `
            INSERT INTO Usuarios (nombre, apellidos, email, password, estado, rol) 
            VALUES (?, ?, ?, ?, 'activo', 'usuario')
        `;
        const [result] = await pool.query(query, [nombre, apellidos, email, password]);
        return result;
    },
    async buscarPorEmail(email) {
        const query = 'SELECT * FROM Usuarios WHERE email = ?';
        const [rows] = await pool.query(query, [email]);
        return rows[0]; // Devuelve el primer usuario encontrado o undefined
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
    async agregarProducto({ nombre_producto, descripcion, precio, cantidad, imagen_url, id_categoria, vendedor }) {
        const query = `
            INSERT INTO productos (nombre_producto, descripcion, precio, cantidad, imagen_url, id_categoria, vendedor)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        await pool.query(query, [nombre_producto, descripcion, precio, cantidad, imagen_url, id_categoria, vendedor]);
    },

    // Obtener productos por id
    async obtenerProductosPorId(id_producto) {
        const query = 'SELECT * FROM productos WHERE id_producto = ?';
        const [rows] = await pool.query(query, [id_producto]);
        return rows[0];
    },

    // Actualizar los productos
    async actualizarProducto(id_producto, { nombre_producto, descripcion, precio, cantidad, imagen_url, id_categoria, vendedor }) {
        let query, params;
        if (imagen_url) {
            query = `
                UPDATE productos SET nombre_producto = ?, descripcion = ?, precio = ?, cantidad = ?, imagen_url = ?, id_categoria = ?, vendedor = ?
                WHERE id_producto = ?
            `;
            params = [nombre_producto, descripcion, precio, cantidad, imagen_url, id_categoria, vendedor, id_producto];
        } else {
            query = `
                UPDATE productos SET nombre_producto = ?, descripcion = ?, precio = ?, cantidad = ?, id_categoria = ?, vendedor = ?
                WHERE id_producto = ?
            `;
            params = [nombre_producto, descripcion, precio, cantidad, id_categoria, vendedor, id_producto];
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

    async agregarUsuario({ nombre, apellidos, email, password }) {
        const query = `
            INSERT INTO usuarios (nombre, apellidos, email, password, estado, rol)
            VALUES (?, ?, ?, ?, 'activo', 'usuario')
        `;
        await pool.query(query, [nombre, apellidos, email, password]);
    },

    async obtenerUsuarioPorId(id_usuario) {
        const query = 'SELECT * FROM usuarios WHERE id_usuario = ?';
        const [rows] = await pool.query(query, [id_usuario]);
        return rows[0];
    },

    async actualizarUsuarios(id_usuario, { nombre, apellidos, email }) {
        const query = `
            UPDATE usuarios 
            SET nombre = ?, apellidos = ?, email = ?
            WHERE id_usuario = ?
        `;
        await pool.query(query, [nombre, apellidos, email, id_usuario]);
    },

    //Listar los usuarios suspendidos
    async obtenerUsuariosPorEstado(estado) {
        const query = 'SELECT * FROM usuarios WHERE estado = ?';
        const [rows] = await pool.query(query, [estado]);
        return rows;
    },

    async cambiarEstadoUsuario(id_usuario, estado) {
        const query = 'UPDATE usuarios SET estado = ? WHERE id_usuario = ?';
        await pool.query(query, [estado, id_usuario]);
    },
    // Obtener todos los usuarios (sin filtro)
    async obtenerTodosLosUsuarios() {
        try {
            const [rows] = await pool.query('SELECT * FROM usuarios');
            return rows;
        } catch (err) {
            throw err;
        }
    },

    // Buscar usuarios por nombre o ID
    async buscarUsuarios(searchTerm) {
        try {
            const [rows] = await pool.query(
                'SELECT * FROM usuarios WHERE nombre LIKE ? OR id_usuario LIKE ?',
                [`%${searchTerm}%`, `%${searchTerm}%`]
            );
            return rows;
        } catch (err) {
            throw err;
        }
    },
    // Buscar Productos
    async buscarProductos(searchTerm) {
        try {
            const [rows] = await pool.query(
                'SELECT * FROM productos WHERE nombre_producto LIKE ? OR descripcion LIKE ?',
                [`%${searchTerm}%`, `%${searchTerm}%`]
            );
            return rows;
        } catch (error) {
            throw err;
        }
    },
    // ELiminar usuario
    async eliminarUsuario(id_usuario) {
        const query = 'DELETE FROM usuarios WHERE id_usuario = ?';
        await pool.query(query, [id_usuario]);
    },


    //Tienda
    async obtenerProductos() {
        const query = 'SELECT * FROM productos';
        const [rows] = await pool.query(query);
        // console.log("Productos desde la BD Admin", rows);
        return rows;
    },

    //Obtener pedidos
    async obtenerPedidos(idPedido) {
        const [result] = await pool.query(`
        SELECT dp.id_producto, pr.nombre_producto, pr.precio, pr.imagen_url
        FROM detalles_pedido dp
        JOIN productos pr ON dp.id_producto = pr.id_producto
        WHERE dp.id_pedido = ?
        LIMIT 1
        `, [idPedido]);

        return result[0]; // Devuelve el primer producto del pedido
    },

    //Obtener pedidos por usuarios
    async obtenerPedidosPorUsuario(id_usuario) {
        const query = `
        SELECT p.id_pedido, p.total, p.estado, p.metodo_pago, p.fecha_pedido, p.fecha_entrega_estimada,
            dp.id_producto, dp.cantidad, dp.precio_unitario,
            pr.nombre_producto, pr.imagen_url, pr.vendedor
        FROM pedidos p
        INNER JOIN detalles_pedido dp ON p.id_pedido = dp.id_pedido
        INNER JOIN productos pr ON dp.id_producto = pr.id_producto
        WHERE p.id_usuario = ?
        ORDER BY p.fecha_pedido DESC
        `;
        const [rows] = await pool.query(query, [id_usuario]);
        return rows;
    },
    // Obtener seguimiento por usuario
    async obtenerSeguimientoPorUsuario(id_usuario) {
        const query = `
        SELECT s.id_seguimiento, p.nombre_producto, s.fecha
        FROM seguimiento_productos s
        INNER JOIN productos p ON s.id_producto = p.id_producto
        WHERE s.id_usuario = ?
        ORDER BY s.fecha DESC
        `;
        const [rows] = await pool.query(query, [id_usuario]);
        return rows;
    },

    // Productos destacados
    async obtenerProductosDestacados(limit = 5) {
        const query = `
        SELECT id_producto, nombre_producto, imagen_url
        FROM productos
        ORDER BY RAND()
        LIMIT ?
        `;
        const [rows] = await pool.query(query, [limit]);
        return rows;
    },
    // Productos relacionados
    async obtenerProductosRelacionados(id_categoria, id_producto, limit = 9) {
        const query = `
        SELECT p.id_producto, p.nombre_producto, p.precio, p.imagen_url, c.nombre_categoria
        FROM productos p
        INNER JOIN categorias c ON p.id_categoria = c.id_categoria
        WHERE p.id_categoria = ? AND p.id_producto != ?
        ORDER BY RAND()
        LIMIT ?
        `;
        const [rows] = await pool.query(query, [id_categoria, id_producto, limit]);
        return rows;
    },
    async obtenerProductosConCategoria(limit = 6) {
        const query = `
        SELECT p.id_producto, p.nombre_producto, p.precio, p.imagen_url, c.nombre_categoria
        FROM productos p
        INNER JOIN categorias c ON p.id_categoria = c.id_categoria
        ORDER BY RAND()
        LIMIT ?
        `;
        const [rows] = await pool.query(query, [limit]);
        return rows;
    },

    async generarNumeroSeguimiento() {
        const [result] = await pool.query('SELECT COUNT(*) AS total FROM pedidos');
        const total = result[0].total + 1;
        const numero = total.toString().padStart(2, '0'); // S01, S02...
        return `S${numero}`;
    },

    // finalizar compra
    async finalizarCompra(usuarioId, carrito) {
        const total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

        // Crear pedido
        const numero_seguimiento = await this.generarNumeroSeguimiento();

        const [pedidoResult] = await pool.query(
            `INSERT INTO pedidos (id_usuario, total, metodo_pago, estado, numero_seguimiento) 
            VALUES (?, ?, ?, 'pendiente', ?)`,
            [usuarioId, total, 'PayPal', numero_seguimiento]
        );

        const idPedido = pedidoResult.insertId;

        const fechaEntregaEstimada = calcularFechaEntrega(new Date());
        await pool.query(
            'UPDATE pedidos SET fecha_entrega_estimada = ? WHERE id_pedido = ?',
            [fechaEntregaEstimada, idPedido]
        );


        for (const item of carrito) {
            // Verificar stock
            const [producto] = await pool.query(
                'SELECT cantidad FROM productos WHERE id_producto = ?',
                [item.id_producto]
            );
            if (!producto.length || producto[0].cantidad < item.cantidad) {
                throw new Error(`Stock insuficiente para ${item.nombre_producto}`);
            }

            // Descontar stock
            await pool.query(
                'UPDATE productos SET cantidad = cantidad - ? WHERE id_producto = ?',
                [item.cantidad, item.id_producto]
            );

            // Insertar detalle del pedido
            await pool.query(
                'INSERT INTO detalles_pedido (id_pedido, id_producto, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
                [idPedido, item.id_producto, item.cantidad, item.precio]
            );

            // Registrar ventas
            await pool.query(
                'INSERT INTO ventas (id_usuario, id_producto, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
                [usuarioId, item.id_producto, item.cantidad, item.precio]
            );

            // Registrar seguimiento
            await pool.query(
                'INSERT INTO seguimiento_productos (id_usuario, id_producto) VALUES (?, ?)',
                [usuarioId, item.id_producto]
            );
        }

        return idPedido;
    },
    // Agregar direccion
    async agregarDireccion(id_usuario, datos) {
        const { telefono, direccion, ciudad, municipio, estado2, codigo_postal } = datos;
        await pool.query(
            `INSERT INTO direcciones (id_usuario, telefono, direccion, ciudad, municipio, estado2, codigo_postal)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [id_usuario, telefono, direccion, ciudad, municipio, estado2, codigo_postal]
        );
    },

    async obtenerDirecciones(id_usuario) {
        const [rows] = await pool.query(
            `SELECT * FROM direcciones WHERE id_usuario = ?`,
            [id_usuario]
        );
        return rows;
    },

    async obtenerDireccionPorId(id_direccion) {
        const [rows] = await pool.query(
            `SELECT * FROM direcciones WHERE id_direccion = ?`,
            [id_direccion]
        );
        return rows[0];
    },

    async actualizarDireccionPorId(id_direccion, datos) {
        const { telefono, direccion, ciudad, municipio, estado2, codigo_postal } = datos;
        await pool.query(
            `UPDATE direcciones SET telefono = ?, direccion = ?, ciudad = ?, municipio = ?, estado2 = ?, codigo_postal = ?
            WHERE id_direccion = ?`,
            [telefono, direccion, ciudad, municipio, estado2, codigo_postal, id_direccion]
        );
    },

    //Detalles de la compra
    async obtenerResumenCompra(id_pedido) {
        const [pedido] = await pool.query(
            `SELECT p.*, u.nombre, u.apellidos, d.telefono, d.direccion, d.ciudad, d.municipio, d.estado2, d.codigo_postal
            FROM pedidos p
            JOIN usuarios u ON p.id_usuario = u.id_usuario
            LEFT JOIN direcciones d ON d.id_usuario = u.id_usuario
            WHERE p.id_pedido = ?`,
            [id_pedido]
        );

        const [productos] = await pool.query(
            `SELECT dp.*, pr.nombre_producto, pr.imagen_url, pr.id_vendedor
            FROM detalles_pedido dp
            JOIN productos pr ON dp.id_producto = pr.id_producto
            WHERE dp.id_pedido = ?`,
            [id_pedido]
        );
        return { pedido: pedido[0], productos };
    },

    // Historial de ventas por parte del admin
    async obtenerHistorialVentas(filtro) {
        let condicionFecha = '';
        const filtrosValidos = ['dia', 'semana', 'mes', 'anio'];

        if (filtrosValidos.includes(filtro)) {
            switch (filtro) {
                case 'dia':
                    condicionFecha = "WHERE DATE(p.fecha_pedido) = CURDATE()";
                    break;
                case 'semana':
                    condicionFecha = "WHERE YEARWEEK(p.fecha_pedido, 1) = YEARWEEK(CURDATE(), 1)";
                    break;
                case 'mes':
                    condicionFecha = "WHERE MONTH(p.fecha_pedido) = MONTH(CURDATE()) AND YEAR(p.fecha_pedido) = YEAR(CURDATE())";
                    break;
                case 'anio':
                    condicionFecha = "WHERE YEAR(p.fecha_pedido) = YEAR(CURDATE())";
            }
        }

        const query = `
        SELECT 
            p.id_pedido, p.fecha_pedido, p.estado, p.numero_seguimiento, p.metodo_pago,
            u.nombre AS nombre_usuario, u.email,
            pr.nombre_producto, pr.vendedor,
            dp.cantidad, dp.precio_unitario,
            (dp.cantidad * dp.precio_unitario) AS subtotal
        FROM pedidos p
        JOIN detalles_pedido dp ON p.id_pedido = dp.id_pedido
        JOIN productos pr ON dp.id_producto = pr.id_producto
        JOIN usuarios u ON p.id_usuario = u.id_usuario
        ${condicionFecha}
        ORDER BY p.fecha_pedido DESC
        `;
        const [rows] = await pool.query(query);
        // console.log('Consulta ejecutada correctamente');
        // console.log('Filas obtenidas:', rows);
        return rows;
    },

    // 🛒 Agregar producto al carrito móvil
    async agregarProductoAlCarritoMovil(id_usuario, producto) {
        const [existente] = await pool.query(
            'SELECT cantidad FROM carrito_movil WHERE id_usuario = ? AND id_producto = ?',
            [id_usuario, producto.id_producto]
        );

        if (existente.length > 0) {
            await pool.query(
                'UPDATE carrito_movil SET cantidad = cantidad + 1 WHERE id_usuario = ? AND id_producto = ?',
                [id_usuario, producto.id_producto]
            );
        } else {
            await pool.query(
                `INSERT INTO carrito_movil (id_usuario, id_producto, nombre_producto, precio, imagen_url, cantidad)
        VALUES (?, ?, ?, ?, ?, 1)`,
                [id_usuario, producto.id_producto, producto.nombre_producto, producto.precio, producto.imagen_url]
            );
        }
    },

    // 🗑️ Eliminar producto del carrito móvil
    async eliminarProductoDelCarritoMovil(id_usuario, id_producto) {
        await pool.query(
            'DELETE FROM carrito_movil WHERE id_usuario = ? AND id_producto = ?',
            [id_usuario, id_producto]
        );
    },
    //Vaciar el carrito
    async vaciarCarritoMovil(id_usuario) {
        return pool.query('DELETE FROM carrito_movil WHERE id_usuario = ?', [id_usuario]);
    },


    // 📦 Obtener carrito por usuario
    async obtenerCarritoMovil(id_usuario) {
        const [carrito] = await pool.query(
            'SELECT id_producto, nombre_producto, precio, imagen_url, cantidad FROM carrito_movil WHERE id_usuario = ?',
            [id_usuario]
        );
        return carrito;
    }



};



module.exports = UserModel;
