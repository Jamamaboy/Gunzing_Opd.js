
import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';

// Define custom icons for different categories
const legalIcon = new Icon({
  iconUrl: 'https://img.icons8.com/external-icongeek26-linear-colour-icongeek26/64/external-legal-business-and-finance-icongeek26-linear-colour-icongeek26.png',
  iconSize: [35, 35],
  iconAnchor: [22, 94],
  popupAnchor: [-3, -76]
});

const foodIcon = new Icon({
  iconUrl: 'https://img.icons8.com/doodle/48/apple.png',
  iconSize: [35, 35],
  iconAnchor: [22, 94],
  popupAnchor: [-3, -76]
});

const healthIcon = new Icon({
  iconUrl: 'https://img.icons8.com/doodle/48/heart-with-pulse.png',
  iconSize: [35, 35],
  iconAnchor: [22, 94],
  popupAnchor: [-3, -76]
});

const housingIcon = new Icon({
  iconUrl: 'https://pngimg.com/d/glock_PNG1.png',
  iconSize: [38, ],
  iconAnchor: [22, 94],
  popupAnchor: [-3, -76]
});

function AgencyMaps({ selectedCategory }) {
  const [agencies, setAgencies] = useState([]);

  useEffect(() => {
    // Mock data instead of fetching from server
    const mockAgencies = [
      {
        name: "Brooklyn Housing Connect",
        latitude: 40.6462288,
        longitude: -73.95754575,
        fulladdress: "123 Atlantic Avenue, Brooklyn, NY 11201",
        category: "Housing"
      },
      {
        name: "Legal Aid Society",
        latitude: 40.6512200,
        longitude: -73.9495500,
        fulladdress: "456 Court Street, Brooklyn, NY 11231",
        category: "Legal services"
      },
      {
        name: "Brooklyn Community Food Bank",
        latitude: 40.6582300,
        longitude: -73.9625400,
        fulladdress: "789 Bedford Avenue, Brooklyn, NY 11211",
        category: "Food"
      },
      {
        name: "Downtown Health Clinic",
        latitude: 40.6392400,
        longitude: -73.9525600,
        fulladdress: "101 Smith Street, Brooklyn, NY 11201",
        category: "Health"
      },
      {
        name: "Williamsburg Housing Initiative",
        latitude: 40.7082500,
        longitude: -73.9570300,
        fulladdress: "202 Metropolitan Avenue, Brooklyn, NY 11211",
        category: "Housing"
      },
      {
        name: "Immigrant Legal Services",
        latitude: 40.6712600,
        longitude: -73.9785500,
        fulladdress: "303 Flatbush Avenue, Brooklyn, NY 11217",
        category: "Legal services"
      },
      {
        name: "Park Slope Food Pantry",
        latitude: 40.6732700,
        longitude: -73.9825700,
        fulladdress: "404 5th Avenue, Brooklyn, NY 11215",
        category: "Food"
      },
      {
        name: "Brooklyn Heights Medical Center",
        latitude: 40.6932800,
        longitude: -73.9915900,
        fulladdress: "505 Montague Street, Brooklyn, NY 11201",
        category: "Health"
      }
    ];
    
    setAgencies(mockAgencies);
    
    // Keep the fetch code commented out for later use
    // fetch('/agencies')
    //   .then(response => response.json())
    //   .then(data => setAgencies(data))
    //   .catch(error => console.error("Error fetching agencies:", error));
  }, []);

  // Function to get the appropriate icon for a category
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Housing':
        return housingIcon;
      case 'Legal services':
        return legalIcon;
      case 'Food':
        return foodIcon;
      case 'Health':
        return healthIcon;
      default:
        return healthIcon; // fallback
    }
  };

  // Create an array of agency coordinates with additional information
  const agencyCoordinates = agencies.map(agency => ({
    latitude: agency.latitude,
    longitude: agency.longitude,
    name: agency.name,
    fulladdress: agency.fulladdress,
    category: agency.category,
    icon: getCategoryIcon(agency.category),
  }));

  // Filter based on selected category
  const filteredAgencies = selectedCategory
    ? agencyCoordinates.filter(agency => agency.category === selectedCategory)
    : agencyCoordinates;

  return (
    <div className="map-container">
      <MapContainer center={[40.6462288, -73.95754575]} zoom={14} style={{ height: '800px', width: '100%' }}>
        <TileLayer
          url='https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
          attribution="© OpenStreetMap contributors"
        />
        {filteredAgencies.map((agency, index) => (
          <Marker
            key={index}
            position={[agency.latitude, agency.longitude]}
            icon={agency.icon}
          >
            <Popup>
              <b>{agency.name}</b><br />
              <em>{agency.fulladdress}</em><br />
              Category: {agency.category}<br />
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default AgencyMaps;