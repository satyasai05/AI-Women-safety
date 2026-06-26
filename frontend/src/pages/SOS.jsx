import { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { sosApi } from "../api/api";

const SOS = () => {
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [status, setStatus] = useState(null);
  const [notifiedCount, setNotifiedCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude });
        toast.success("Location captured.");
      },
      () => toast.error("Unable to capture location."),
    );
  };

  const sendSOS = async () => {
    if (!location.latitude || !location.longitude) {
      toast.error("Please allow location access first.");
      return;
    }
    setLoading(true);
    try {
      const response = await sosApi.send({ latitude: location.latitude, longitude: location.longitude, message: "Emergency Help Needed" });
      setStatus(response.data.status);
      setNotifiedCount(response.data.contacts_notified);
      toast.success("SOS alert sent successfully.");
    } catch (error) {
      toast.error(error.response?.data?.message || "SOS failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="rounded-[32px] bg-white/80 p-8 shadow-glass backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-slate-900">SOS Emergency</h2>
            <p className="mt-2 text-slate-600">Send an emergency alert to your saved contacts with one tap.</p>
          </div>
          <button
            onClick={sendSOS}
            disabled={loading}
            className="rounded-3xl bg-danger px-7 py-4 text-base font-semibold text-white transition hover:bg-red-600 disabled:opacity-60"
          >
            {loading ? "Sending alert..." : "SOS"}
          </button>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-[32px] bg-slate-50 p-6 shadow-inner">
            <p className="text-sm uppercase tracking-[0.2em] text-secondary">Latitude</p>
            <p className="mt-3 text-2xl font-semibold text-slate-900">{location.latitude ?? "--"}</p>
          </div>
          <div className="rounded-[32px] bg-slate-50 p-6 shadow-inner">
            <p className="text-sm uppercase tracking-[0.2em] text-secondary">Longitude</p>
            <p className="mt-3 text-2xl font-semibold text-slate-900">{location.longitude ?? "--"}</p>
          </div>
          <div className="rounded-[32px] bg-slate-50 p-6 shadow-inner">
            <p className="text-sm uppercase tracking-[0.2em] text-secondary">Status</p>
            <p className="mt-3 text-2xl font-semibold text-slate-900">{status ?? "Not sent"}</p>
          </div>
        </div>

        <div className="mt-8 rounded-[32px] bg-purple-50 p-6 text-slate-700 shadow-inner">
          <p className="font-semibold">Emergency Contacts Notified</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">{notifiedCount}</p>
          <button
            onClick={fetchLocation}
            className="mt-6 inline-flex rounded-3xl bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#5b21c0]"
          >
            Capture Location
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default SOS;
