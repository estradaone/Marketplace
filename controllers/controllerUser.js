// controllerUser.js
const crypto = require('crypto');
const nodemailer = require('nodemailer');
require('dotenv').config();
const UserModel = require('../models/modelUser');
const bcrypt = require('bcrypt');
const multer = require('multer');
const { error } = require('console');
const pool = require('../database/db');
const { console } = require('inspector');
const pdf = require('html-pdf');
const ejs = require('ejs');


//Configuracion para subir imagenes
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });


const UserController = {
    async registrarUsuario(req, res) {
        const { nombre, apellidos, email, password } = req.body;

        try {
            // Encriptar la contraseña antes de guardarla
            const hashedPassword = await bcrypt.hash(password, 10);

            // Registrar al usuario en la base de datos
            await UserModel.registrarUsuario({
                nombre,
                apellidos,
                email,
                password: hashedPassword
            });

            // Configurar la sesión del usuario
            req.session.user = {
                nombre,
                apellidos,
                email,
                rol: 'usuario'
            };

            // Redirigir al home
            res.redirect('/');
        } catch (error) {
            console.error('Error al registrar el usuario:', error);
            res.status(500).send('Error al registrar el usuario.');
        }
    },

    async authenticateUser(req, res) {
        const { email, password } = req.body;
        try {
            const user = await UserModel.authenticateUser(email, password);
            if (user) {
                if (user.estado === 'suspendido') {
                    return res.render('loggin', { error: 'Tu cuenta esta suspendida' });
                }
                req.session.user = user;
                res.redirect('/');
            } else {
                res.render('loggin', { error: 'Datos incorrectos, intente de nuevo' });
            }
        } catch (error) {
            console.error('Error durante la auntenticación del usuario:', error);
            res.status(500).send('Error durante la aunteticación del usuario');
        }
    },
    showLogginPage(req, res) {
        res.render('loggin', { error: null });
    },

    logout(req, res) {
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).send('Error al cerrar la sesión');
            }
            res.redirect('/');
        })
    },

    async getAccesorios(req, res) {
        try {
            const productos = await UserModel.getProductsByCategory('Accesorios');
            // Verifica el rol del usuario y renderiza la vista correspondiente
            if (req.session.user && req.session.user.rol === 'administrador') {
                res.render('admin/categorias/accesorios', { productos });
            } else {
                res.render('usuarios/categorias/accesorios', { productos });
            }
        } catch (error) {
            console.error('Error al obtener los productos de accesorios:', error);
            res.status(500).send('Error al obtener los productos de accesorios');
        }
    },

    async getBolsos(req, res) {
        try {
            const productos = await UserModel.getProductsByCategory('Bolsos');
            if (req.session.user && req.session.user.rol === 'administrador') {
                res.render('admin/categorias/bolsos', { productos });
            } else {
                res.render('usuarios/categorias/bolsos', { productos });
            }
        } catch (error) {
            console.error('Error al obtener los productos de bolsos:', error);
            res.status(500).send('Error al obtener los productos de bolsos');
        }
    },

    async getSombreros(req, res) {
        try {
            const productos = await UserModel.getProductsByCategory('Sombreros');
            if (req.session.user && req.session.user.rol === 'administrador') {
                res.render('admin/categorias/sombreros', { productos });
            } else {
                res.render('usuarios/categorias/sombreros', { productos });
            }
        } catch (error) {
            console.error('Error al obtener los productos de sombreros:', error);
            res.status(500).send('Error al obtener los productos de sombreros');
        }
    },

    async getBlusas(req, res) {
        try {
            const productos = await UserModel.getProductsByCategory('Blusas');
            if (req.session.user && req.session.user.rol === 'administrador') {
                res.render('admin/categorias/blusas', { productos });
            } else {
                res.render('usuarios/categorias/blusas', { productos });
            }
        } catch (error) {
            console.error('Error al obtener los productos de blusas', error);
            res.status(500).send('Error al obtener los productos de blusas');
        }
    },

    async getPeluches(req, res) {
        try {
            const productos = await UserModel.getProductsByCategory('Peluches');
            if (req.session.user && req.session.user.rol === 'administrador') {
                res.render('admin/categorias/peluches', { productos });
            } else {
                res.render('usuarios/categorias/peluches', { productos });
            }
        } catch (error) {
            console.error('Error al obtener los productos de peluches', error);
            res.status(500).send('Error al obtener los productos de peluches');
        }
    },

    async getLlaveros(req, res) {
        try {
            const productos = await UserModel.getProductsByCategory('Llaveros');
            if (req.session.user && req.session.user.rol === 'administrador') {
                res.render('admin/categorias/llaveros', { productos });
            } else {
                res.render('usuarios/categorias/llaveros', { productos });
            }
        } catch (error) {
            console.error('Error al obtener los productos de llaveros', error);
            res.status(500).send('Error al obtener los productos de llaveros');
        }
    },

    // Restablecer contraseña
    async sendResetToken(req, res) {
        const { email } = req.body;

        try {
            // Verificar si el usuario existe (sin contraseña)
            const user = await UserModel.authenticateUser(email);
            if (!user) {
                return res.render('forgot-password', { message: 'Usuario no encontrado' });
            }

            // Generar token único y establecer tiempo de expiración
            const token = crypto.randomBytes(32).toString('hex');
            const expiration = new Date(Date.now() + 3600000); // 1 hora

            // Guardar el token en la base de datos
            await UserModel.setResetToken(email, token, expiration);

            // Configurar transporte para enviar el correo
            require('dotenv').config();
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });

            // Crear enlace de recuperación
            const resetLink = `${process.env.BASE_URL}/usuarios/reset-password/${token}`;
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Restablece tu contraseña',
                html: `<p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p><a href="${resetLink}">${resetLink}</a>`
            };

            // Enviar el correo
            await transporter.sendMail(mailOptions);
            res.render('forgot-password', { message: 'Correo enviado con éxito' });
        } catch (error) {
            console.error('Error al enviar el correo:', error);
            res.render('forgot-password', { message: 'Error al enviar el correo' });
        }
    },

    async resetPassword(req, res) {
        const { token, newPassword } = req.body;

        try {
            // Verificar el token
            const user = await UserModel.verifyResetToken(token);
            if (!user) {
                return res.render('reset-password', { token: null, message: 'Token inválido o expirado' });
            }

            // Encriptar la nueva contraseña
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await UserModel.updatePassword(user.id_usuario, hashedPassword);

            // Configurar la sesión del usuario
            req.session.user = {
                id: user.id_usuario,
                nombre: user.nombre,
                rol: user.rol,
                email: user.email
            };

            // Redirigir según el rol del usuario
            let redirectUrl = '/';
            if (user.rol === 'administrador') {
                redirectUrl = '/admin/bienvenida';
            } else if (user.rol === 'vendedor') {
                redirectUrl = '/vendedor/bienvenida';
            }

            res.redirect(redirectUrl);
        } catch (error) {
            console.error('Error al actualizar la contraseña e iniciar sesión:', error);
            res.status(500).send('Error al actualizar la contraseña');
        }
    },


    // Mostrar el formulario
    async mostrarFormularioAgregar(req, res) {
        try {
            const categorias = await UserModel.obtenerCategorias();
            res.render('admin/agregar-producto', { categorias });
        } catch (error) {
            console.error('Error al mostrar el formulario', error);
            res.status(500).send('Error al cargar el formulario');
        }
    },

    // Agregar productos
    async agregarProducto(req, res) {
        try {
            const { nombre_producto, descripcion, precio, cantidad, id_categoria, vendedor } = req.body;
            const imagen_url = req.file ? `/uploads/${req.file.filename}` : null; // Si no hay imagen, se deja como `null`

            await UserModel.agregarProducto({ nombre_producto, descripcion, precio, cantidad, imagen_url, id_categoria, vendedor });
            res.redirect('/usuarios/admin/categorias/accesorios');
        } catch (error) {
            console.error('Error al agregar el producto', error);
            res.status(500).send('Error al agregar el producto');
        }
    },

    // Listar productos segun categorías
    async listarProductos(req, res) {
        try {
            const { categoria } = req.params;
            const productos = await UserModel.getProductsByCategory(categoria);
            res.render(`admin/categorias/${categoria}`, { productos, categoria });
        } catch (error) {
            console.error('Error al obtener los productos:', error);
            res.status(500).send('Error al obtener los productos');
        }
    },

    // Obtener los productos
    async obtenerProductos(req, res) {
        try {
            const { id_producto } = req.params;
            const producto = await UserModel.obtenerProductosPorId(id_producto);
            const categorias = await UserModel.obtenerCategorias();
            res.render('admin/editar-producto', { producto, categorias });
        } catch (error) {
            console.error('Error al obtener el producto:', error);
            res.status(500).send('Error al obtener el producto');
        }
    },

    //Actualizar los productos
    async actualizarProductos(req, res) {
        try {
            const { id_producto } = req.params;
            const { nombre_producto, descripcion, precio, cantidad, id_categoria, vendedor } = req.body;
            const imagen_url = req.file ? `/uploads/${req.file.filename}` : null; // Si no hay imagen, no se modifica

            await UserModel.actualizarProducto(id_producto, { nombre_producto, descripcion, precio, cantidad, imagen_url, id_categoria, vendedor });
            res.redirect('/usuarios/admin/categorias/accesorios');
        } catch (error) {
            console.error('Error al actualizar el producto', error);
            res.status(500).send('Error al actualizar el producto');
        }
    },

    // Eliminar productos
    async eliminarProducto(req, res) {
        try {
            const { id_producto } = req.params;
            await UserModel.eliminarProducto(id_producto);
            res.redirect('/usuarios/admin/categorias/accesorios');
        } catch (error) {
            console.error('Error al eliminar el producto', error);
            res.status(500).send('Error al eliminar el producto');
        }
    },

    async listarUsuarios(req, res) {
        try {
            const usuarios = await UserModel.obtenerUsuarios();
            res.render('admin/usuarios', { usuarios });
        } catch (error) {
            console.error('Error al listar los usuarios', error);
            res.status(500).send('Error al listar los usuarios');
        }
    },

    //Mostrar formulario para agregar usuarios
    async mostrarFormularioAgregarUsuario(req, res) {
        res.render('admin/agregar-usuario');
    },

    // Agregar usuario
    async agregarUsuario(req, res) {
        const { nombre, apellidos, email, password } = req.body;
        try {
            const hashedPassword = await bcrypt.hash(password, 10); // Encriptar la contraseña
            await UserModel.agregarUsuario({ nombre, apellidos, email, password: hashedPassword });
            res.redirect('/usuarios/usuariosExistentes');
        } catch (error) {
            console.error('Error al agregar el usuario', error);
            res.status(500).send('Error al agregar el usuario');
        }
    },

    //Obtener usuario para poder editar
    async obtenerUsuarioParaEditar(req, res) {
        const { id_usuario } = req.params;
        try {
            const usuario = await UserModel.obtenerUsuarioPorId(id_usuario);
            res.render('admin/editar-usuario', { usuario });
        } catch (error) {
            console.error('Error al obtener el usuario', error);
            res.status(500).send('Error al obtener el usuario');
        }
    },

    // Actualizar usuario
    async actualizarUsuario(req, res) {
        const { id_usuario } = req.params;
        const { nombre, apellidos, email } = req.body;
        try {
            await UserModel.actualizarUsuarios(id_usuario, { nombre, apellidos, email });
            res.redirect('/usuarios/usuariosExistentes');
        } catch (error) {
            console.error('Error al actualizar el usuario:', error);
            res.status(500).send('Error al actualizar el usuario');
        }
    },

    // Listar usuarios activos
    async listarUsuariosActivos(req, res) {
        try {
            const usuarios = await UserModel.obtenerUsuariosPorEstado('activo');
            // console.log('Usuarios activos:', usuarios);
            res.render('usuariosExistentes', { usuarios });
        } catch (error) {
            console.error('Error al listar los usuarios activos:', error);
            res.status(500).send('Error al listar los usuarios activos');
        }
    },
    // Listar todos los usuarios (sin filtro)
    async listarTodosLosUsuarios(req, res) {
        try {
            const usuarios = await UserModel.obtenerTodosLosUsuarios(); // Asegúrate de tener esta función en el modelo
            res.render('usuariosExistentes', { usuarios });
        } catch (error) {
            console.error('Error al listar todos los usuarios:', error);
            res.status(500).send('Error al listar todos los usuarios');
        }
    },
    // Búsqueda tradicional (cuando se presiona Enter)
    async buscarUsuarios(req, res) {
        const searchTerm = req.query.search || '';
        try {
            const usuarios = await UserModel.buscarUsuarios(searchTerm);
            res.render('usuariosExistentes', { usuarios });
        } catch (error) {
            console.error('Error al buscar usuarios:', error);
            res.status(500).send('Error al buscar usuarios');
        }
    },
    // Controlador para búsqueda en tiempo real (AJAX)
    async buscarUsuariosTiempoReal(req, res) {
        const searchTerm = req.query.search || '';
        try {
            const usuarios = await UserModel.buscarUsuarios(searchTerm);
            res.json(usuarios); // ← Esto es lo que necesita el frontend
        } catch (error) {
            console.error('Error en búsqueda AJAX:', error);
            res.status(500).json([]);
        }
    },

    //Busqueda tradicional 
    async buscarProductos(req, res) {
        const searchTerm = req.query.search || '';
        try {
            const productos = await UserModel.buscarProductos(searchTerm);
            res.render('usuarios/tienda', { productos }); // ← asegúrate que esta vista existe
        } catch (error) {
            console.error('Error al buscar productos:', error);
            res.status(500).send('Error al buscar productos');
        }
    },
    //Buscar productos en tiempo real
    async buscarProductosTiempoReal(req, res) {
        const searchTerm = req.query.search || '';
        try {
            const productos = await UserModel.buscarProductos(searchTerm);
            res.json(productos); // ← esto es lo que necesita el frontend
        } catch (error) {
            console.error('Error en búsqueda AJAX de productos:', error);
            res.status(500).json([]);
        }
    },
    //Listar lo usuarios suspendidos
    async listarUsuariosSuspendidos(req, res) {
        try {
            const usuariosSuspendidos = await UserModel.obtenerUsuariosPorEstado('suspendido');
            res.render('admin/usuarios-suspendidos', { usuariosSuspendidos });
        } catch (error) {
            console.error('Error al listar los usuarios suspendidos:', error);
            res.status(500).send('Error al listar los usuarios suspendidos');
        }
    },

    // Suspender usuarios
    async suspenderUsuario(req, res) {
        const { id_usuario } = req.params;
        try {
            await UserModel.cambiarEstadoUsuario(id_usuario, 'suspendido');
            res.redirect('/usuarios/usuariosExistentes');
        } catch (error) {
            console.error('Error al suspender el usuario', error);
            res.status(500).send('Error al suspender el usuario');
        }
    },

    //Activar usuario
    async activarUsuario(req, res) {
        const { id_usuario } = req.params;
        try {
            await UserModel.cambiarEstadoUsuario(id_usuario, 'activo');
            res.redirect('/usuarios/usuariosExistentes');
        } catch (error) {
            console.error('Error al activar el usuario', error);
            res.status(500).send('Error al activar el usuario');
        }
    },
    // Eliminar usuarios
    async eliminarUsuario(req, res) {
        try {
            const { id_usuario } = req.params;
            await UserModel.eliminarUsuario(id_usuario);
            res.redirect('/usuarios/admin/usuarios/suspendidos');
        } catch (error) {
            console.error('Error al eliminar el usuario', error);
            res.status(500).send('Error al eliminar el usuario');
        }
    },

    //Tienda
    //Mostar productos en la pagina de bienvenida
    async mostrarTiendaBienvenida(req, res) {
        try {
            const productos = await UserModel.obtenerProductosConCategoria();
            // console.log("Productos cargados en controlador:", productos);
            res.render('bienvenida', { productos });
        } catch (error) {
            console.error('Error al obtener los productos', error);
            res.status(500).send('Error al cargar los productos');
        }
    },
    async mostrarTiendaUsuario(req, res) {
        try {
            const productos = await UserModel.obtenerProductos(); // Consulta los productos
            // console.log("Productos cargados en controlador:", productos); // Depuración
            res.render('usuarios/tienda', { productos }); // Envía los productos a la vista
        } catch (error) {
            console.error('Error al obtener productos:', error);
            res.status(500).send('Error al cargar la tienda');
        }
    },

    async mostrarTiendaAdministrador(req, res) {
        try {
            if (!req.session.user || req.session.user.rol !== 'administrador') {
                return res.redirect('/usuarios/tienda');
            }

            const productos = await UserModel.obtenerProductos(); // Obtener productos desde el modelo
            // console.log("Productos cargados en Admin:", productos); // Depuración
            res.render('admin/tienda', { productos }); // Pasando los productos a la vista
        } catch (error) {
            console.error('Error al obtener productos:', error);
            res.status(500).send('Error al cargar la tienda de administrador');
        }
    },
    // Registrar seguimiento
    async mostrarPedidos(req, res) {
        const usuario = req.session.user;
        if (!usuario) return res.redirect('/usuarios/loggin');
        try {
            const pedidos = await UserModel.obtenerPedidosPorUsuario(usuario.id_usuario);
            res.render('pedidos', { pedidos });
        } catch (error) {
            console.error("Error al obtener pedidos:", error);
            res.status(500).send("Error interno");
        }
    },

    async mostrarSeguimiento(req, res) {
        const usuario = req.session.user;
        if (!usuario) return res.redirect('/usuarios/loggin');
        try {
            const seguimiento = await UserModel.obtenerSeguimientoPorUsuario(usuario.id_usuario);
            res.render('seguimiento', { seguimiento });
        } catch (error) {
            console.error("Error al obtener seguimiento:", error);
            res.status(500).send("Error interno");
        }
    },

    // Mostrar detalles del producto al dar clic
    async verDetalleProducto(req, res) {
        const id_producto = req.params.id_producto;

        try {
            const producto = await UserModel.obtenerProductosPorId(id_producto);
            if (!producto) {
                return res.status(404).send('Producto no encontrado');
            }
            const destacados = await UserModel.obtenerProductosDestacados();
            const relacionados = await UserModel.obtenerProductosRelacionados(producto.id_categoria, id_producto);
            res.render('usuarios/detalleProducto', { producto, destacados, relacionados });
        } catch (error) {
            console.error('Error al cargar detalle del producto:', error);
            res.status(500).send('Error interno');
        }
    },

    //Mostrar formulario de direccion
    async mostrarFormularioNuevaDireccion(req, res) {
        const id_usuario = req.session.user?.id_usuario;
        if (!id_usuario) return res.redirect('/usuarios/loggin');
        const direccion = null;

        res.render('usuarios/nuevaDireccion', { direccion });
    },

    async guardarNuevaDireccion(req, res) {
        const id_usuario = req.session.user?.id_usuario;
        if (!id_usuario) return res.redirect('/usuarios/loggin');

        const { telefono, direccion, ciudad, municipio, estado2, codigo_postal } = req.body;
        await UserModel.agregarDireccion(id_usuario, { telefono, direccion, ciudad, municipio, estado2, codigo_postal });
        res.redirect('/usuarios/direcciones');
    },

    async mostrarTodasLasDirecciones(req, res) {
        const id_usuario = req.session.user?.id_usuario;
        if (!id_usuario) return res.redirect('/usuarios/loggin');

        const direcciones = await UserModel.obtenerDirecciones(id_usuario);
        res.render('usuarios/direcciones', { direcciones });
    },

    async mostrarFormularioEditarDireccion(req, res) {
        const id_direccion = req.params.id;
        const direccion = await UserModel.obtenerDireccionPorId(id_direccion);
        res.render('usuarios/editarDireccion', { direccion });
    },

    async actualizarDireccion(req, res) {
        const id_direccion = req.params.id;
        const { telefono, direccion, ciudad, municipio, estado2, codigo_postal } = req.body;
        await UserModel.actualizarDireccionPorId(id_direccion, { telefono, direccion, ciudad, municipio, estado2, codigo_postal });
        res.redirect('/usuarios/direcciones');
    },
    //Ver compra
    async verCompra(req, res) {
        const id_pedido = req.params.id;
        try {
            const { pedido, productos } = await UserModel.obtenerResumenCompra(id_pedido);
            res.render('usuarios/verCompra', { pedido, productos });
        } catch (error) {
            console.error('Error al mostrar compra:', error);
            res.status(500).send('Error al cargar la compra');
        }
    },

    //Reordenar
    async reordenarPedido(req, res) {
        const idPedido = req.params.id_pedido;
        try {
            //Buscar el pedido
            // console.log('📦 Pedido recibido:', pedido);
            const producto = await UserModel.obtenerPedidos(idPedido);
            if (!producto || !producto.id_producto) {
                return res.redirect('/usuarios/tienda');
            }
            res.redirect(`/usuarios/producto/${producto.id_producto}`);
        } catch (error) {
            console.error('Error al reordenar:', error);
            res.redirect('/usuarios/tienda');
        }
    },

    async enviarMensaje(req, res) {
        const { nombre, email, asunto, mensaje } = req.body;
        try {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });
            const mailOptions = {
                from: `"${nombre}" <${email}>`,
                to: process.env.EMAIL_USER,
                subject: `Contacto: ${asunto}`,
                text: mensaje,
                html: `
                    <h3>Nuevo mensaje de contacto</h3>
                    <p><strong>Nombre:</strong> ${nombre}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Asunto:</strong> ${asunto}</p>
                    <p><strong>Mensaje:</strong><br>${mensaje}</p>
                `
            };
            await transporter.sendMail(mailOptions);
            res.redirect('/ayuda?enviado=true');
        } catch (error) {
            console.error('Error al enviar el correo:', error);
            res.redirect('/ayuda?error=true');
        }
    },

    // Mostrar perfil del usuario
    async verPerfilUsuario(req, res) {
        const id_usuario = req.session.user?.id_usuario;

        try {
            const [result] = await pool.query('SELECT * FROM usuarios WHERE id_usuario = ?', [id_usuario]);
            const usuario = result[0];
            res.render('usuarios/perfil', { usuario });
        } catch (error) {
            console.error('Error al cargar perfil:', error);
            res.status(500).send('Error al cargar perfil');
        }
    },

    // Actualizar perfil del usuario
    async actualizarPerfilUsuario(req, res) {
        const { nombre, apellidos, email } = req.body;
        const idUsuario = req.session.user.id_usuario;

        try {
            await UserModel.actualizarUsuarios(idUsuario, { nombre, apellidos, email });
            res.redirect('/usuarios/perfil');
        } catch (error) {
            console.error('Error al actualizar perfil del usuario:', error);
            res.status(500).send('Error al actualizar perfil');
        }
    },
    // Mostrar perfil del admin
    async verPerfilAdmin(req, res) {
        const id_admin = req.session.user?.id_usuario;

        try {
            const [result] = await pool.query('SELECT * FROM usuarios WHERE id_usuario = ?', [id_admin]);
            const admin = result[0];
            res.render('admin/perfil', { admin });
        } catch (error) {
            console.error('Error al cargar perfil del admin:', error);
            res.status(500).send('Error al cargar perfil');
        }
    },

    // Actualizar perfil del admin
    async actualizarPerfilAdmin(req, res) {
        const { nombre, apellidos, email } = req.body;
        const id_admin = req.session.user.id_usuario;

        try {
            await UserModel.actualizarUsuarios(id_admin, { nombre, apellidos, email });
            res.redirect('/admin/perfil');
        } catch (error) {
            console.error('Error al actualizar perfil del admin:', error);
            res.status(500).send('Error al actualizar perfil');
        }
    },
    //Historial de compras admin
    async verHistorialVentas(req, res) {
        if (!req.session.user || req.session.user.rol !== 'administrador') {
            return res.redirect('/admin/historialVentas');
        }

        const filtro = req.query.filtro || '';

        try {
            const historial = await UserModel.obtenerHistorialVentas(filtro);

            const totalVentas = historial.reduce((acc, venta) => {
                const subtotal = parseFloat(venta.subtotal);
                return acc + (isNaN(subtotal) ? 0 : subtotal);
            }, 0);

            res.render('admin/historialVentas', {
                historial,
                filtro,
                totalVentas: totalVentas.toFixed(2)
            });
        } catch (error) {
            console.error('Error al obtener historial de ventas:', error);
            res.status(500).send('Error al cargar historial de ventas');
        }
    }
    ,
    //Generar reporte PDF
    async generarPDFVentas(req, res) {
        const { filtro } = req.query;
        const ventas = await UserModel.obtenerHistorialVentas(filtro);
        const total = ventas.reduce((acc, venta) => {
            const subtotal = parseFloat(venta.subtotal);
            return acc + (isNaN(subtotal) ? 0 : subtotal);
        }, 0);

        const html = await ejs.renderFile('views/admin/pdfVentas.ejs', {
            ventas,
            filtro,
            total: total.toFixed(2)
        });

        pdf.create(html).toStream((err, stream) => {
            if (err) return res.status(500).send('Error al generar PDF');
            res.setHeader('Content-Type', 'application/pdf');
            stream.pipe(res);
        })
    },

    //Actualizar pedido
    async formEditarPedido(req, res) {
        const { id } = req.params;
        const [result] = await pool.query('SELECT * FROM pedidos WHERE id_pedido = ?', [id]);
        res.render('admin/editarPedido', { pedido: result[0] });
    },

    async actualizarPedido(req, res) {
        const { id } = req.params;
        const { estado, numero_seguimiento } = req.body;
        await pool.query('UPDATE pedidos SET estado = ?, numero_seguimiento = ? WHERE id_pedido = ?', [estado, numero_seguimiento, id]);
        res.redirect('/usuarios/admin/historialVentas');
    },
    //Cancelar pedido
    // Cancelar pedido
    async cancelarPedido(req, res) {
        const { id } = req.params;

        try {
            const [result] = await pool.query('SELECT * FROM pedidos WHERE id_pedido = ?', [id]);
            const pedido = result[0];

            if (!pedido) {
                return res.status(404).send('Pedido no encontrado.');
            }

            if (pedido.estado === 'entregado' || pedido.estado === 'cancelado') {
                return res.status(400).send('Este pedido no puede ser cancelado.');
            }

            const fechaCancelacion = new Date();

            await pool.query(
                'UPDATE pedidos SET estado = ?, fecha_cancelacion = ?, fecha_entrega_estimada = ? WHERE id_pedido = ?',
                ['cancelado', fechaCancelacion, fechaCancelacion, id]
            );

            res.redirect('/usuarios/pedidos');
        } catch (error) {
            console.error('Error al cancelar el pedido:', error);
            res.status(500).send('Error interno al cancelar el pedido.');
        }
    },
    // Mostrar vista de reembolso
    async verReembolso(req, res) {
        const id_pedido = req.params.id;

        try {
            const { pedido, productos } = await UserModel.obtenerResumenCompra(id_pedido);

            if (!pedido || pedido.estado !== 'cancelado') {
                return res.status(404).send('Este pedido no está cancelado o no existe.');
            }

            res.render('usuarios/rembolso', { pedido, productos });
        } catch (error) {
            console.error('Error al cargar reembolso:', error);
            res.status(500).send('Error interno del servidor.');
        }
    }



};

module.exports = {
    ...UserController,
    upload
};
// module.exports = UserController;
// module.exports.upload = upload;
