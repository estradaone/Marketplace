// ✅ Registrar el Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('✅ Service Worker registrado:', reg.scope))
        .catch(err => console.error('❌ Error al registrar SW:', err));
}

// ✅ Solicitar permiso de notificaciones
document.addEventListener('DOMContentLoaded', () => {
    if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                mostrarBienvenida();
            }
        });
    } else if (Notification.permission === 'granted') {
        mostrarBienvenida();
    } else {
        console.warn('🔒 Las notificaciones están bloqueadas por el usuario.');
    }
});

// ✅ Mostrar notificación de bienvenida
function mostrarBienvenida() {
    new Notification('Bienvenido a Marketplace Chiapas', {
        body: 'Explora los productos destacados y gestiona tu panel si eres administrador.',
        icon: '/img/pedido.png' // Asegúrate de tener este ícono en /public/img
    });
}
