document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('busquedaProductos');
    const resultados = document.getElementById('resultadoProductos');

    if (!input || !resultados) return;

    input.addEventListener('input', () => {
        const searchTerm = input.value.trim();

        if (searchTerm === '') {
            resultados.innerHTML = '';
            return;
        }

        fetch(`/usuarios/buscar-productos-tiempo-real?search=${encodeURIComponent(searchTerm)}`)
            .then(res => {
                if (!res.ok) throw new Error('Respuesta no válida');
                return res.json();
            })
            .then(data => {
                resultados.innerHTML = '';

                if (data.length === 0) {
                    resultados.innerHTML = '<p class="text-center text-muted">No se encontraron productos.</p>';
                    return;
                }

                data.forEach(producto => {
                    resultados.innerHTML += `
                        <div class="card mb-2 shadow-sm">
                            <div class="row g-0">
                                <div class="col-md-4">
                                    <img src="${producto.imagen_url}" class="img-fluid rounded-start" alt="${producto.nombre_producto}">
                                </div>
                                <div class="col-md-8">
                                    <div class="card-body">
                                        <h5 class="card-title">${producto.nombre_producto}</h5>
                                        <p class="card-text">${producto.descripcion}</p>
                                        <p class="card-text fw-bold text-success">$${producto.precio}</p>
                                        <a href="/usuarios/producto/${producto.id_producto}" class="btn btn-outline-primary btn-sm">Ver producto</a>
                                        <button class="btn btn-primary btn-sm agregar-carrito"
                                            data-id="${producto.id_producto}"
                                            data-nombre="${producto.nombre_producto}"
                                            data-precio="${producto.precio}"
                                            data-imagen="${producto.imagen_url}">
                                            Añadir al carrito
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                });
            })
            .catch(error => {
                console.error('Error en búsqueda navbar:', error);
                resultados.innerHTML = '<p class="text-danger text-center">Error al cargar productos.</p>';
            });
    });
});
