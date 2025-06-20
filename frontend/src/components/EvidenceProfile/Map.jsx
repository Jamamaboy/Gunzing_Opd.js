import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon, LatLngBounds } from 'leaflet';
import { useAuth } from '../../hooks/useAuth';
import useExhibitHistoryData from "../../hooks/useExhibitHistoryData";

function MapBoundsAdjuster({ markers }) {
  const map = useMap();
  
  useEffect(() => {
    if (markers && markers.length > 0) {
      try {
        const bounds = new LatLngBounds();
        markers.forEach(marker => {
          // ถ้ามีข้อมูล latitude และ longitude
          if (marker.originalData && 
              marker.originalData.latitude !== undefined && 
              marker.originalData.longitude !== undefined) {
            bounds.extend([marker.originalData.latitude, marker.originalData.longitude]);
          }
        });
        
        // ถ้ามีพิกัดอย่างน้อย 1 จุด ให้ขยายแผนที่เพื่อแสดงพิกัดทั้งหมด
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [50, 50] });
        }
      } catch (err) {
        console.error("Error adjusting map bounds:", err);
      }
    }
  }, [markers, map]);
  
  return null;
}

const Map = ({ evidence, isMobile }) => {
  const { user } = useAuth();
  
  const {
    data: historyData,
    filteredData,
    isLoading: historyLoading,
    error: historyError,
    fetchExhibitHistoryData
  } = useExhibitHistoryData();

  const [currentLocation, setCurrentLocation] = useState([13.7563, 100.5018]);
  const [isLoading, setIsLoading] = useState(true);
  const [exhibitData, setExhibitData] = useState(null);

  useEffect(() => {
    if (evidence && evidence.exhibit) {
      setExhibitData(evidence.exhibit);
    } else if (evidence) {
      setExhibitData(evidence);
    }
  }, [evidence]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation([
            position.coords.latitude,
            position.coords.longitude
          ]);
          setIsLoading(false);
        },
        (error) => {
          console.log("Error getting user location: ", error);
          setCurrentLocation([13.7563, 100.5018]);
          setIsLoading(false);
        }
      );
    } else {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log("🗺️ === Map History useEffect triggered ===");
    console.log("🗺️ Evidence:", evidence);
    console.log("🗺️ Evidence exhibit_id:", evidence?.exhibit_id);
    console.log("🗺️ Evidence category:", evidence?.category);
    console.log("🗺️ Evidence exhibit category:", evidence?.exhibit?.category);
    console.log("🗺️ User from AuthContext:", user);
    console.log("🗺️ User role:", user?.role);
    console.log("🗺️ User department:", user?.department);
    console.log("🗺️ Current historyData length:", historyData.length);
    
    if (evidence?.exhibit_id && user) {
      const userId = user?.user_id || user?.id;
      const evidenceCategory = evidence?.category || evidence?.exhibit?.category;
      console.log("🗺️ User ID for filtering:", userId);
      console.log("🗺️ Evidence category determined:", evidenceCategory);
      
      // Admin (role.id === 1): Show all exhibit history
      if (user?.role?.id === 1) {
        console.log("✅ Admin user - fetching ALL exhibit history for map");
        fetchExhibitHistoryData({
          exhibitId: evidence.exhibit_id,
          // ไม่ส่ง userId = เห็นทั้งหมด
        });
      }
      // Department Admin (role.id === 2)
      else if (user?.role?.id === 2) {
        // Firearms Department Admin
        if (user?.department === "กลุ่มงานอาวุธปืน") {
          if (evidenceCategory === "ปืน" || evidenceCategory === "อาวุธปืน") {
            // แอดมินปืนดูปืน = เห็นทั้งหมด
            console.log("✅ Firearms Department Admin viewing firearms - fetching ALL exhibit history for map");
            fetchExhibitHistoryData({
              exhibitId: evidence.exhibit_id,
              // ไม่ส่ง userId = เห็นทั้งหมด
            });
          } else {
            // แอดมินปืนดูยา = เห็นเฉพาะของตนเอง
            console.log("✅ Firearms Department Admin viewing non-firearms - fetching USER-SPECIFIC exhibit history for map");
            fetchExhibitHistoryData({
              exhibitId: evidence.exhibit_id,
              userId: userId // ส่ง userId = เห็นเฉพาะของตนเอง
            });
          }
        }
        // Narcotics Department Admin
        else if (user?.department === "กลุ่มงานยาเสพติด") {
          if (evidenceCategory === "ยาเสพติด") {
            // แอดมินยาดูยา = เห็นทั้งหมด
            console.log("✅ Narcotics Department Admin viewing narcotics - fetching ALL exhibit history for map");
            fetchExhibitHistoryData({
              exhibitId: evidence.exhibit_id,
              // ไม่ส่ง userId = เห็นทั้งหมด
            });
          } else {
            // แอดมินยาดูปืน = เห็นเฉพาะของตนเอง
            console.log("✅ Narcotics Department Admin viewing non-narcotics - fetching USER-SPECIFIC exhibit history for map");
            fetchExhibitHistoryData({
              exhibitId: evidence.exhibit_id,
              userId: userId // ส่ง userId = เห็นเฉพาะของตนเอง
            });
          }
        }
        else {
          console.log("✗ Department Admin with unknown department");
          return;
        }
      }
      // Regular user (role.id === 3) or other roles: Show only their own history
      else if (userId) {
        console.log("✅ Regular user - fetching USER-SPECIFIC exhibit history for map");
        fetchExhibitHistoryData({
          exhibitId: evidence.exhibit_id,
          userId: userId // ส่ง userId = เห็นเฉพาะของตนเอง
        });
      }
      else {
        console.log("✗ No user ID available for user-specific history");
      }
    } else {
      console.log("❌ Missing required data:");
      console.log("- Evidence exists:", !!evidence);
      console.log("- Evidence.exhibit_id exists:", !!evidence?.exhibit_id);
      console.log("- User exists:", !!user);
    }
  }, [evidence, user, fetchExhibitHistoryData]);

  const createEvidenceIcon = () => {
    let imageUrl = '/gunpoint.png';
    let iconSize = [50];
    
    if (evidence) {
      if (evidence.category === "ยาเสพติด" || evidence.exhibit?.category === "ยาเสพติด") {
        imageUrl = '/drugpoint.png';
        iconSize = [30];
      } else {
        imageUrl = '/gunpoint.png';
        iconSize = [50];
      }
      
      let images = [];

      if (evidence.images && evidence.images.length > 0) {
        images = [...evidence.images];
      } else if (evidence.example_images && evidence.example_images.length > 0) {
        images = [...evidence.example_images];
      }
      
      if (images.length > 0) {
        images.sort((a, b) => {
          if (a.priority !== undefined && b.priority !== undefined) {
            return a.priority - b.priority;
          } else if (a.priority !== undefined) {
            return -1;
          } else if (b.priority !== undefined) {
            return 1;
          } 
          return (a.id || 0) - (b.id || 0);
        });
        
        imageUrl = images[0].image_url || images[0].url || imageUrl;
      }
    }
    
    return new Icon({
      iconUrl: imageUrl,
      iconSize: iconSize, // ใช้ขนาดที่กำหนดตามประเภท
      iconAnchor: [iconSize[0] / 2, iconSize[1]], // ปรับ anchor ตามขนาด
      popupAnchor: [0, -iconSize[1]] // ปรับ popup anchor ตามขนาด
    });
  };

  const validateCoordinates = (lat, lng) => {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    
    if (isNaN(latitude) || isNaN(longitude)) {
      console.warn("Invalid coordinates: NaN detected", { lat, lng });
      return null;
    }
    
    if (latitude < 5.6 || latitude > 20.5 || longitude < 97.3 || longitude > 105.6) {
      console.warn("Coordinates outside Thailand bounds", { latitude, longitude });
      return null;
    }
    
    return [latitude, longitude];
  };

  const getNoPermissionMessage = () => {
    if (!user) return "กำลังโหลดข้อมูลผู้ใช้...";
    
    if (user?.role?.id === 2 && user?.department === "กลุ่มงานยาเสพติด") {
      if (evidence?.category !== "ยาเสพติด" && evidence?.exhibit?.category !== "ยาเสพติด") {
        return "คุณไม่มีสิทธิ์ดูประวัติของหลักฐานประเภทนี้";
      }
    }

    return "ไม่มีข้อมูลประวัติที่สามารถแสดงบนแผนที่ได้";
  };

  const mapStyle = {
    height: isMobile ? 'calc(100vh - 120px)' : 'calc(100vh - 140px)',
    width: '100%',
    margin: '0 auto',
  };
  
  const containerStyle = {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  };
  
  const loadingStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',
  };
  
  const hasPermission = () => {
    if (!user) return false;
    
    // Admin เห็นทั้งหมด
    if (user?.role?.id === 1) return true;
    
    // Department Admin และ Regular User
    if (user?.role?.id === 2 || user?.role?.id === 3) {
      return true; // มีสิทธิ์เข้าถึง แต่จะเห็นข้อมูลตามสิทธิ์ที่กำหนดใน useEffect
    }
    
    return false;
  };

  const evidenceIcon = createEvidenceIcon();

  const itemsWithCoordinates = historyData.filter(item => {
    console.log("🗺️ Checking item for coordinates:", {
      id: item.id,
      hasOriginalData: !!item.originalData,
      latitude: item.originalData?.latitude,
      longitude: item.originalData?.longitude,
      latType: typeof item.originalData?.latitude,
      lngType: typeof item.originalData?.longitude,
      fullOriginalData: item.originalData
    });
    
    if (!item.originalData || 
        item.originalData.latitude === undefined || 
        item.originalData.longitude === undefined ||
        item.originalData.latitude === null || 
        item.originalData.longitude === null) {
      console.log("❌ Item filtered out - missing coordinates:", item.id);
      return false;
    }
    
    const validCoords = validateCoordinates(
      item.originalData.latitude, 
      item.originalData.longitude
    );
    
    if (!validCoords) {
      console.warn("❌ Filtering out invalid coordinates for item:", item.id, {
        latitude: item.originalData.latitude,
        longitude: item.originalData.longitude
      });
      return false;
    }
    
    console.log("✅ Item passed coordinate validation:", item.id, validCoords);
    
    item.originalData.validatedLatitude = validCoords[0];
    item.originalData.validatedLongitude = validCoords[1];
    
    return true;
  }).map(item => {
    return {
      ...item,
      originalData: {
        ...item.originalData,
        latitude: item.originalData.validatedLatitude,
        longitude: item.originalData.validatedLongitude
      }
    };
  });

  console.log("🗺️ Raw historyData from hook:", historyData);
  console.log("🗺️ Total items from hook:", historyData.length);
  console.log("🗺️ Final items with coordinates:", itemsWithCoordinates.length);
  console.log("🗺️ Items for map rendering:", itemsWithCoordinates.map(item => ({
    id: item.id,
    name: item.name,
    category: item.category,
    date: item.date,
    time: item.time,
    location: item.location,
    lat: item.originalData?.latitude,
    lng: item.originalData?.longitude,
    hasImage: !!item.image
  })));

  if (!evidence || !hasPermission()) {
    return (
      <div style={containerStyle}>
        <div className="map-container w-full h-full rounded-lg overflow-hidden border border-gray-300">
          {isLoading ? (
            <div style={loadingStyle}>
              <div className="text-gray-500">กำลังโหลดแผนที่...</div>
            </div>
          ) : (
            <div style={loadingStyle}>
              <div className="text-gray-500 text-center p-4">
                {getNoPermissionMessage()}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div className="map-container w-full flex-grow rounded-lg overflow-hidden border border-gray-300">
        {isLoading ? (
          <div style={loadingStyle}>
            <div className="text-gray-500">กำลังโหลดแผนที่...</div>
          </div>
        ) : (
          <MapContainer 
            center={currentLocation} 
            zoom={13} 
            style={mapStyle}
            maxBounds={[[5.6, 97.3], [20.5, 105.6]]}
            minZoom={5}
            zoomControl={false}
            className="relative w-full h-full"
          >
            <ZoomControl position="bottomright" />
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {/* แสดงตำแหน่งปัจจุบันของผู้ใช้งาน */}
            <Marker position={currentLocation}>
              <Popup>
                ตำแหน่งปัจจุบันของคุณ
              </Popup>
            </Marker>
            
            {/* แสดงประวัติของ exhibit ทั้งหมดบนแผนที่โดยใช้ evidenceIcon */}
            {itemsWithCoordinates.map((history, index) => {
              console.log(`🗺️ Rendering marker ${index + 1}/${itemsWithCoordinates.length} for item:`, {
                id: history.id,
                name: history.name,
                lat: history.originalData.latitude,
                lng: history.originalData.longitude
              });
              
              // ตรวจสอบพิกัดอีกครั้งก่อนสร้าง Marker
              const validCoords = validateCoordinates(
                history.originalData.latitude, 
                history.originalData.longitude
              );
              
              if (!validCoords) {
                console.warn("❌ Skipping marker with invalid coordinates:", history.id);
                return null;
              }
              
              console.log(`✅ Creating marker for item ${history.id} at:`, validCoords);
              
              // เพิ่ม offset เล็กน้อยถ้าพิกัดเหมือนกัน เพื่อไม่ให้ markers ซ้อนทับกัน
              const offset = index * 0.0001;
              const position = [
                validCoords[0] + (offset * Math.cos(index * 0.5)), 
                validCoords[1] + (offset * Math.sin(index * 0.5))
              ];
              
              console.log(`🗺️ Final marker position for ${history.id}:`, position);
              
              try {
                return (
                  <Marker 
                    key={`marker-${history.id}`}
                    position={position}
                    icon={evidenceIcon}
                  >
                    <Popup>
                      <div className="history-popup">
                        <h3 className="font-semibold">{history.name}</h3>
                        <p>หมวดหมู่: {history.category}</p>
                        <p>วันที่พบ: {history.date} {history.time}</p>
                        <p>สถานที่: {history.location}</p>
                        <p>บันทึกโดย: {history.discoverer_name}</p>
                        <p className="text-xs text-gray-500">
                          พิกัด: {position[0].toFixed(6)}, {position[1].toFixed(6)}
                        </p>
                        <p className="text-xs text-blue-500">
                          รายการที่: {index + 1} / ID: {history.id}
                        </p>
                        {history.image && (
                          <img 
                            src={history.image} 
                            alt={history.name} 
                            className="mt-2 w-full max-h-32 object-contain rounded"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        )}
                      </div>
                    </Popup>
                  </Marker>
                );
              } catch (error) {
                console.error(`❌ Error creating marker for item ${history.id}:`, error);
                return null;
              }
            })}
            
            {/* Component ที่ช่วยปรับ zoom และ center ให้แสดงทุกพิกัดบนแผนที่ */}
            <MapBoundsAdjuster markers={itemsWithCoordinates} />
          </MapContainer>
        )}

        {/* แสดงสถานะการโหลดข้อมูลประวัติ */}
        {historyLoading && (
          <div className="absolute top-4 left-4 bg-white bg-opacity-90 px-3 py-2 rounded shadow">
            <div className="text-sm text-gray-600">กำลังโหลดประวัติ...</div>
          </div>
        )}
        
        {/* แสดงจำนวนประวัติที่พบ */}
        {!historyLoading && itemsWithCoordinates.length > 0 && (
          <div className="absolute top-4 left-4 bg-white bg-opacity-90 px-3 py-2 rounded shadow">
            <div className="text-sm text-gray-600">
              พบประวัติ {itemsWithCoordinates.length} รายการ (มีพิกัด)
            </div>
          </div>
        )}
        
        {/* แสดงข้อความเมื่อไม่มีประวัติ */}
        {!historyLoading && historyError === "empty" && (
          <div className="absolute top-4 left-4 bg-white bg-opacity-90 px-3 py-2 rounded shadow">
            <div className="text-sm text-gray-600">
              ไม่พบประวัติของวัตถุพยานนี้
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Map;