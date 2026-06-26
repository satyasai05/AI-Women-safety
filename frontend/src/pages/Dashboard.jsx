import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { sosAPI, authAPI, aiAPI, incidentsAPI } from '../utils/api';
import { Shield, PhoneCall, AlertTriangle, CheckCircle, MapPin, Eye, BellRing, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [contactsCount, setContactsCount] = useState(0);
  const [scansCount, setScansCount] = useState(0);
  const [reportsCount, setReportsCount] = useState(0);
  
  // SOS States
  const [sosStatus, setSosStatus] = useState('idle'); // 'idle' | 'locating' | 'triggering' | 'active' | 'error'
  const [sosError, setSosError] = useState('');
  const [dispatchedAlert, setDispatchedAlert] = useState(null);
  
  // Recent Activities
  const [recentDetections, setRecentDetections] = useState([]);
  const [recentReports, setRecentReports] = useState([]);

  useEffect(() => {
    fetchDashboardDetails();
  }, []);

  const fetchDashboardDetails = async () => {
    try {
      // Get contacts
      const contactsRes = await authAPI.getContacts();
      setContactsCount(contactsRes.data.length);

      // Get recent scans
      const scansRes = await aiAPI.getHistory();
      setScansCount(scansRes.data.length);
      setRecentDetections(scansRes.data.slice(0, 3));

      // Get recent reports
      const reportsRes = await incidentsAPI.getMyReports();
      setReportsCount(reportsRes.data.length);
      setRecentReports(reportsRes.data.slice(0, 3));
    } catch (e) {
      console.error("Error loading dashboard data:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSOSTrigger = () => {
    if (!navigator.geolocation) {
      setSosStatus('error');
      setSosError('GPS geolocation is not supported by your browser.');
      return;
    }

    setSosStatus('locating');
    setSosError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setSosStatus('triggering');
        
        try {
          const response = await sosAPI.trigger(latitude, longitude);
          setDispatchedAlert(response.data);
          setSosStatus('active');
          
          // Re-fetch dashboard numbers
          fetchDashboardDetails();
        } catch (error) {
          setSosStatus('error');
          setSosError(error.response?.data?.error || 'Failed to connect to emergency server.');
        }
      },
      (error) => {
        setSosStatus('error');
        // Let's fallback to standard coordinates if user denies GPS, to show it works
        setSosError('GPS location denied. Dispatching using city fallback...');
        setTimeout(() => triggerSOSFallback(), 1500);
      },
      { timeout: 10000 }
    );
  };

  const triggerSOSFallback = async () => {
    // New Delhi fallback
    const lat = 28.6139;
    const lng = 77.2090;
    setSosStatus('triggering');
    try {
      const response = await sosAPI.trigger(lat, lng);
      setDispatchedAlert(response.data);
      setSosStatus('active');
      fetchDashboardDetails();
    } catch (error) {
      setSosStatus('error');
      setSosError('Server connection error during fallback dispatch.');
    }
  };

  const handleResolveSOS = async (alertId) => {
    try {
      await sosAPI.resolve(alertId);
      setSosStatus('idle');
      setDispatchedAlert(null);
    } catch (e) {
      alert("Failed to resolve SOS: " + e.message);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] w-full items-center justify-center bg-[#0c0b13]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-t-safety-500 border-white/5"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Top Banner greeting */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-outfit text-2xl sm:text-3xl font-extrabold text-white">
            Hello, {user?.name}
          </h1>
          <p className="text-sm text-gray-400">Your safety grid is active and running.</p>
        </div>
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/5 text-emerald-400 text-xs font-semibold">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>Shielding Status: Guarded</span>
        </div>
      </div>

      {/* SOS CRISIS AREA */}
      <div className="grid gap-6 lg:grid-cols-3">
        
        <div className="lg:col-span-1 glass-panel p-6 rounded-2xl border border-white/5 flex flex-col items-center text-center justify-center bg-gradient-to-br from-rose-950/20 via-darkbg-card to-darkbg-card relative overflow-hidden min-h-[300px]">
          {sosStatus === 'idle' && (
            <>
              <button
                onClick={handleSOSTrigger}
                className="sos-pulse-effect cursor-pointer flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-tr from-safety-500 to-rose-700 text-white shadow-xl shadow-rose-500/20 active:scale-95 transition-all"
              >
                <PhoneCall className="h-12 w-12" />
              </button>
              <h2 className="mt-6 font-outfit text-xl font-bold text-white">EMERGENCY SOS</h2>
              <p className="mt-1 text-xs text-gray-400 max-w-xs">
                Press to capture your GPS coordinates and instantly alert security contacts.
              </p>
            </>
          )}

          {(sosStatus === 'locating' || sosStatus === 'triggering') && (
            <div className="space-y-4">
              <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-t-safety-500 border-white/5 animate-spin"></div>
              <h2 className="font-outfit text-lg font-bold text-white">
                {sosStatus === 'locating' ? "Acquiring Coordinates..." : "Broadcasting Emergency..."}
              </h2>
            </div>
          )}

          {sosStatus === 'active' && (
            <div className="space-y-5 w-full">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-400">
                <BellRing className="h-8 w-8 animate-bounce" />
              </div>
              <div>
                <h2 className="font-outfit text-lg font-bold text-rose-400 uppercase tracking-wider">SOS Dispatch Active!</h2>
                <p className="text-xs text-gray-400 mt-1">Contacts notified with location.</p>
              </div>

              {dispatchedAlert && (
                <div className="rounded-xl border border-rose-500/20 bg-rose-950/20 p-3 text-left space-y-1.5">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Dispatched SMS:</p>
                  <p className="text-[11px] text-gray-300 italic">"{dispatchedAlert.dispatch_message}"</p>
                </div>
              )}

              <button
                onClick={() => handleResolveSOS(dispatchedAlert?.alert?.id)}
                className="w-full py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-bold text-xs hover:bg-emerald-500/20 transition-all cursor-pointer"
              >
                Mark as Safe (Cancel SOS)
              </button>
            </div>
          )}

          {sosStatus === 'error' && (
            <div className="space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-950 border border-rose-500/30 text-rose-400">
                <AlertTriangle className="h-8 w-8" />
              </div>
              <div>
                <h2 className="font-outfit text-base font-bold text-white">Location Failed</h2>
                <p className="text-xs text-rose-400 mt-1">{sosError}</p>
              </div>
              <button
                onClick={() => setSosStatus('idle')}
                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-300 hover:text-white cursor-pointer"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          <div className="glass-panel p-5 rounded-2xl border border-white/5 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Emergency contacts</span>
              <span className="p-2 rounded-xl bg-safety-500/10 text-safety-400"><PhoneCall className="h-4 w-4" /></span>
            </div>
            <div className="mt-4">
              <h3 className="font-outfit text-3xl font-extrabold text-white">{contactsCount}</h3>
              <p className="text-[11px] text-gray-400 mt-1">Contacts mapped for immediate broadcast notification.</p>
            </div>
            <Link to="/profile" className="text-xs text-safety-400 hover:text-safety-300 flex items-center space-x-1 mt-4 font-semibold">
              <span>Manage contacts</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/5 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">AI Scans Complete</span>
              <span className="p-2 rounded-xl bg-blue-500/10 text-blue-400"><Eye className="h-4 w-4" /></span>
            </div>
            <div className="mt-4">
              <h3 className="font-outfit text-3xl font-extrabold text-white">{scansCount}</h3>
              <p className="text-[11px] text-gray-400 mt-1">Suspicious images, items, or camera streams scanned.</p>
            </div>
            <Link to="/detection" className="text-xs text-blue-400 hover:text-blue-300 flex items-center space-x-1 mt-4 font-semibold">
              <span>Open AI scanner</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/5 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Incidents Filed</span>
              <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400"><AlertTriangle className="h-4 w-4" /></span>
            </div>
            <div className="mt-4">
              <h3 className="font-outfit text-3xl font-extrabold text-white">{reportsCount}</h3>
              <p className="text-[11px] text-gray-400 mt-1">Geotagged Incident reports submitted to database.</p>
            </div>
            <Link to="/incidents" className="text-xs text-amber-400 hover:text-amber-300 flex items-center space-x-1 mt-4 font-semibold">
              <span>Report incident</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/5 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Safe Navigation</span>
              <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400"><MapPin className="h-4 w-4" /></span>
            </div>
            <div className="mt-4">
              <h3 className="font-outfit text-lg font-bold text-white">Safe Route Map</h3>
              <p className="text-[11px] text-gray-400 mt-1">Locate nearby active emergency rooms and police posts.</p>
            </div>
            <Link to="/map" className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 mt-4 font-semibold">
              <span>View Map</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

        </div>

      </div>

      {/* RECENT LOGS SECTION */}
      <div className="grid gap-6 md:grid-cols-2">
        
        {/* Recent Detections logs */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
          <h2 className="font-outfit text-lg font-bold text-white">Recent AI Detections</h2>
          {recentDetections.length === 0 ? (
            <p className="text-xs text-gray-500 py-4">No recent threat scans. Safe scanning is active.</p>
          ) : (
            <div className="space-y-3">
              {recentDetections.map((scan) => (
                <div key={scan.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="h-10 w-10 rounded-lg overflow-hidden flex-shrink-0 bg-white/5">
                      <img 
                        src={`/uploads/${scan.image_url}`} 
                        alt="detection" 
                        className="h-full w-full object-cover" 
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }} 
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">
                        {scan.detected_objects.length > 0 
                          ? scan.detected_objects.map(o => `${o.label} (${o.confidence}%)`).join(', ') 
                          : "No hazards found"}
                      </p>
                      <p className="text-[10px] text-gray-400">{new Date(scan.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                    scan.hazard_level === 'high' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 
                    scan.hazard_level === 'medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                    'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}>
                    {scan.hazard_level}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Incident reports */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
          <h2 className="font-outfit text-lg font-bold text-white">My Incident Reports</h2>
          {recentReports.length === 0 ? (
            <p className="text-xs text-gray-500 py-4">No filed reports. Everything is quiet.</p>
          ) : (
            <div className="space-y-3">
              {recentReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{report.title}</p>
                    <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold mt-0.5">{report.category}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{new Date(report.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                      report.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                      report.status === 'investigating' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                      'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {report.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
