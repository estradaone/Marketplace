function initMap() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                const map = new google.maps.Map(document.getElementById("map"), {
                    center: userLocation,
                    zoom: 15
                });

                new google.maps.Marker({
                    position: userLocation,
                    map: map,
                    title: "Tu ubicación actual"
                });
            },
            () => {
                document.getElementById("map").innerHTML = "No se pudo obtener tu ubicación.";
            }
        );
    } else {
        document.getElementById("map").innerHTML = "Tu navegador no soporta geolocalización.";
    }
}