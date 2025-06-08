document.addEventListener("DOMContentLoaded", () => {
    paypal.Buttons({
        style: {
            layout: 'horizontal',
            color: 'blue',
            shape: 'pill',
            label: 'checkout'
        },

        createOrder: (data, actions) => {
            return actions.order.create({
                purchase_units: [{
                    amount: {
                        value: '5000' // 💰 Usa el total del carrito dinámicamente
                    }
                }]
            });
        },

        onApprove: (data, actions) => {
            return actions.order.capture().then((details) => {
                alert(`✅ Pago exitoso! Gracias, ${details.payer.name.given_name}`);
                console.log('Transacción:', details);
                window.location.href = "/usuarios/confirmacion"; // Redirige a página de confirmación
            });
        },

        onCancel: () => {
            alert('⚠️ Pago cancelado, inténtalo nuevamente.');
        },

        onError: (err) => {
            console.error('❌ Error en PayPal:', err);
            alert('Hubo un problema, revisa la configuración.');
        }
    }).render('#paypal-button-container');
});
