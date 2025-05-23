document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('.agregar-carrito').forEach(boton => {
        boton.addEventListener('click', (event) => {
            const userLoggedIn = event.target.dataset.auth === "true"; // Verificar si el usuario ha iniciado sesión

            if (!userLoggedIn) {
                window.location.href = "/usuarios/loggin"; // Redirigir automáticamente a login
                return;
            }

            // Lógica de agregar al carrito
            const idProducto = event.target.dataset.id;
            console.log(`Agregando producto ${idProducto} al carrito`);

            // Aquí puedes hacer una petición al backend para agregar el producto
            fetch('/api/carrito/agregar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idProducto })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert("Producto agregado al carrito!");
                } else {
                    alert("Error al agregar el producto.");
                }
            })
            .catch(error => console.error('Error al agregar producto:', error));
        });
    });
});
