import React, { useState, useEffect, useRef } from 'react';
import { aiAPI } from '../utils/api';
import { Camera, Upload, AlertTriangle, Eye, ShieldAlert, History } from 'lucide-react';

const AIDetection = () => {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'webcam'
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  
  // Webcam elements
  const [webcamActive, setWebcamActive] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    loadScanHistory();
    return () => stopWebcam();
  }, []);

  const loadScanHistory = async () => {
    try {
      const response = await aiAPI.getHistory();
      setHistory(response.data);
    } catch (e) {
      console.error("Failed to load history:", e);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const response = await aiAPI.scanUpload(file);
      setResults(response.data.results);
      loadScanHistory();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process image scan.');
    } finally {
      setLoading(false);
    }
  };

  // Webcam Controls
  const startWebcam = async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setWebcamActive(true);
        setActiveTab('webcam');
      }
    } catch (err) {
      setError('Could not access camera. Please check camera permissions.');
    }
  };

  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setWebcamActive(false);
    }
  };

  const captureFrameAndScan = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setLoading(true);
    setError('');
    
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      // Match canvas dimensions to video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame on canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Get base64 string
      const base64Data = canvas.toDataURL('image/jpeg');
      
      // Send to API
      const response = await aiAPI.scanWebcam(base64Data);
      setResults(response.data.results);
      stopWebcam(); // Close camera feed on success to save battery
      loadScanHistory();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to analyze camera frame.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-6xl mx-auto">
      
      {/* Page Header */}
      <div>
        <h1 className="font-outfit text-2xl sm:text-3xl font-extrabold text-white">AI Safety Scanner</h1>
        <p className="text-sm text-gray-400">Scan suspicious scenes or items using computer vision to detect danger elements.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        
        {/* Main Scanner Section */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Tab Selector */}
          <div className="flex rounded-xl bg-white/5 border border-white/5 p-1 w-fit">
            <button
              onClick={() => {
                stopWebcam();
                setActiveTab('upload');
                setResults(null);
                setError('');
              }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'upload' ? 'bg-safety-500 text-white shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Upload className="h-4 w-4" />
              <span>Image File Upload</span>
            </button>
            <button
              onClick={() => {
                startWebcam();
                setResults(null);
                setError('');
              }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'webcam' ? 'bg-safety-500 text-white shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Camera className="h-4 w-4" />
              <span>Webcam Scanner</span>
            </button>
          </div>

          {error && (
            <div className="flex items-center space-x-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-xs text-rose-400">
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Scanner view panel */}
          <div className="glass-panel min-h-[350px] rounded-2xl border border-white/5 flex flex-col items-center justify-center p-6 relative overflow-hidden bg-gradient-to-b from-[#14121d] to-[#0c0b13]">
            
            {loading && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xs space-y-4">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-t-safety-500 border-white/10"></div>
                <p className="text-xs text-safety-400 font-semibold tracking-wider animate-pulse">ANALYZING SCENE CONTENT...</p>
              </div>
            )}

            {/* TAB 1: File Uploader */}
            {activeTab === 'upload' && !results && (
              <label className="flex flex-col items-center space-y-4 cursor-pointer hover:opacity-85 transition-opacity py-10 w-full text-center">
                <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400">
                  <Upload className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Click or drag images here to scan</p>
                  <p className="text-xs text-gray-400 mt-1">Supports PNG, JPG, JPEG, or WEBP up to 5MB</p>
                </div>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  accept="image/*"
                />
              </label>
            )}

            {/* TAB 2: Webcam Stream */}
            {activeTab === 'webcam' && !results && (
              <div className="w-full flex flex-col items-center space-y-4">
                <div className="relative w-full max-w-md aspect-video rounded-xl overflow-hidden border border-white/10 bg-black">
                  <video 
                    ref={videoRef} 
                    className="w-full h-full object-cover" 
                    playsInline 
                    muted
                  />
                  <canvas ref={canvasRef} className="hidden" />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={captureFrameAndScan}
                    disabled={!webcamActive}
                    className="px-6 py-2.5 bg-safety-500 hover:bg-safety-600 text-white rounded-xl text-xs font-semibold shadow-md disabled:opacity-50 cursor-pointer"
                  >
                    Capture and Scan
                  </button>
                  <button
                    onClick={() => {
                      stopWebcam();
                      setActiveTab('upload');
                    }}
                    className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-xs font-semibold border border-white/10 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Scan Results Layout */}
            {results && (
              <div className="w-full space-y-6">
                
                {/* Result Image */}
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  <div className="w-full md:w-2/3 aspect-video bg-black/45 rounded-xl overflow-hidden border border-white/10 relative">
                    <img 
                      src={`/uploads/${results.annotated_url}`} 
                      alt="Annotated Results" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  
                  {/* Result Information */}
                  <div className="w-full md:w-1/3 space-y-4 text-left">
                    <div className="space-y-1">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Hazard Assessment</span>
                      <div className="flex items-center space-x-2">
                        <span className={`h-3.5 w-3.5 rounded-full ${
                          results.hazard_level === 'high' ? 'bg-rose-500 animate-ping' :
                          results.hazard_level === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                        }`} />
                        <h3 className={`font-outfit text-xl font-extrabold capitalize ${
                          results.hazard_level === 'high' ? 'text-rose-500' :
                          results.hazard_level === 'medium' ? 'text-amber-400' : 'text-emerald-400'
                        }`}>
                          {results.hazard_level} Threat
                        </h3>
                      </div>
                    </div>

                    <div className="border-t border-white/5 pt-4 space-y-3">
                      <p className="text-xs font-semibold text-gray-300">Objects Identified:</p>
                      {results.detected_objects.length === 0 ? (
                        <p className="text-xs text-gray-400">Clear. No threat vectors detected.</p>
                      ) : (
                        <div className="space-y-2">
                          {results.detected_objects.map((obj, i) => (
                            <div key={i} className="flex justify-between items-center p-2 rounded-lg bg-white/5 border border-white/5">
                              <span className="text-xs font-semibold text-white capitalize">{obj.label}</span>
                              <span className="text-xs font-bold text-safety-400">{obj.confidence}%</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setResults(null);
                        if (activeTab === 'webcam') {
                          startWebcam();
                        }
                      }}
                      className="w-full py-2.5 border border-white/10 hover:bg-white/5 text-xs text-gray-300 hover:text-white rounded-xl font-bold cursor-pointer transition-colors"
                    >
                      Scan Another
                    </button>
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>

        {/* History / Logs Panel */}
        <div className="lg:col-span-1 glass-panel p-5 rounded-2xl border border-white/5 flex flex-col space-y-4 max-h-[500px] overflow-y-auto">
          <div className="flex items-center space-x-2 border-b border-white/5 pb-3">
            <History className="h-5 w-5 text-safety-400" />
            <h2 className="font-outfit text-base font-bold text-white">Scan Log History</h2>
          </div>

          {history.length === 0 ? (
            <p className="text-xs text-gray-500 py-6 text-center">No scan archives recorded.</p>
          ) : (
            <div className="space-y-3 flex-1 overflow-y-auto">
              {history.map((scan) => (
                <div key={scan.id} className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-gray-400">{new Date(scan.created_at).toLocaleDateString()}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                      scan.hazard_level === 'high' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 
                      scan.hazard_level === 'medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {scan.hazard_level}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-white">
                    {scan.detected_objects.length > 0 
                      ? scan.detected_objects.map(o => `${o.label} (${o.confidence}%)`).join(', ')
                      : "Clear scan"}
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

export default AIDetection;
