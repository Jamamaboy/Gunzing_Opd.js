import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const LongdoMap = () => {
  const mapRef = useRef(null);

  useEffect(() => {
    // Initialize the map only after component is mounted
    if (mapRef.current !== null) {
      // Create map instance centered on Bangkok
      const map = L.map(mapRef.current).setView([13.75318, 100.53173], 13);
      
      // Define Longdo map tile server URL
      const longdomapserver = 
        "http://ms.longdo.com/mmmap/tile.php?zoom={z}&x={x}&y={y}&key=[12a91099fdf18c01e89d872f6175c84b]&proj=epsg3857&HD=1";
      
      // Add tile layer to map
      L.tileLayer(longdomapserver, {
        attribution: "© Longdo Map"
      }).addTo(map);

      // Cleanup function to remove map when component unmounts
      return () => {
        map.remove();
      };
    }
  }, []); // Empty dependency array ensures this runs once after initial render

  return (
    <div id="map" ref={mapRef} style={{ height: '100%', width: '100%' }}></div>
  );
};

export default LongdoMap;