// controllerUser.js
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const UserModel = require('../models/modelUser');
const bcrypt = require('bcrypt');

const UserController = {
    async registrarUsuario(req, res) {
        const { nombre, apellidos, email, password, telefono, rol } = req.body;
    
        try {
            // Encriptar la contraseña antes de guardarla
            const hashedPassword = await bcrypt.hash(password, 10);
    
            // Registrar al usuario en la base de datos
            await UserModel.registrarUsuario({
                nombre,
                apellidos,
                email,
                password: hashedPassword,
                telefono,
                rol,
            });
    
            // Configurar la sesión del usuario
            req.session.user = {
                nombre,
                apellidos,
                email,
                rol
            };
    
            // Redirigir según el tipo de usuario
            let redirectUrl = '/';
            if (rol === 'administrador') {
                redirectUrl = '/admin/bienvenida'; // Ruta para administradores
            } else if (rol === 'vendedor') {
                redirectUrl = '/vendedor/bienvenida'; // Ruta para vendedores
            } else if (rol === 'usuario') {
                redirectUrl = '/'; // Ruta para usuarios
            }
    
            res.redirect(redirectUrl);
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

};

module.exports = UserController;
