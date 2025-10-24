// ✅ Actualiza el contador del carrito en el navbar
function actualizarContadorCarrito() {
    fetch('/usuarios/api/carrito/count')
        .then(res => res.json())
        .then(data => {
            const badge = document.getElementById('carritoContador');
            if (badge) {
                badge.textContent = data.count;
                badge.style.display = data.count > 0 ? 'inline-block' : 'none';
            }
        });
}

// ✅ Recalcula el total a pagar en la vista del carrito
function recalcularTotal() {
    let total = 0;
    document.querySelectorAll('.fila-producto').forEach(fila => {
        const precioTexto = fila.querySelector('.precio-total').textContent;
        const precio = parseFloat(precioTexto.replace('$', ''));
        total += precio;
    });
    const totalElemento = document.getElementById('totalPagar');
    if (totalElemento) totalElemento.textContent = `$${total}`;
}

// ✅ Ejecuta todo cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
    actualizarContadorCarrito();

    // 🛒 Agregar producto al carrito
    document.querySelectorAll('.agregar-carrito').forEach(boton => {
        boton.addEventListener('click', async (event) => {
            const btn = event.target.closest('.agregar-carrito');
            const idProducto = btn.dataset.id;
            const nombreProducto = btn.dataset.nombre;
            const precioProducto = btn.dataset.precio;
            const imagenProducto = btn.dataset.imagen;

            try {
                const response = await fetch('/usuarios/api/verificar-sesion');
                const data = await response.json();

                if (!data.autenticado) {
                    mostrarNotificacion("⚠️ Debes iniciar sesión para agregar productos.", "error");
                    return;
                }

                const addResponse = await fetch('/usuarios/api/carrito/agregar', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ idProducto, nombre: nombreProducto, precio: precioProducto, imagen_url: imagenProducto })
                });

                const addData = await addResponse.json();

                if (addData.success) {
                    mostrarNotificacion("✅ Producto agregado al carrito.");
                    actualizarContadorCarrito();
                } else {
                    mostrarNotificacion("❌ Error al agregar el producto.", "error");
                }
            } catch (error) {
                console.error("Error:", error);
                mostrarNotificacion("❌ Hubo un problema al procesar la solicitud.", "error");
            }
        });
    });

    // 🗑️ Eliminar producto del carrito
    document.querySelectorAll('.eliminar-carrito').forEach(boton => {
        boton.addEventListener('click', async (event) => {
            event.stopPropagation(); // ✅ evita que el clic en "Quitar" active el redireccionamiento
            const idProducto = event.target.dataset.id;

            try {
                const deleteResponse = await fetch('/usuarios/api/carrito/eliminar', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ idProducto })
                });

                const deleteData = await deleteResponse.json();

                if (deleteData.success) {
                    mostrarNotificacion("✅ Producto eliminado del carrito.");
                    actualizarContadorCarrito();

                    const fila = document.querySelector(`.fila-producto[data-id="${idProducto}"]`);
                    if (fila) {
                        fila.remove();
                        recalcularTotal();
                    }
                } else {
                    mostrarNotificacion("❌ Error al eliminar el producto.", "error");
                }
            } catch (error) {
                console.error("Error:", error);
                mostrarNotificacion("❌ Hubo un problema al procesar la solicitud.", "error");
            }
        });
    });

    // 🔍 Redireccionar al detalle al hacer clic en la fila
    document.querySelectorAll('.fila-producto').forEach(fila => {
        fila.addEventListener('click', (e) => {
            // Si el clic fue en el botón "Quitar", no redirigir
            if (e.target.closest('.eliminar-carrito')) return;
            const id = fila.dataset.id;
            window.location.href = `/usuarios/producto/${id}`;
        });
    });
});
