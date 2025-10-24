const express = require('express');
const router = express.Router();
const UserControllerMovil = require('../controllers/controllerMovil');

router.post('/registrarUsuario', UserControllerMovil.registrarUsuarioMovil);
router.post('/login', UserControllerMovil.login);
router.get('/todosProductos', UserControllerMovil.obtenerTodosLosProductos);
//Productos relacionado con las categorias
router.get('/productosAccesorios', UserControllerMovil.productosAccesorios);
router.get('/productosBolsos', UserControllerMovil.productosBolsos);
router.get('/productosSombreros', UserControllerMovil.productosSombreros);
router.get('/productosBlusas', UserControllerMovil.productosBlusas);
router.get('/productosPeluches', UserControllerMovil.productosPeluches);
router.get('/productosLlaveros', UserControllerMovil.productosLlaveros);
router.get('/productosDestacados', UserControllerMovil.productosMovil);
router.get('/productos', UserControllerMovil.productosConCategoria);
router.get('/producto/:id_producto', UserControllerMovil.detalleProducto);
router.get('/pedidos/:id_usuario', UserControllerMovil.pedidos);
router.get('/seguimiento/:id_usuario', UserControllerMovil.seguimiento);
router.post('/finalizar-compra', UserControllerMovil.finalizarCompra);
// router.get('/direcciones/:id_usuario', UserControllerMovil.direcciones);
// router.post('/direccion', UserControllerMovil.agregarDireccion);
router.get('/ver-compra/:id_pedido', UserControllerMovil.verCompra);
router.get('/detallesProducto/:id_producto', UserControllerMovil.verDetalleProductoMovil);
//Direcciones
router.post('/direccionNueva', UserControllerMovil.guardarNuevaDireccionMovil);
router.get('/direcciones/:id_usuario', UserControllerMovil.obtenerDireccionesMovil);
router.get('/direccion/:id_direccion', UserControllerMovil.obtenerDireccionPorIdMovil);
router.put('/direccion/:id_direccion', UserControllerMovil.actualizarDireccionMovil);
//Agregar al carrito
router.post('/agregar', UserControllerMovil.agregarAlCarritoMovil);
router.post('/eliminar', UserControllerMovil.eliminarDelCarritoMovil);
router.get('/carritoMovil/:id_usuario', UserControllerMovil.obtenerCarritoMovil);

//Obtener pedidos y seguimientos
router.get('/pedidosMovil/:id_usuario', UserControllerMovil.obtenerPedidosMovil);
router.get('/seguimientoMovil/:id_usuario', UserControllerMovil.obtenerSeguimientoMovil);

//Ver compra a detalle
router.get('/verCompraMovil/:id_pedido', UserControllerMovil.obtenerResumenCompraMovil)
// Reordenar Pedido
router.get('/reordenarMovil/:id_pedido', UserControllerMovil.reordenarPedidosMovil);
// Ver reembolso
router.get('/verReembolsoMovil/:id', UserControllerMovil.verReembolsoMovil);
// Enviar mensaje desde contactos
router.post('/enviarMensajeMovil', UserControllerMovil.enviarMensajeMovil);
module.exports = router;