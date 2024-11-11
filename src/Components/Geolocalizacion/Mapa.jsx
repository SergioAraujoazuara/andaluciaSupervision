import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const Mapa = () => {
    const [lat, setLat] = useState(null);
    const [lng, setLng] = useState(null);

    // Función para manejar el clic en el mapa
    const handleMapClick = (event) => {
        const { lat, lng } = event.latlng; // Obtener latitud y longitud del clic
        setLat(lat); // Actualizar latitud
        setLng(lng); // Actualizar longitud
        console.log('Coordenadas seleccionadas:', { lat, lng }); // Mostrar coordenadas en consola
    };

    return (
        <div style={{ height: '500px', width: '100%' }}>
            <MapContainer
                center={[40.4168, -3.7038]} // Coordenadas de Madrid, España (puedes cambiar a otras coordenadas en España)
                zoom={6} // Zoom inicial
                style={{ height: '100%', width: '100%' }}
                whenCreated={(map) => map.on('click', handleMapClick)} // Manejar el clic en el mapa
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {/* Mostrar el marcador solo si lat y lng están definidos */}
                {lat && lng && (
                    <Marker position={[lat, lng]} icon={new L.Icon({
                        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
                        iconSize: [25, 41],
                        iconAnchor: [12, 41],
                        popupAnchor: [0, -41],
                    })}>
                        <Popup>
                            Coordenadas seleccionadas: {lat.toFixed(4)}, {lng.toFixed(4)}
                        </Popup>
                    </Marker>
                )}
            </MapContainer>
        </div>
    );
};

export default Mapa;
