const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const https = require('https');
const engine = require('ejs-locals');
const userRoutes = require('./routes/routes');
const categoryRoutes = require('./routes/categoryRoutes');
const UserController = require('./controllers/controllerUser');

const app = express();
const PORT = 3001;

// Cargar certificados SSL
const privateKey = fs.readFileSync(path.join(__dirname, 'cert', 'key.pem'), 'utf8');
const certificate = fs.readFileSync(path.join(__dirname, 'cert', 'cert.pem'), 'utf8');
const credentials = { key: privateKey, cert: certificate };

// Configuración de las sesiones
app.use(session({
    secret: 'secretKey',
    resave: false,
    saveUninitialized: true,
}));

// Configuración para leer datos del formulario
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'supersecreto', resave: false, saveUninitialized: true }));

// Middleware para pasar el rol del usuario a las vistas
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Configuración del motor de vistas (EJS)
app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Rutas para la navegación 
app.get('/', UserController.mostrarTiendaBienvenida);

app.get('/nosotros', (req, res) => {
    res.render('nosotros');
});
app.get('/ayuda', (req, res) => {
    res.render('ayuda');
});
app.get('/registro', (req, res) => {
    res.render('registro');
});

app.get('/compras', (req, res) => {
    res.render('compras');
});

// Rutas de categorías para admin y usuarios
app.use('/admin', categoryRoutes);
app.use('/usuarios', categoryRoutes);

// Rutas de usuarios (incluye el registro de usuarios)
app.use('/usuarios', userRoutes);

// Iniciar el servidor HTTPS
https.createServer(credentials, app).listen(PORT, () => {
    console.log(`Servidor HTTPS iniciado en https://localhost:${PORT}`);
});
