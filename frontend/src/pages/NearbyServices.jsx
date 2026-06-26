import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { serviceApi } from "../api/api";

const NearbyServices = () => {
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [services, setServices] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLocation({ lat, lng });
        fetchServices(lat, lng);
      },
      () => toast.error("Unable to capture location."),
    );
  };

  const fetchServices = async (lat, lng) => {
    setLoading(true);
    try {
      const response = await serviceApi.nearby(lat, lng);
      setServices(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch services.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="rounded-[32px] bg-white/80 p-8 shadow-glass backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-slate-900">Nearby Services</h2>
            <p className="mt-2 text-slate-600">Locate local police stations, hospitals, and women help centers.</p>
          </div>
          <button onClick={getLocation} className="rounded-3xl bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#5b21c0]">
            Refresh Location
          </button>
        </div>

        <div className="mt-8 space-y-8">
          {loading && <p className="text-slate-500">Loading nearby services...</p>}

          {services && (
            <div className="grid gap-6 xl:grid-cols-3">
              <ServiceCard title="Police Stations" items={services.police_stations} />
              <ServiceCard title="Hospitals" items={services.hospitals} />
              <ServiceCard title="Women Help Centers" items={services.women_help_centers} />
            </div>
          )}

          {!loading && !services && <p className="text-slate-500">Allow location access to see nearby services.</p>}
        </div>
      </div>
    </motion.div>
  );
};

const ServiceCard = ({ title, items }) => (
  <div className="rounded-[32px] bg-slate-50 p-6 shadow-inner">
    <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
    <div className="mt-6 space-y-4">
      {items?.map((item, index) => (
        <div key={index} className="rounded-3xl bg-white p-4 shadow-sm">
          <p className="font-semibold text-slate-800">{item.name}</p>
          <p className="mt-2 text-sm text-slate-600">{item.address ?? "Location details unavailable"}</p>
          <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
            <span>{item.phone ?? "No phone"}</span>
            <strong>{item.distance}</strong>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default NearbyServices;
