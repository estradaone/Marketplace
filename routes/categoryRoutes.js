const express = require('express');
const router = express.Router();

// Rutas para las categorías para administrador
router.get('/categorias/accesorios', (req, res) => {
    res.render('admin/categorias/accesorios');
});

router.get('/categorias/bolsos', (req, res) => {
    res.render('admin/categorias/bolsos');
});

router.get('/categorias/sombreros', (req, res) => {
    res.render('admin/categorias/sombreros');
});

router.get('/categorias/blusas', (req, res) => {
    res.render('admin/categorias/blusas');
});

router.get('/categorias/peluches', (req, res) => {
    res.render('admin/categorias/peluches');
});

router.get('/categorias/llaveros', (req, res) => {
    res.render('admin/categorias/llaveros');
});

// Rutas para las categorías para usuarios normales
router.get('/categorias/accesorios', (req, res) => {
    res.render('usuarios/categorias/accesorios');
});

router.get('/categorias/bolsos', (req, res) => {
    res.render('usuarios/categorias/bolsos');
});

router.get('/categorias/sombreros', (req, res) => {
    res.render('usuarios/categorias/sombreros');
});

router.get('/categorias/blusas', (req, res) => {
    res.render('usuarios/categorias/blusas');
});

router.get('/categorias/peluches', (req, res) => {
    res.render('usuarios/categorias/peluches');
});

router.get('/categorias/llaveros', (req, res) => {
    res.render('usuarios/categorias/llaveros');
});

module.exports = router;
