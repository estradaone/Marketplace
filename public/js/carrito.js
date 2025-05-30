document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('.agregar-carrito').forEach(boton => {
        boton.addEventListener('click', async (event) => {
            console.log("Evento de clic detectado en el botón."); // DEPURACIÓN

            const idProducto = event.target.dataset.id; // Obtener ID del producto

            try {
                // Verificar sesión con el backend antes de proceder
                const response = await fetch('/usuarios/api/verificar-sesion');
                
                if (!response.ok) {
                    throw new Error(`Error en la solicitud: ${response.status}`);
                }

                const data = await response.json();

                if (!data.autenticado) {
                    alert("Debes iniciar sesión para agregar productos al carrito."); 
                    window.location.href = "/usuarios/loggin"; 
                    return;
                }

                console.log("Usuario autenticado. Agregando producto al carrito..."); // DEPURACIÓN

                // Enviar el producto al backend para agregarlo al carrito
                const addResponse = await fetch('/usuarios/api/carrito/agregar', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ idProducto })
                });

                if (!addResponse.ok) {
                    throw new Error(`Error en la solicitud: ${addResponse.status}`);
                }

                const addData = await addResponse.json();

                if (addData.success) {
                    alert("Producto agregado al carrito!");
                } else {
                    alert("Error al agregar el producto.");
                }
            } catch (error) {
                console.error("Error en la solicitud:", error);
                alert("Hubo un problema al procesar la solicitud. Inténtalo de nuevo.");
            }
        });
    });
});
