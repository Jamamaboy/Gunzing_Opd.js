import React, { useState } from "react";
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const MapContent = () => {
  return (
    <div>
      {/* แผนที่หลัก */}
      <MapContainer
        style={{ width: '100%', height: '100vh' }}
        center={[12, 100]}
        zoom={6}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
      </MapContainer>
    </div>
  );
};

export default MapContent;