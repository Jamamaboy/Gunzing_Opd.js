import React, { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const RecordMap = ({ setCoordinates }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const autoScrollRef = useRef(null);
  const edgeThreshold = 50;
  const longdo_api_key = import.meta.env.VITE_LONGDO_MAP_API_KEY;

  // Function to handle auto-scrolling during drag
  const setupMarkerDragBehavior = (marker) => {
    marker.on('dragstart', () => {
      // Setup the auto-scroll interval when drag starts
      if (autoScrollRef.current) clearInterval(autoScrollRef.current);
      
      autoScrollRef.current = setInterval(() => {
        if (!mapInstance.current) return;
        
        const markerPoint = mapInstance.current.latLngToContainerPoint(marker.getLatLng());
        const mapSize = mapInstance.current.getSize();
        let needToScroll = false;
        let scrollX = 0;
        let scrollY = 0;
        const scrollStep = 10; // pixels to scroll per interval
        
        // Check if marker is near map edges
        if (markerPoint.x < edgeThreshold) {
          scrollX = -scrollStep;
          needToScroll = true;
        } else if (markerPoint.x > mapSize.x - edgeThreshold) {
          scrollX = scrollStep;
          needToScroll = true;
        }
        
        if (markerPoint.y < edgeThreshold) {
          scrollY = -scrollStep;
          needToScroll = true;
        } else if (markerPoint.y > mapSize.y - edgeThreshold) {
          scrollY = scrollStep;
          needToScroll = true;
        }
        
        if (needToScroll) {
          // Get the current center point
          const centerPoint = mapInstance.current.getSize().divideBy(2);
          const targetPoint = centerPoint.add(new L.Point(scrollX, scrollY));
          
          // Convert to lat/lng and pan
          const targetLatLng = mapInstance.current.containerPointToLatLng(targetPoint);
          mapInstance.current.panTo(targetLatLng, {
            duration: 0.1 // Very short duration for smooth continuous scrolling
          });
        }
      }, 50); // Check every 50ms
    });
    
    marker.on('dragend', () => {
      // Clear auto-scroll interval when drag ends
      if (autoScrollRef.current) {
        clearInterval(autoScrollRef.current);
        autoScrollRef.current = null;
      }
      
      const newPosition = marker.getLatLng();
      console.log('ตำแหน่งที่เลือก:', newPosition);
      
      // Send coordinates to parent component to trigger reverse geocoding
      if (setCoordinates) {
        setCoordinates({
          lat: newPosition.lat,
          lng: newPosition.lng
        });
      }
      
      // Update marker popup to show we're getting location data
      marker.setPopupContent('กำลังค้นหาข้อมูลตำแหน่ง...');
      
      // Fetch address data for this location and update popup
      fetchLocationData(newPosition.lat, newPosition.lng)
        .then(address => {
          if (address) {
            const addressText = `${address.subdistrict || ''}, ${address.district || ''}, ${address.province || ''} ${address.postcode || ''}`;
            marker.setPopupContent(`ตำแหน่งที่เลือก: ${addressText}<br/>(สามารถลากเพื่อเปลี่ยนตำแหน่ง)`);
          } else {
            marker.setPopupContent('ตำแหน่งที่เลือก (สามารถลากเพื่อเปลี่ยนตำแหน่ง)');
          }
        })
        .catch(() => {
          marker.setPopupContent('ตำแหน่งที่เลือก (สามารถลากเพื่อเปลี่ยนตำแหน่ง)');
        });
      
      // Center the map on the final marker position
      mapInstance.current.panTo(newPosition);
    });
  };
  
  // Function to fetch location data using Longdo Map API
  const fetchLocationData = async (lat, lng) => {
    try {
      // Replace YOUR-KEY-API with your actual API key
      const response = await fetch(`https://api.longdo.com/map/services/address?lon=${lng}&lat=${lat}&noelevation=1&key=${longdo_api_key}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch address data');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching address data:', error);
      return null;
    }
  };

  useEffect(() => {
    // Initialize map if mapRef is available and map isn't already initialized
    if (mapRef.current && !mapInstance.current) {
      // Default view centered on Thailand
      const defaultView = [13.7563, 100.5018]; // Bangkok coordinates
      const initialZoom = 5;
      
      // Create map instance
      mapInstance.current = L.map(mapRef.current).setView(defaultView, initialZoom);

      // Add OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstance.current);

      // Try to get user's current location
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          
          // Center map on user location and zoom in
          mapInstance.current.setView([latitude, longitude], 15);
          
          // Add marker at user's location
          markerRef.current = L.marker([latitude, longitude], { draggable: true })
            .addTo(mapInstance.current)
            .bindPopup('ตำแหน่งปัจจุบันของคุณ (สามารถลากเพื่อเปลี่ยนตำแหน่ง)')
            .openPopup();

          // Setup the drag behavior
          setupMarkerDragBehavior(markerRef.current);
          
          // Trigger reverse geocoding for the initial location
          if (setCoordinates) {
            setCoordinates({
              lat: latitude,
              lng: longitude
            });
          }
          
          setIsLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsLoading(false);
        },
        { enableHighAccuracy: true }
      );
      
      // Allow clicking on map to add or change marker
      mapInstance.current.on('click', async (e) => {
        if (markerRef.current) {
          mapInstance.current.removeLayer(markerRef.current);
        }
        
        // Create a marker with temporary loading popup
        markerRef.current = L.marker(e.latlng, { draggable: true })
          .addTo(mapInstance.current)
          .bindPopup('กำลังค้นหาข้อมูลตำแหน่ง...')
          .openPopup();
        
        console.log('ตำแหน่งที่เลือก:', e.latlng);
        
        // Send coordinates to parent component to trigger reverse geocoding
        if (setCoordinates) {
          setCoordinates({
            lat: e.latlng.lat,
            lng: e.latlng.lng
          });
        }
        
        // Fetch address data for this location and update popup
        try {
          const address = await fetchLocationData(e.latlng.lat, e.latlng.lng);
          if (address) {
            const addressText = `${address.subdistrict || ''}, ${address.district || ''}, ${address.province || ''} ${address.postcode || ''}`;
            markerRef.current.setPopupContent(`ตำแหน่งที่เลือก: ${addressText}<br/>(สามารถลากเพื่อเปลี่ยนตำแหน่ง)`);
          } else {
            markerRef.current.setPopupContent('ตำแหน่งที่เลือก (สามารถลากเพื่อเปลี่ยนตำแหน่ง)');
          }
        } catch (error) {
          markerRef.current.setPopupContent('ตำแหน่งที่เลือก (สามารถลากเพื่อเปลี่ยนตำแหน่ง)');
        }
        
        // Center the map on the marker after placing it
        mapInstance.current.panTo(e.latlng);
        
        // Setup the drag behavior
        setupMarkerDragBehavior(markerRef.current);
      });
    }

    // Cleanup function to remove map when component unmounts
    return () => {
      if (autoScrollRef.current) {
        clearInterval(autoScrollRef.current);
        autoScrollRef.current = null;
      }
      
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [setCoordinates]);

  return (
    <div className="w-full h-full flex flex-col">
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-70 z-10 flex items-center justify-center">
          <span className="text-gray-600">กำลังโหลดแผนที่...</span>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full z-0" />
    </div>
  );
};

export default RecordMap;