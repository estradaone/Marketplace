document.addEventListener('DOMContentLoaded', () => {
    const inputBusqueda = document.getElementById('busqueda');
    const tabla = document.getElementById('tablaUsuarios');

    inputBusqueda.addEventListener('input', function () {
        const searchTerm = this.value.trim();

        fetch(`/usuarios/buscar-usuarios?search=${encodeURIComponent(searchTerm)}`)
            .then(res => res.json())
            .then(data => {
                tabla.innerHTML = '';

                if (data.length === 0) {
                    tabla.innerHTML = '<tr><td colspan="9">No se encontraron usuarios.</td></tr>';
                    return;
                }

                data.forEach(usuario => {
                    tabla.innerHTML += `
                        <tr>
                            <td>${usuario.id_usuario}</td>
                            <td>${usuario.nombre}</td>
                            <td>${usuario.apellidos}</td>
                            <td>${usuario.email}</td>
                            <td><i class="bi bi-lock-fill text-muted"></i></td>
                            <td>${usuario.telefono}</td>
                            <td>${usuario.estado}</td>
                            <td>${usuario.rol}</td>
                            <td>
                                <a href="/usuarios/admin/usuarios/editar/${usuario.id_usuario}" class="btn btn-warning">Editar</a>
                                ${usuario.estado === 'activo' ? `
                                    <form action="/usuarios/admin/usuarios/suspender/${usuario.id_usuario}" method="POST" style="display:inline;">
                                        <button type="submit" class="btn btn-danger">Suspender</button>
                                    </form>
                                ` : `
                                    <form action="/usuarios/admin/usuarios/activar/${usuario.id_usuario}" method="POST" style="display:inline;">
                                        <button type="submit" class="btn btn-primary">Activar</button>
                                    </form>
                                `}
                            </td>
                        </tr>
                    `;
                });
            })
            .catch(error => {
                console.error('Error en la búsqueda:', error);
                tabla.innerHTML = '<tr><td colspan="9">Error al cargar los usuarios.</td></tr>';
            });
    });
});
