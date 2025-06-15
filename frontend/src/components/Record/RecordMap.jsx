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
  const [isMapMounted, setIsMapMounted] = useState(false);

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
      // Send coordinates to parent component to trigger reverse geocoding
      if (setCoordinates) {
        setCoordinates({
          lat: newPosition.lat,
          lng: newPosition.lng
        });
      }
      
      // ลบส่วนที่เกี่ยวกับ popup ทั้งหมด
      
      // Center the map on the final marker position
      if (mapInstance.current) {
        mapInstance.current.panTo(newPosition);
      }
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

  // Check if the DOM element is actually ready
  useEffect(() => {
    if (mapRef.current && !isMapMounted) {
      setIsMapMounted(true);
    }
  }, [isMapMounted]);

  useEffect(() => {
    // Initialize map only if mapRef is available, map isn't already initialized, and the element is actually mounted
    if (mapRef.current && !mapInstance.current && isMapMounted) {
      try {
        // Default view centered on Thailand
        const defaultView = [13.7563, 100.5018]; // Bangkok coordinates
        const initialZoom = 5;
        
        // Create map instance safely
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
            
            // Safety check before using mapInstance
            if (!mapInstance.current) {
              console.warn("Map instance was destroyed before location was retrieved");
              return;
            }
            
            // Center map on user location and zoom in
            mapInstance.current.setView([latitude, longitude], 15);
            
            // Add marker at user's location without popup
            markerRef.current = L.marker([latitude, longitude], { draggable: true })
              .addTo(mapInstance.current);

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
          
          // Create a marker without popup
          markerRef.current = L.marker(e.latlng, { draggable: true })
            .addTo(mapInstance.current);
          
          // Send coordinates to parent component to trigger reverse geocoding
          if (setCoordinates) {
            setCoordinates({
              lat: e.latlng.lat,
              lng: e.latlng.lng
            });
          }
          
          // Center the map on the marker after placing it
          mapInstance.current.panTo(e.latlng);
          
          // Setup the drag behavior
          setupMarkerDragBehavior(markerRef.current);
        });
      } catch (error) {
        console.error("Error initializing map:", error);
        setIsLoading(false);
      }
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
  }, [setCoordinates, isMapMounted]);

  // Update leaflet container size when the map is shown in modal
  useEffect(() => {
    if (mapInstance.current) {
      // Small timeout to ensure the DOM has updated
      const resizeTimer = setTimeout(() => {
        mapInstance.current.invalidateSize();
      }, 100);

      return () => clearTimeout(resizeTimer);
    }
  }, [isMapMounted]);

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