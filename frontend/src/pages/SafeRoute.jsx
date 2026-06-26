import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { mapAPI } from '../utils/api';
import { MapPin, ShieldAlert, PhoneCall, Heart, Search, Loader2 } from 'lucide-react';
import L from 'leaflet';

// Fix for leaflet markers styling using Tailwind divIcon
const createCustomIcon = (color, bgClass) => {
  return L.divIcon({
    html: `<div class="h-6 w-6 rounded-full border-2 border-white flex items-center justify-center text-white ${bgClass} shadow-md shadow-black/30">📍</div>`,
    className: 'custom-leaflet-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 24],
  });
};

const userIcon = createCustomIcon('blue', 'bg-blue-500');
const policeIcon = createCustomIcon('indigo', 'bg-indigo-600');
const hospitalIcon = createCustomIcon('rose', 'bg-rose-500');
const destinationIcon = createCustomIcon('emerald', 'bg-emerald-500');

// Component to dynamically update map center focus
const ChangeMapFocus = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 14);
    }
  }, [center, map]);
  return null;
};

const SafeRoute = () => {
  const [currentLoc, setCurrentLoc] = useState([28.6139, 77.2090]); // Fallback Delhi
  const [loading, setLoading] = useState(true);
  const [destination, setDestination] = useState('');
  const [routeLine, setRouteLine] = useState(null);
  const [searching, setSearching] = useState(false);
  const [nearbyServices, setNearbyServices] = useState([]);
  
  // Toggle states
  const [showPolice, setShowPolice] = useState(true);
  const [showHospitals, setShowHospitals] = useState(true);

  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = [position.coords.latitude, position.coords.longitude];
          setCurrentLoc(coords);
          fetchNearbyServices(position.coords.latitude, position.coords.longitude);
          setLoading(false);
        },
        (error) => {
          console.warn("Geolocation access denied, using Delhi fallback.");
          fetchNearbyServices(currentLoc[0], currentLoc[1]);
          setLoading(false);
        }
      );
    } else {
      fetchNearbyServices(currentLoc[0], currentLoc[1]);
      setLoading(false);
    }
  };

  const fetchNearbyServices = async (lat, lng) => {
    try {
      const response = await mapAPI.getNearby(lat, lng);
      setNearbyServices(response.data.services);
    } catch (e) {
      console.error("Failed to load nearby services:", e);
    }
  };

  const handleRouteSearch = (e) => {
    e.preventDefault();
    if (!destination.trim()) return;

    setSearching(true);
    // Simulate safety routing calculation linking current location to offset destination
    setTimeout(() => {
      const destLat = currentLoc[0] + 0.015;
      const destLng = currentLoc[1] + 0.012;
      
      setRouteLine([
        currentLoc,
        [currentLoc[0] + 0.005, currentLoc[1] + 0.003],
        [currentLoc[0] + 0.010, currentLoc[1] + 0.008],
        [destLat, destLng]
      ]);
      setSearching(false);
    }, 1200);
  };

  const filteredServices = nearbyServices.filter(service => {
    if (service.type === 'police') return showPolice;
    if (service.type === 'hospital') return showHospitals;
    return true;
  });

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] w-full items-center justify-center bg-[#0c0b13]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-t-safety-500 border-white/5"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Page Header */}
      <div>
        <h1 className="font-outfit text-2xl sm:text-3xl font-extrabold text-white">Safe Route & Geolocation Navigator</h1>
        <p className="text-sm text-gray-400">Plot protected routes and view nearby essential safety outposts.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        
        {/* Navigation Sidebar controls */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Safe Route Planner */}
          <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-4">
            <h3 className="font-outfit text-sm font-bold uppercase tracking-wider text-white">Route Planner</h3>
            <form onSubmit={handleRouteSearch} className="space-y-3">
              <div>
                <label className="text-[10px] text-gray-400 font-bold uppercase">Current Point</label>
                <input
                  type="text"
                  value="My Device Geolocation"
                  disabled
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-white/5 border border-white/10 text-gray-400 outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 font-bold uppercase">Destination Address</label>
                <div className="relative mt-1">
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Enter city, street, or venue"
                    className="w-full px-3 py-2.5 pl-8 text-xs rounded-xl bg-[#161420] border border-white/10 text-white outline-none focus:border-safety-500/50"
                    required
                  />
                  <Search className="absolute left-2.5 top-3 h-3.5 w-3.5 text-gray-500" />
                </div>
              </div>
              <button
                type="submit"
                disabled={searching}
                className="glow-btn w-full py-2.5 bg-gradient-to-r from-safety-500 to-rose-600 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                {searching ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Mapping Safe Path...</span>
                  </>
                ) : (
                  <span>Map Safe Passage</span>
                )}
              </button>
            </form>
          </div>

          {/* Map Filters & Layers */}
          <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-4">
            <h3 className="font-outfit text-sm font-bold uppercase tracking-wider text-white">Shield Overlays</h3>
            
            <div className="space-y-2">
              <label className="flex items-center space-x-3 p-2.5 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                <input
                  type="checkbox"
                  checked={showPolice}
                  onChange={(e) => setShowPolice(e.target.checked)}
                  className="rounded border-gray-300 text-safety-500 focus:ring-safety-500"
                />
                <div className="flex items-center space-x-2 text-xs">
                  <div className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
                  <span className="font-semibold text-white">Police Stations</span>
                </div>
              </label>

              <label className="flex items-center space-x-3 p-2.5 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                <input
                  type="checkbox"
                  checked={showHospitals}
                  onChange={(e) => setShowHospitals(e.target.checked)}
                  className="rounded border-gray-300 text-rose-500 focus:ring-rose-500"
                />
                <div className="flex items-center space-x-2 text-xs">
                  <div className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                  <span className="font-semibold text-white">Hospitals & Trauma</span>
                </div>
              </label>
            </div>
          </div>

        </div>

        {/* Leaflet Map Area */}
        <div className="lg:col-span-3 aspect-video lg:aspect-auto lg:h-[550px] relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
          <MapContainer center={currentLoc} zoom={14} scrollWheelZoom={true}>
            
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <ChangeMapFocus center={currentLoc} />

            {/* Current user Position marker */}
            <Marker position={currentLoc} icon={userIcon}>
              <Popup>
                <div className="text-xs text-gray-800 space-y-1">
                  <p className="font-bold">You are here</p>
                  <p>Shielding active.</p>
                </div>
              </Popup>
            </Marker>

            {/* Plot destination marker if route calculated */}
            {routeLine && (
              <Marker position={routeLine[routeLine.length - 1]} icon={destinationIcon}>
                <Popup>
                  <div className="text-xs text-gray-800 font-bold">
                    Destination Safely Mapped
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Plot safe navigation lines */}
            {routeLine && (
              <Polyline
                positions={routeLine}
                color="#f43f5e"
                weight={4}
                opacity={0.8}
                dashArray="10, 10"
              />
            )}

            {/* Plot nearby medical and police resources */}
            {filteredServices.map((srv) => (
              <Marker
                key={srv.id}
                position={[srv.lat, srv.lng]}
                icon={srv.type === 'police' ? policeIcon : hospitalIcon}
              >
                <Popup>
                  <div className="text-xs text-gray-800 space-y-1 min-w-[150px]">
                    <div className="flex items-center space-x-1.5 font-bold text-gray-900 border-b border-gray-200 pb-1">
                      {srv.type === 'police' ? <ShieldAlert className="h-3.5 w-3.5 text-indigo-600" /> : <Heart className="h-3.5 w-3.5 text-rose-500" />}
                      <span>{srv.name}</span>
                    </div>
                    <p className="text-[10px] text-gray-600">{srv.address}</p>
                    <p className="text-[9px] font-bold text-safety-500 uppercase tracking-widest mt-1">
                      {srv.type} post
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}

          </MapContainer>
        </div>

      </div>

    </div>
  );
};

export default SafeRoute;
