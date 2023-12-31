document.addEventListener('DOMContentLoaded', function () {
    const viajesSection = document.getElementById('viajesSection');
    const viajes = JSON.parse(localStorage.getItem('viajes')) || [];

    if (viajes.length > 0) {
        mostrarViajes();
        viajesSection.style.display = 'block';
    } else {
        viajesSection.style.display = 'none';
    }
});

document.getElementById('viajeForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const distanciaViaje = parseFloat(document.getElementById('distancia').value);
    const precioCombustible = parseFloat(document.getElementById('precioCombustible').value);
    const rendimientoAuto = parseFloat(document.getElementById('rendimientoAuto').value);

    if (!isNaN(distanciaViaje) && !isNaN(precioCombustible) && !isNaN(rendimientoAuto) && rendimientoAuto !== 0) {
        const litrosNecesarios = distanciaViaje / rendimientoAuto;
        const costoTotal = litrosNecesarios * precioCombustible;

        const resultadoContainer = document.getElementById('resultado');
        resultadoContainer.innerHTML = `<div class= "alert alert-success"><p>El costo total del combustible para tu viaje es de $${costoTotal.toFixed(2)}</p></div>`;

        const viaje = {
            distancia: distanciaViaje,
            precioLitro: precioCombustible,
            rendimientoAuto: rendimientoAuto,
            costoTotal: costoTotal
        };

        const viajes = JSON.parse(localStorage.getItem('viajes')) || [];
        viajes.push(viaje);

        localStorage.setItem('viajes', JSON.stringify(viajes));

        mostrarViajes();
    } else {
        const resultadoContainer = document.getElementById('resultado');
        resultadoContainer.innerHTML = `<div class= "alert alert-danger"><p>Hubo un error en tu cálculo</p></div>`;
    }
});

function mostrarViajes() {
    const viajes = JSON.parse(localStorage.getItem('viajes')) || [];
    const viajesContainer = document.getElementById('viajesContainer');
    const borrarHistorialBtn = document.getElementById('borrarHistorialBtn');
    const viajesTitle = document.getElementById('viajesTitle');
    const viajesSection = document.getElementById('viajesSection')

    viajesContainer.innerHTML = '';

    if (viajes.length > 0) {
        viajes.forEach((viaje, index) => {
            const card = document.createElement('div');
            card.classList.add('card', 'm-3', 'col');

            card.innerHTML = `
                <div class="card-body">
                <li class="list-group-item">
                <h4 class="card-title text-center">Viaje Nro. ${index + 1}</h4>
                <ul class="list-group list-group-flush py-3">
                    <li class="list-group-item">Distancia: ${viaje.distancia} km</li>
                    <li class="list-group-item">Precio del litro: $${viaje.precioLitro.toFixed(2)}</li>
                    <li class="list-group-item">Rendimiento del auto: ${viaje.rendimientoAuto.toFixed(2)} km/l</li>
                    <li class="list-group-item">Costo total: $${viaje.costoTotal.toFixed(2)}</li>
                </ul>
                <div class="d-grid gap-2 col-6 mx-auto">
                <button class="btn btn-danger" onclick="borrarViaje(${index})">Borrar</button></div>
            </li>
                </div>
            `;

            viajesContainer.appendChild(card);
        });

        borrarHistorialBtn.style.display = 'block';
        viajesTitle.style.display = 'block';
        viajesSection.style.display = 'block';

    } else {
        borrarHistorialBtn.style.display = 'none';
        viajesTitle.style.display = 'none';

        const noViajesMessage = document.createElement('p');
        noViajesMessage.innerText = 'No hay viajes guardados.';
        viajesContainer.appendChild(noViajesMessage);
    }
}

function borrarHistorial() {
        Swal.fire({
            title: '¿Estás seguro?',
            text: "Esta acción no se puede deshacer.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, borrar historial',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem('viajes');
                location.reload();
            }
        });

    const viajesContainer = document.getElementById('viajesContainer');
    viajesContainer.innerHTML = '';

    const viajesTitle = document.getElementById('viajesTitle');
    viajesTitle.style.display = 'none';

    const borrarHistorialBtn = document.getElementById('borrarHistorialBtn');
    borrarHistorialBtn.style.display = 'none';

    const noViajesMessage = document.createElement('p');
    noViajesMessage.innerText = 'No hay viajes guardados.';
    viajesContainer.appendChild(noViajesMessage);
}

function borrarViaje(index) {
    Swal.fire({
        title: '¿Estás seguro?',
        text: "Esta acción no se puede deshacer.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, borrar viaje',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            let viajes = JSON.parse(localStorage.getItem('viajes')) || [];
            viajes.splice(index, 1);
            localStorage.setItem('viajes', JSON.stringify(viajes));
            location.reload();
        }
    });
}

mostrarViajes();

async function obtenerPronostico(ciudad) {
    const apiKey = '80c663c79ca93ee7fe3b778abfd7c9a0'; 
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${ciudad}&appid=${apiKey}&units=metric&lang=es`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error al obtener el pronóstico', error);
        return null;
    }
}

async function obtenerPronosticoExtendido(ciudad) {
    const apiKey = '80c663c79ca93ee7fe3b778abfd7c9a0'; 
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${ciudad}&appid=${apiKey}&units=metric&lang=es`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        const pronosticoExtendido = data.list.filter(item => item.dt_txt.includes('12:00:00'));

        const pronosticoFormateado = pronosticoExtendido.map(item => {
            const fecha = new Date(item.dt * 1000);
            const options = { weekday: 'long', day: 'numeric' };
            const fechaFormateada = fecha.toLocaleDateString('es-ES', options);

            return {
                fecha: fechaFormateada,
                tempMin: item.main.temp_min,
                tempMax: item.main.temp_max,
                condicion: item.weather[0].description
            };
        });

        return pronosticoFormateado;
    } catch (error) {
        console.error('Error al obtener el pronóstico extendido', error);
        return null;
    }
}

document.getElementById('pronosticoForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const ciudad = document.getElementById('ciudad').value;
    const pronostico = await obtenerPronostico(ciudad);

    if (pronostico) {
        const pronosticoContainer = document.getElementById('pronosticoContainer');
        const condicion = pronostico.weather[0].description;
        const icono = pronostico.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${icono}.png`;

        pronosticoContainer.innerHTML = `
    <div class="card mx-auto mt-4" style="max-width: auto;">
        <div class="card-body">
            <h4 class="card-title text-center">Pronóstico para ${ciudad}</h2>
            <img src="${iconUrl}" alt="Icono del Clima" style="width: 100px; float: right;">
            <ul class="list-group list-group-flush">
            <li class="list-group-item">Condiciones Actuales: ${condicion}</li>
            <li class="list-group-item">Temperatura Actual: ${pronostico.main.temp}°C</li>
            <li class="list-group-item">Temperatura Mínima: ${pronostico.main.temp_min}°C</li>
            <li class="list-group-item">Temperatura Máxima: ${pronostico.main.temp_max}°C</li>
            <li class="list-group-item">Humedad Relativa: ${pronostico.main.humidity}%</li>
            <li class="list-group-item">Velocidad del Viento: ${pronostico.wind.speed} m/s</li>
        </ul>
        </div>
    </div>
    <div class="card mx-auto mt-4" style="max-width: auto;">
        <div class="card-header">
            Pronóstico Extendido
        </div>
        <ul class="list-group list-group-flush" id="pronosticoExtendido"></ul>
    </div>
`;


        const pronosticoExtendido = await obtenerPronosticoExtendido(ciudad);
        const pronosticoExtendidoContainer = document.getElementById('pronosticoExtendido');

        if (pronosticoExtendido) {
            pronosticoExtendido.forEach(dia => {
                pronosticoExtendidoContainer.innerHTML += `
                    <li class="list-group-item">
                        <strong>${dia.fecha}:</strong> ${dia.condicion}, Min: ${dia.tempMin}°C, Max: ${dia.tempMax}°C
                    </li>
                `;
            });
        }
    } else {
        console.error('No se pudo obtener el pronóstico del tiempo');
    }
});
