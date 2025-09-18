import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Plus } from 'lucide-react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocations } from '@/contexts/locations-context';
import { useLocationPermission } from '@/contexts/location-permission-context';
import { useAuth } from '@/contexts/auth-context';
import LocationPopup from '@/components/LocationPopup';
import AddLocationModal from '@/components/AddLocationModal';
import Colors from '@/constants/colors';
import type { Location as LocationType } from '@/types';

export default function MapScreen() {
  const { locations, addLocation } = useLocations();
  const { userCity, userCountry, currentLocation, locationError } = useLocationPermission();
  const { user } = useAuth();
  const [selectedLocation, setSelectedLocation] = useState<LocationType | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLocationCoordinate, setNewLocationCoordinate] = useState<{latitude: number, longitude: number} | null>(null);
  const webViewRef = useRef<WebView>(null);
  const insets = useSafeAreaInsets();

  // Determine map center based on user location or profile
  const getMapCenter = () => {
    // If we have current GPS location, use it
    if (currentLocation) {
      return [currentLocation.coords.latitude, currentLocation.coords.longitude];
    }
    
    // Prioritize user profile location over detected location
    const city = user?.city || userCity;
    const country = user?.country || userCountry;
    
    // Simple city coordinate mapping (in real app, you'd use geocoding API)
    const cityCoordinates: { [key: string]: [number, number] } = {
      'New York': [40.7589, -73.9851],
      'New York City': [40.7589, -73.9851],
      'NYC': [40.7589, -73.9851],
      'Los Angeles': [34.0522, -118.2437],
      'LA': [34.0522, -118.2437],
      'Chicago': [41.8781, -87.6298],
      'London': [51.5074, -0.1278],
      'Paris': [48.8566, 2.3522],
      'Tokyo': [35.6762, 139.6503],
      'Sydney': [-33.8688, 151.2093],
      'San Francisco': [37.7749, -122.4194],
      'Miami': [25.7617, -80.1918],
      'Boston': [42.3601, -71.0589],
      'Seattle': [47.6062, -122.3321],
      'San Diego': [32.7157, -117.1611],
    };
    
    if (city && cityCoordinates[city]) {
      return cityCoordinates[city];
    }
    
    // Default to NYC
    console.log(`Using default location (NYC) - user location: ${city}, ${country}`);
    return [40.7589, -73.9851];
  };



  const handleAddLocation = async (locationData: Omit<LocationType, 'id'>) => {
    if (!locationData.name?.trim() || !locationData.address?.trim()) {
      console.error('Invalid location data: name and address are required');
      return;
    }
    
    try {
      await addLocation(locationData);
      console.log('Location added successfully!');
      // Refresh the map with new location
      if (webViewRef.current) {
        webViewRef.current.postMessage(JSON.stringify({ type: 'refreshLocations', locations }));
      }
    } catch (error) {
      console.error('Error adding location:', error);
    }
  };

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === 'markerClick') {
        const location = locations.find(loc => loc.id === data.locationId);
        if (location) {
          setSelectedLocation(location);
        }
      } else if (data.type === 'addReview') {
        router.push({
          pathname: '/add-review',
          params: { locationId: data.locationId, locationName: data.locationName }
        });
      } else if (data.type === 'mapClick') {
        setNewLocationCoordinate({
          latitude: data.latitude,
          longitude: data.longitude
        });
        setShowAddModal(true);
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };



  const mapHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>CitySync Map</title>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <style>
        body { 
          margin: 0; 
          padding: 0; 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        #map { 
          height: 100vh; 
          width: 100vw; 
        }
        
        .custom-marker {
          width: 40px;
          height: 40px;
          border-radius: 50% 50% 50% 0;
          border: 3px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          cursor: pointer;
          transform: rotate(-45deg);
          transition: all 0.2s ease;
        }
        
        .custom-marker:hover {
          transform: rotate(-45deg) scale(1.1);
          box-shadow: 0 6px 20px rgba(0,0,0,0.25);
        }
        
        .marker-emoji {
          font-size: 18px;
          transform: rotate(45deg);
          line-height: 1;
        }
        
        .leaflet-popup-content-wrapper {
          background: white;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
          border: none;
          overflow: hidden;
        }
        
        .leaflet-popup-content {
          margin: 0;
          padding: 0;
          width: 280px !important;
          max-width: 90vw;
        }
        
        .leaflet-popup-tip {
          background: white;
          border: none;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .popup-header {
          padding: 16px;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .popup-title {
          font-size: 18px;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0 0 8px 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .popup-category {
          font-size: 24px;
          line-height: 1;
        }
        
        .popup-address {
          font-size: 14px;
          color: #666;
          margin: 0 0 8px 0;
        }
        
        .popup-rating {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #666;
        }
        
        .popup-stars {
          color: #ffd700;
          font-size: 16px;
        }
        
        .popup-content {
          padding: 16px;
        }
        
        .popup-description {
          font-size: 14px;
          color: #666;
          line-height: 1.4;
          margin: 0;
        }
        
        .popup-actions {
          padding: 12px 16px;
          background: #f8f9fa;
          display: flex;
          gap: 8px;
        }
        
        .popup-btn {
          flex: 1;
          padding: 8px 12px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .popup-btn-primary {
          background: ${Colors.light.tint};
          color: white;
        }
        
        .popup-btn-primary:hover {
          background: ${Colors.light.tint}dd;
          transform: translateY(-1px);
        }
        
        .popup-btn-secondary {
          background: white;
          color: ${Colors.light.tint};
          border: 1px solid ${Colors.light.tint};
        }
        
        .popup-btn-secondary:hover {
          background: ${Colors.light.tint}11;
        }
        
        @media (max-width: 480px) {
          .leaflet-popup-content {
            width: 260px !important;
          }
          
          .popup-title {
            font-size: 16px;
          }
          
          .custom-marker {
            width: 36px;
            height: 36px;
          }
          
          .marker-emoji {
            font-size: 16px;
          }
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <script>
        // Initialize map with user's location or default
        const mapCenter = ${JSON.stringify(getMapCenter())};
        const map = L.map('map', {
          center: mapCenter,
          zoom: 12,
          zoomControl: true,
          scrollWheelZoom: true,
          doubleClickZoom: true,
          boxZoom: true,
          keyboard: true,
          dragging: true,
          touchZoom: true
        });
        
        // Add Carto Light tiles for modern, clean look
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
          attribution: '© OpenStreetMap contributors, © CARTO',
          subdomains: 'abcd',
          maxZoom: 19
        }).addTo(map);
        
        const locations = ${JSON.stringify(locations)};
        
        // Category configurations with colors and emojis
        const categoryConfig = {
          'restaurant': { color: '#e74c3c', emoji: '🍕' },
          'park': { color: '#1abc9c', emoji: '🌳' },
          'museum': { color: '#3498db', emoji: '🖼️' },
          'landmark': { color: '#27ae60', emoji: '🏛️' }
        };
        
        // Store markers for smooth interactions
        const markers = [];
        
        // Add markers for each location with custom styling
        locations.forEach(location => {
          const config = categoryConfig[location.category.toLowerCase()] || 
                        { color: '${Colors.light.tint}', emoji: '📍' };
          
          const customIcon = L.divIcon({
            className: 'custom-marker-container',
            html: \`<div class="custom-marker" style="background-color: \${config.color};"><span class="marker-emoji">\${config.emoji}</span></div>\`,
            iconSize: [40, 40],
            iconAnchor: [20, 35],
            popupAnchor: [0, -35]
          });
          
          // Generate star rating display
          const generateStars = (rating) => {
            const fullStars = Math.floor(rating);
            const hasHalfStar = rating % 1 >= 0.5;
            let stars = '★'.repeat(fullStars);
            if (hasHalfStar) stars += '☆';
            const emptyStars = 5 - Math.ceil(rating);
            stars += '☆'.repeat(emptyStars);
            return stars;
          };
          
          // Create modern popup content
          const popupContent = \`
            <div class="popup-header">
              <h3 class="popup-title">
                <span class="popup-category">\${config.emoji}</span>
                \${location.name}
              </h3>
              <p class="popup-address">\${location.address}</p>
              <div class="popup-rating">
                <span class="popup-stars">\${generateStars(location.averageRating)}</span>
                <span>\${location.averageRating.toFixed(1)} (\${location.totalReviews} reviews)</span>
              </div>
            </div>
            <div class="popup-content">
              <p class="popup-description">Discover what makes this \${location.category.toLowerCase()} special according to fellow CitySync users.</p>
            </div>
            <div class="popup-actions">
              <button class="popup-btn popup-btn-secondary" onclick="addReview('\${location.id}', '\${location.name}')">Add Review</button>
              <button class="popup-btn popup-btn-primary" onclick="viewDetails('\${location.id}')">View Details</button>
            </div>
          \`;
          
          const marker = L.marker([location.latitude, location.longitude], { icon: customIcon })
            .addTo(map)
            .bindPopup(popupContent, {
              maxWidth: 300,
              className: 'custom-popup'
            })
            .on('click', (e) => {
              // Smooth fly-to animation when marker is clicked
              map.flyTo(e.latlng, Math.max(map.getZoom(), 15), {
                animate: true,
                duration: 0.8,
                easeLinearity: 0.25
              });
              
              // Small delay to let the animation start before opening popup
              setTimeout(() => {
                marker.openPopup();
              }, 200);
            });
            
          markers.push(marker);
        });
        
        // Global functions for popup buttons
        window.viewDetails = (locationId) => {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'markerClick',
            locationId: locationId
          }));
        };
        
        window.addReview = (locationId, locationName) => {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'addReview',
            locationId: locationId,
            locationName: locationName
          }));
        };
        
        // Handle map clicks for adding new locations with smooth animation
        map.on('click', (e) => {
          // Close any open popups first
          map.closePopup();
          
          // Smooth zoom to clicked location
          map.flyTo(e.latlng, Math.max(map.getZoom(), 16), {
            animate: true,
            duration: 0.6
          });
          
          // Send coordinates to React Native after animation
          setTimeout(() => {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'mapClick',
              latitude: e.latlng.lat,
              longitude: e.latlng.lng
            }));
          }, 300);
        });
        
        // Listen for messages from React Native
        window.addEventListener('message', (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'refreshLocations') {
              // Smooth refresh - could be enhanced to add new markers dynamically
              location.reload();
            }
          } catch (error) {
            console.error('Error parsing message:', error);
          }
        });
        
        // Add smooth zoom controls styling
        setTimeout(() => {
          const zoomControls = document.querySelector('.leaflet-control-zoom');
          if (zoomControls) {
            zoomControls.style.border = 'none';
            zoomControls.style.borderRadius = '12px';
            zoomControls.style.overflow = 'hidden';
            zoomControls.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
          }
        }, 100);
      </script>
    </body>
    </html>
  `;



  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.title}>CitySync Map</Text>
            {locationError && (
              <Text style={styles.errorSubtitle}>Location services unavailable</Text>
            )}
          </View>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => {
              console.log('Tap anywhere on the map to add a new location');
            }}
          >
            <Plus color={Colors.light.background} size={20} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.mapContainer}>
        <WebView
          ref={webViewRef}
          source={{ html: mapHTML }}
          style={styles.map}
          onMessage={handleWebViewMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
          scrollEnabled={false}
          bounces={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {selectedLocation && (
        <LocationPopup
          location={selectedLocation}
          onClose={() => setSelectedLocation(null)}
        />
      )}

      {showAddModal && newLocationCoordinate && (
        <AddLocationModal
          coordinate={newLocationCoordinate}
          onClose={() => {
            setShowAddModal(false);
            setNewLocationCoordinate(null);
          }}
          onAddLocation={handleAddLocation}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: Colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
  },

  errorSubtitle: {
    fontSize: 12,
    color: Colors.light.error,
    marginTop: 2,
  },

  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  addButton: {
    backgroundColor: Colors.light.tint,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});