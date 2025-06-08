document.addEventListener("DOMContentLoaded", () => {
    // Agregar productos al carrito con validación de sesión
    document.querySelectorAll('.agregar-carrito').forEach(boton => {
        boton.addEventListener('click', async (event) => {
            const boton = event.target.closest('.agregar-carrito');
            const idProducto = boton.dataset.id;
            const nombreProducto = boton.dataset.nombre;
            const precioProducto = boton.dataset.precio;
            const imagenProducto = boton.dataset.imagen;

            try {
                // Verificar sesión antes de agregar productos
                const response = await fetch('/usuarios/api/verificar-sesion');
                if (!response.ok) throw new Error(`Error en la solicitud: ${response.status}`);

                const data = await response.json();
                if (!data.autenticado) {
                    alert("Debes iniciar sesión para agregar productos al carrito.");
                    window.location.href = "/usuarios/loggin"; 
                    return;
                }

                // Enviar datos al backend
                const addResponse = await fetch('/usuarios/api/carrito/agregar', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ idProducto, nombre: nombreProducto, precio: precioProducto, imagen_url: imagenProducto })
                });

                const addData = await addResponse.json();

                if (addData.success) {
                    alert("Producto agregado al carrito!");
                    location.reload(); // Recargar página para ver cambios
                } else {
                    alert("Error al agregar el producto.");
                }
            } catch (error) {
                console.error("Error en la solicitud:", error);
                alert("Hubo un problema al procesar la solicitud. Inténtalo de nuevo.");
            }
        });
    });

    // Eliminar productos del carrito completamente
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
                    alert("Producto eliminado del carrito!");
                    location.reload(); // Recargar página para ver cambios
                } else {
                    alert("Error al eliminar el producto.");
                }
            } catch (error) {
                console.error("Error en la solicitud:", error);
                alert("Hubo un problema al procesar la solicitud. Inténtalo de nuevo.");
            }
        });
    });
});
