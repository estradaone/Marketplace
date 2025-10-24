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

// Efecto para el scroll del navbar
let prevScrollPos = window.pageYOffset;

window.addEventListener("scroll", () => {
    const currentScrollPos = window.pageYOffset;
    const navbar = document.getElementById("navbarPrincipal");

    if (!navbar) return;

    if (prevScrollPos > currentScrollPos) {
        //Scroll hacia arriba -> mostrar navbar
        navbar.style.top = "0";
    } else {
        //Scroll hacia abajo -> ocultar navbar
        navbar.style.top = "-100px";
    }

    prevScrollPos = currentScrollPos;

});

// Ocultar mensaje de éxito después de 5 segundos
setTimeout(() => {
    const mensajeExito = document.getElementById('mensajeExito');
    if (mensajeExito) {
        mensajeExito.remove();
    }

    const mensajeError = document.getElementById('mensajeError');
    if (mensajeError) {
        mensajeError.remove();
    }
}, 2000); // 5000 ms = 5 segundos

function togglePassword() {
    const input = document.getElementById('password');
    input.type = input.type === 'password' ? 'text' : 'password';
}
