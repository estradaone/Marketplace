function mostrarNotificacion(mensaje, tipo = 'exito') {
    const notificacion = document.getElementById("mensaje-global");
    const textoMensaje = document.getElementById("texto-mensaje");

    textoMensaje.textContent = mensaje;
    notificacion.style.display = "block";
    
    if (tipo === 'error') {
        notificacion.classList.add("mensaje-error");
    } else {
        notificacion.classList.remove("mensaje-error");
    }

    notificacion.classList.add("fade-out");

    setTimeout(() => {
        notificacion.style.display = "none";
        notificacion.classList.remove("fade-out");
    }, 5000);
}

function confirmarEliminacion() {
    return confirm("¿Estás seguro de que deseas eliminar este usuario suspendido? Esta acción no se puede deshacer.");
}