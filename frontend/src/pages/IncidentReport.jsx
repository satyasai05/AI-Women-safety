import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import { incidentsAPI } from '../utils/api';
import { FileText, MapPin, Camera, AlertCircle, CheckCircle, Clock } from 'lucide-react';

const IncidentReport = () => {
  const [categories, setCategories] = useState([]);
  
  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  
  // Status states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [myReports, setMyReports] = useState([]);

  useEffect(() => {
    fetchCategories();
    fetchMyReports();
  }, []);

  const fetchCategories = async () => {
    try {
      const snapshot = await getDocs(collection(db, "categories"));
      const cats = [];
      snapshot.forEach(doc => {
        cats.push({ value: doc.id, label: doc.data().label });
      });
      setCategories(cats);
      if (cats.length > 0) {
        setCategory(cats[0].value);
      }
    } catch (e) {
      console.error("Failed to load categories:", e);
    }
  };

  const fetchMyReports = async () => {
    try {
      const snapshot = await getDocs(collection(db, "incidents"));
      const reports = [];
      snapshot.forEach(doc => {
        reports.push({ id: doc.id, ...doc.data() });
      });
      setMyReports(reports);
    } catch (e) {
      console.error("Failed to load reports:", e);
    }
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toFixed(6));
          setLongitude(position.coords.longitude.toFixed(6));
        },
        (err) => {
          setError("Failed to fetch coordinates. Ensure GPS permission is authorized.");
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
    }
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !category) {
      setError("Please fill in all mandatory fields.");
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    // Build incident object
    const incident = {
      title,
      description,
      category,
      latitude: latitude || null,
      longitude: longitude || null,
      timestamp: new Date().toISOString()
    };
    try {
      await addDoc(collection(db, "incidents"), incident);
      setSuccess(true);
      
      // Reset form
      setTitle('');
      setDescription('');
      setImageFile(null);
      setLatitude('');
      setLongitude('');
      
      // Re-load reports history list
      fetchMyReports();
    } catch (err) {
      setError(err.message || 'Failed to submit incident report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-6xl mx-auto">
      
      {/* Page Header */}
      <div>
        <h1 className="font-outfit text-2xl sm:text-3xl font-extrabold text-white">Incident Logging & Evidence Portal</h1>
        <p className="text-sm text-gray-400">File detailed logs of street harassment, safety threats, or suspicious activity to keep database records active.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        
        {/* Incident Filing Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-[#14121d]/85">
            
            <div className="flex items-center space-x-2 border-b border-white/5 pb-3 mb-6">
              <FileText className="h-5 w-5 text-safety-400" />
              <h2 className="font-outfit text-base font-bold text-white">Submit New Incident</h2>
            </div>

            {error && (
              <div className="flex items-center space-x-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 mb-6 text-xs text-rose-400">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center space-x-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 mb-6 text-xs text-emerald-400">
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
                <span>Incident report filed successfully. Incident investigators have been alerted.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase">Report Title*</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Summarize the incident (e.g. Catcalling on Main Street)"
                  className="w-full mt-1.5 px-4 py-3 text-xs rounded-xl bg-[#161420] border border-white/10 text-white outline-none focus:border-safety-500/50"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase">Category*</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full mt-1.5 px-4 py-3 text-xs rounded-xl bg-[#161420] border border-white/10 text-white outline-none focus:border-safety-500/50"
                    required
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value} className="bg-[#161420]">{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase">Evidence File (Image)</label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="w-full mt-1.5 text-xs text-gray-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-white/5 file:text-white hover:file:bg-white/10 file:cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase">Description & Details*</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide complete context of the incident (appearance, timing, vehicle logs, behavior etc.)"
                  rows={4}
                  className="w-full mt-1.5 px-4 py-3 text-xs rounded-xl bg-[#161420] border border-white/10 text-white outline-none focus:border-safety-500/50 resize-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase">Geotag Coordinates (Optional)</label>
                <div className="flex gap-3 mt-1.5">
                  <input
                    type="text"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="Latitude"
                    className="flex-1 px-4 py-2.5 text-xs rounded-xl bg-[#161420] border border-white/10 text-white outline-none"
                  />
                  <input
                    type="text"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="Longitude"
                    className="flex-1 px-4 py-2.5 text-xs rounded-xl bg-[#161420] border border-white/10 text-white outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleGetCurrentLocation}
                    className="px-4 py-2 bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors rounded-xl text-xs flex items-center space-x-1 cursor-pointer"
                  >
                    <MapPin className="h-4 w-4 text-safety-400" />
                    <span>Get GPS</span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="glow-btn w-full mt-4 py-3.5 bg-gradient-to-r from-safety-500 to-rose-600 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  <span>File Safety Report</span>
                )}
              </button>

            </form>
          </div>
        </div>

        {/* My Reports List */}
        <div className="lg:col-span-1 glass-panel p-5 rounded-2xl border border-white/5 flex flex-col space-y-4 max-h-[550px] overflow-y-auto">
          <div className="flex items-center space-x-2 border-b border-white/5 pb-3">
            <Clock className="h-5 w-5 text-safety-400" />
            <h2 className="font-outfit text-base font-bold text-white">Filing History</h2>
          </div>

          {myReports.length === 0 ? (
            <p className="text-xs text-gray-500 py-6 text-center">No reports logged.</p>
          ) : (
            <div className="space-y-3 overflow-y-auto">
              {myReports.map((report) => (
                <div key={report.id} className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-2.5">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded-md">
                      {report.category}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                      report.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                      report.status === 'investigating' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                      'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {report.status}
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-white truncate">{report.title}</p>
                    <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">{report.description}</p>
                  </div>
                  
                  <p className="text-[10px] text-gray-500 border-t border-white/5 pt-1.5">
                    {new Date(report.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default IncidentReport;
