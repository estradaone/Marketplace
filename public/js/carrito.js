document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('.agregar-carrito').forEach(boton => {
        console.log("Boton presionado")
        boton.addEventListener('click', async (event) => {
            const boton = event.target.closest('.agregar-carrito');
            const idProducto = boton.dataset.id;
            const nombreProducto = boton.dataset.nombre;
            const precioProducto = boton.dataset.precio;
            const imagenProducto = boton.dataset.imagen;

            try {
                const response = await fetch('/usuarios/api/verificar-sesion');
                if (!response.ok) throw new Error(`Error en la solicitud: ${response.status}`);

                const data = await response.json();
                if (!data.autenticado) {
                    mostrarNotificacion("⚠️ Debes iniciar sesión para agregar productos.", "error");
                    window.location.href = "/usuarios/loggin"; 
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
                    location.reload();
                } else {
                    mostrarNotificacion("❌ Error al agregar el producto.", "error");
                }
            } catch (error) {
                console.error("Error en la solicitud:", error);
                mostrarNotificacion("❌ Hubo un problema al procesar la solicitud.", "error");
            }
        });
    });

    document.querySelectorAll('.eliminar-carrito').forEach(boton => {
        boton.addEventListener('click', async (event) => {
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
                    location.reload();
                } else {
                    mostrarNotificacion("❌ Error al eliminar el producto.", "error");
                }
            } catch (error) {
                console.error("Error en la solicitud:", error);
                mostrarNotificacion("❌ Hubo un problema al procesar la solicitud.", "error");
            }
        });
    });
});
