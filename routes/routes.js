const express = require('express');
const router = express.Router();
const UserController = require('../controllers/controllerUser');
const ControllerUser = require('../controllers/userController');

// Ruta para registrar un usuario
router.post('/registrar', UserController.registrarUsuario);
router.get('/usuariosExistentes', ControllerUser.getUsers);
router.get('/buscarUsuarios', ControllerUser.searchUsers);

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
router.post('/admin/usuarios/editar/:id_usuario', UserController.actualizarUsuario);
router.get('/admin/usuarios/suspendidos', UserController.listarUsuariosSuspendidos);
router.post('/admin/usuarios/suspender/:id_usuario', UserController.suspenderUsuario);
router.post('/admin/usuarios/activar/:id_usuario', UserController.activarUsuario);


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


module.exports = router;
// Rutas para la navegacion de categorias

