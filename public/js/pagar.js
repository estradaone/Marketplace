document.addEventListener("DOMContentLoaded", () => {
    const radioTarjeta = document.getElementById("pagoTarjeta");
    const radioPaypal = document.getElementById("pagoPaypal");
    const formTarjeta = document.getElementById("form-tarjeta");
    const paypalContainer = document.getElementById("paypal-button-container");


    function actualizarMetodoPago() {
        if (radioPaypal.checked) {
            formTarjeta.style.display = "none";
            paypalContainer.style.display = "block";
        } else {
            formTarjeta.style.display = "block";
            paypalContainer.style.display = "none";
        }
    }

    radioTarjeta.addEventListener("change", actualizarMetodoPago);
    radioPaypal.addEventListener("change", actualizarMetodoPago);

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
                        value: '5000'
                    }
                }]
            });
        },
        onApprove: (data, actions) => {
            return actions.order.capture().then(async (details) => {
                alert(`Pago exitoso! Gracias, ${details.payer.name.given_name}`);

                try {
                    const response = await fetch('/usuarios/api/finalizar-compra', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' }
                    });
                    const result = await response.json();
                    if (result.success) {
                        window.location.href = "/usuarios/confirmacion";
                    } else {
                        alert("Hubo un problema al registrar la compra: " + result.message);
                    }
                } catch (error) {
                    console.error("Error al finalizar la compra:", error);
                    alert("Error al procesar la compra");
                }
            })
        }

    }).render('#paypal-button-container');

});