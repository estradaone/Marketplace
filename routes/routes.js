const express = require('express');
const router = express.Router();
const UserController = require('../controllers/controllerUser');
const UserModel = require('../models/modelUser');

// Ruta para registrar un usuario
router.post('/registrar', UserController.registrarUsuario);
router.get('/usuariosExistentes', UserController.listarUsuariosActivos);

router.get('/loggin', UserController.showLogginPage);
router.post('/loggin', UserController.authenticateUser);
// Ruta para la página del registro
router.get('/registro', (req, res) => {
    res.render('registro.ejs');
});

// Config de tienda admin


// Config de tienda usuarios
router.get('/usuarios/tienda', (req, res) => {
    res.render('usuarios/tienda');
});

// Ruta de los productos de la tienda
router.get('/tienda', UserController.mostrarTiendaUsuario);
router.get('/admin/tienda', UserController.mostrarTiendaAdministrador);


// Ruta para cerrar sesión
router.get('/logout', UserController.logout);

//Ruta para obtener productos de la categoria de accesorios
router.get('/admin/categorias/accesorios', UserController.getAccesorios);
router.get('/usuarios/categorias/accesorios', UserController.getAccesorios);

router.get('/admin/categorias/bolsos', UserController.getBolsos);
router.get('/usuarios/categorias/bolsos', UserController.getBolsos);

router.get('/admin/categorias/sombreros', UserController.getSombreros);
router.get('/usuarios/categorias/sombreros', UserController.getSombreros);

router.get('/admin/categorias/blusas', UserController.getBlusas);
router.get('/usuarios/categorias/blusas', UserController.getBlusas);

router.get('/admin/categorias/peluches', UserController.getPeluches);
router.get('/usuarios/categorias/peluches', UserController.getPeluches);

router.get('/admin/categorias/llaveros', UserController.getLlaveros);
router.get('/usuarios/categorias/llaveros', UserController.getLlaveros);


// Ruta para mostrar la página de recuperación de contraseña
router.get('/forgot-password', (req, res) => {
    res.render('forgot-password');
});

// Ruta para manejar la solicitud de envío del token
router.post('/forgot-password', UserController.sendResetToken);

// Ruta para mostrar la página para restablecer la contraseña
router.get('/reset-password/:token', (req, res) => {
    const { token } = req.params;
    res.render('reset-password', { token });
});

// Ruta para manejar el restablecimiento de contraseña
router.post('/reset-password', UserController.resetPassword);

// Rutas del CRUD de Productos ( SOLO ADMIN)
router.get('/admin/productos/agregar', UserController.mostrarFormularioAgregar);
router.post('/admin/productos/agregar', UserController.upload.single('imagen'), UserController.agregarProducto);
router.get('/admin/productos/editar/:id_producto', UserController.obtenerProductos);
router.post('/admin/productos/editar/:id_producto', UserController.upload.single('imagen'), UserController.actualizarProductos);
router.get('/admin/productos/eliminar/:id_producto', UserController.eliminarProducto);

// Ruta del CRUD de Usuarios (ADMIN)
router.get('/admin/usuarios', UserController.listarUsuarios);
router.get('/admin/usuarios/agregar', UserController.mostrarFormularioAgregarUsuario);
router.post('/admin/usuarios/agregar', UserController.agregarUsuario);
router.get('/admin/usuarios/editar/:id_usuario', UserController.obtenerUsuarioParaEditar);
router.put('/admin/usuarios/editar/:id_usuario', UserController.actualizarUsuario);
router.get('/admin/usuarios/suspendidos', UserController.listarUsuariosSuspendidos);
router.post('/admin/usuarios/suspender/:id_usuario', UserController.suspenderUsuario);
router.post('/admin/usuarios/activar/:id_usuario', UserController.activarUsuario);
router.delete('/admin/usuarios/eliminar/:id_usuario', UserController.eliminarUsuario);
//Perfil usuario
router.get('/perfil', UserController.verPerfilUsuario);
router.post('/actualizar-perfil', UserController.actualizarPerfilUsuario);
//Perfil admin
router.get('/admin/perfil', UserController.verPerfilAdmin);
router.post('/admin/actualizar-perfil', UserController.actualizarPerfilAdmin);
//Ruta del historial admin
router.get('/admin/historialVentas', UserController.verHistorialVentas);


//Rutas del seguimiento de productos
router.get('/pedidos', UserController.mostrarPedidos);
router.get('/seguimiento', UserController.mostrarSeguimiento)

//Ruta detalleProducto
router.get('/producto/:id_producto', UserController.verDetalleProducto);

router.get('/api/verificar-sesion', (req, res) => {
    if (req.session.user) {
        res.json({ autenticado: true });
    } else {
        res.json({ autenticado: false });
    }
});

router.post('/api/carrito/agregar', (req, res) => {
    const { idProducto, nombre, precio, imagen_url } = req.body;

    if (!idProducto || !nombre || !precio || !imagen_url) {
        return res.status(400).json({ success: false, message: "Datos faltantes en la solicitud." });
    }

    req.session.carrito = req.session.carrito || [];
    const productoExistente = req.session.carrito.find(p => p.id_producto === idProducto);

    if (productoExistente) {
        productoExistente.cantidad += 1;
    } else {
        req.session.carrito.push({ id_producto: idProducto, nombre_producto: nombre, precio, imagen_url, cantidad: 1 });
    }

    res.json({ success: true });
});

router.post('/api/carrito/eliminar', (req, res) => {
    const { idProducto } = req.body;

    req.session.carrito = req.session.carrito || [];
    req.session.carrito = req.session.carrito.filter(p => p.id_producto !== idProducto);

    res.json({ success: true });
});

router.get('/carrito', (req, res) => {
    const carrito = req.session.carrito || [];
    res.render('carrito', { carrito });
});

//Pagar PayPal
router.get('/pagar', (req, res) => {
    const carrito = req.session.carrito || [];
    res.render('pagar', { carrito });
});
// Confirmacion Paypal
router.get('/confirmacion', (req, res) => {
    res.render('confirmacion');
});

router.post('/api/finalizar-compra', async (req, res) => {
    const carrito = req.session.carrito || [];
    const usuario = req.session.user;

    if (!usuario || carrito.length === 0) {
        return res.status(400).json({ success: false, message: "Sesión inválida o carrito vacío." });
    }
    try {
        await UserModel.finalizarCompra(usuario.id_usuario, carrito);
        req.session.carrito = [];
        res.json({ success: true });
    } catch (error) {
        console.error("Error al finalizar compra:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }

});

router.get('/api/carrito/count', (req, res) => {
    if (req.session.user && req.session.carrito) {
        const total = req.session.carrito.reduce((acc, p) => acc + p.cantidad, 0);
        res.json({ count: total });
    } else {
        res.json({ count: 0 });
    }
});

//Ruta para posman 
router.get('/api/producto/:id_producto', async (req, res) => {
    try {
        const { id_producto } = req.params;
        const producto = await UserModel.obtenerProductosPorId(id_producto);
        if (!producto) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json(producto);
    } catch (error) {
        console.error('Error al obtener el producto:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

//Busqueda de usuarios
router.get('/buscarUsuarios', UserController.buscarUsuarios);
//Busqueda tiempo real
router.get('/buscar-usuarios', UserController.buscarUsuariosTiempoReal);
// Búsqueda tradicional (renderiza vista)
router.get('/buscar-productos', UserController.buscarProductos);
// Búsqueda en tiempo real (responde JSON)
router.get('/buscar-productos-tiempo-real', UserController.buscarProductosTiempoReal);
//Ruta de direccion del cliente
router.get('/nueva-direccion', UserController.mostrarFormularioNuevaDireccion);
router.post('/nueva-direccion', UserController.guardarNuevaDireccion);
router.get('/direcciones', UserController.mostrarTodasLasDirecciones);
router.get('/editar-direccion/:id', UserController.mostrarFormularioEditarDireccion);
router.post('/editar-direccion/:id', UserController.actualizarDireccion);

// Ruta del detalle de la compra
router.get('/ver-compra/:id', UserController.verCompra);

//Ruta de enviar formulario de ayuda
router.post('/enviar-mensaje', UserController.enviarMensaje);

//Ruta de reordenar
router.get('/reordenar/:id_pedido', UserController.reordenarPedido);

//Ruta del editar el seguimiento del estado
router.get('/admin/editarPedido/:id', UserController.formEditarPedido);
router.post('/admin/editarPedido/:id', UserController.actualizarPedido);

router.post('/cancelar-pedido/:id', UserController.cancelarPedido);
router.get('/rembolso/:id', UserController.verReembolso);


//Ruta para generar PDF
router.get('/admin/historialVentas/pdf', UserController.generarPDFVentas);

module.exports = router;
// Rutas para la navegacion de categorias

