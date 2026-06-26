import React, { useState, useEffect } from 'react';
import { adminAPI } from '../utils/api';
import { Chart as ChartJS } from 'chart.js/auto';
import { Bar, Doughnut } from 'react-chartjs-2';
import { ShieldAlert, Users, FileText, BellRing, Check, Trash2, Eye, Loader2, AlertCircle } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [sosLogs, setSosLogs] = useState([]);
  const [usersList, setUsersList] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null); // stores reportId or userId currently updating

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const statsRes = await adminAPI.getStats();
      setStats(statsRes.data);

      const reportsRes = await adminAPI.getReports();
      setReports(reportsRes.data);

      const sosRes = await adminAPI.getSOSLogs();
      setSosLogs(sosRes.data);

      const usersRes = await adminAPI.getUsers();
      setUsersList(usersRes.data);
    } catch (e) {
      setError("Failed to load administration dataset.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateReportStatus = async (reportId, nextStatus) => {
    setActionLoading(reportId);
    try {
      await adminAPI.updateReportStatus(reportId, nextStatus);
      const reportsRes = await adminAPI.getReports();
      setReports(reportsRes.data);
      
      // Update statistics
      const statsRes = await adminAPI.getStats();
      setStats(statsRes.data);
    } catch (e) {
      alert("Failed to update status: " + e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleResolveSOS = async (sosId) => {
    setActionLoading(`sos-${sosId}`);
    try {
      await adminAPI.updateSOSStatus(sosId, 'resolved');
      
      const sosRes = await adminAPI.getSOSLogs();
      setSosLogs(sosRes.data);

      const statsRes = await adminAPI.getStats();
      setStats(statsRes.data);
    } catch (e) {
      alert("Failed to resolve SOS: " + e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm("Are you sure you want to remove this user from the system?")) return;
    
    setActionLoading(`user-${userId}`);
    try {
      await adminAPI.deleteUser(userId);
      const usersRes = await adminAPI.getUsers();
      setUsersList(usersRes.data);

      const statsRes = await adminAPI.getStats();
      setStats(statsRes.data);
    } catch (e) {
      alert("Failed to delete user: " + e.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] w-full items-center justify-center bg-[#0c0b13]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-t-safety-500 border-white/5"></div>
      </div>
    );
  }

  // Chart configs
  const barChartData = stats ? {
    labels: Object.keys(stats.category_distribution).map(k => k.charAt(0).toUpperCase() + k.slice(1)),
    datasets: [{
      label: 'Incident Frequency',
      data: Object.values(stats.category_distribution),
      backgroundColor: 'rgba(244, 63, 94, 0.4)',
      borderColor: '#f43f5e',
      borderWidth: 2,
      borderRadius: 8,
    }]
  } : null;

  const donutChartData = stats ? {
    labels: ['High Threat', 'Medium Threat', 'Low Threat'],
    datasets: [{
      data: [stats.hazard_distribution.high, stats.hazard_distribution.medium, stats.hazard_distribution.low],
      backgroundColor: ['#ef4444', '#f59e0b', '#10b981'],
      borderWidth: 0,
    }]
  } : null;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Page Header */}
      <div>
        <h1 className="font-outfit text-2xl sm:text-3xl font-extrabold text-white">Security Command Center</h1>
        <p className="text-sm text-gray-400">System admin dashboard for active dispatching, incident resolution, and logs.</p>
      </div>

      {error && (
        <div className="flex items-center space-x-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-xs text-rose-400">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Metrics Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center space-x-4">
            <div className="p-3.5 rounded-xl bg-safety-500/10 text-safety-400"><Users className="h-6 w-6" /></div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Users</p>
              <h3 className="font-outfit text-2xl font-extrabold text-white">{stats.metrics.total_users}</h3>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center space-x-4">
            <div className="p-3.5 rounded-xl bg-amber-500/10 text-amber-400"><FileText className="h-6 w-6" /></div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Filer Incidents</p>
              <h3 className="font-outfit text-2xl font-extrabold text-white">{stats.metrics.total_reports}</h3>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center space-x-4">
            <div className="p-3.5 rounded-xl bg-rose-500/10 text-rose-400"><BellRing className="h-6 w-6" /></div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Active SOS Signals</p>
              <h3 className="font-outfit text-2xl font-extrabold text-rose-400">{stats.metrics.active_sos}</h3>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center space-x-4">
            <div className="p-3.5 rounded-xl bg-emerald-500/10 text-emerald-400"><Check className="h-6 w-6" /></div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Reports Resolved</p>
              <h3 className="font-outfit text-2xl font-extrabold text-white">{stats.metrics.resolved_reports}</h3>
            </div>
          </div>

        </div>
      )}

      {/* Analytics charts */}
      {stats && (
        <div className="grid gap-6 md:grid-cols-3">
          
          <div className="glass-panel p-6 rounded-2xl border border-white/5 md:col-span-2 space-y-4 h-[320px] flex flex-col justify-between">
            <h3 className="font-outfit text-sm font-bold text-white uppercase">Incidents by Category</h3>
            <div className="flex-1 min-h-0">
              <Bar 
                data={barChartData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  scales: { y: { grid: { color: 'rgba(255,255,255,0.05)' } }, x: { grid: { display: false } } }
                }} 
              />
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/5 md:col-span-1 space-y-4 h-[320px] flex flex-col justify-between">
            <h3 className="font-outfit text-sm font-bold text-white uppercase">AI Scan Threat Spread</h3>
            <div className="flex-1 min-h-0 flex items-center justify-center">
              <Doughnut 
                data={donutChartData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'bottom', labels: { color: '#9ca3af' } } }
                }} 
              />
            </div>
          </div>

        </div>
      )}

      {/* SOS DISPATCH LIST */}
      <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
        <div className="flex items-center space-x-2 border-b border-white/5 pb-3">
          <BellRing className="h-5 w-5 text-rose-500" />
          <h2 className="font-outfit text-base font-bold text-white">Active SOS Incidents</h2>
        </div>

        {sosLogs.filter(s => s.status === 'active').length === 0 ? (
          <p className="text-xs text-gray-500 py-4">No active distress broadcasts.</p>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-gray-400">
                  <th className="py-2.5">User</th>
                  <th className="py-2.5">Emergency Contact Number</th>
                  <th className="py-2.5">GPS Coordinates</th>
                  <th className="py-2.5">Timestamp</th>
                  <th className="py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sosLogs.filter(s => s.status === 'active').map((alert) => (
                  <tr key={alert.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 font-semibold text-white">{alert.user_name}</td>
                    <td className="py-3 text-gray-300">{alert.user_phone}</td>
                    <td className="py-3 text-safety-400 font-mono">
                      <a href={`https://maps.google.com/?q=${alert.latitude},${alert.longitude}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}
                      </a>
                    </td>
                    <td className="py-3 text-gray-400">{new Date(alert.created_at).toLocaleString()}</td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleResolveSOS(alert.id)}
                        disabled={actionLoading === `sos-${alert.id}`}
                        className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/20 cursor-pointer text-[10px] font-bold"
                      >
                        {actionLoading === `sos-${alert.id}` ? "Saving..." : "Resolve"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* INCIDENT FILES LIST */}
      <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
        <div className="flex items-center space-x-2 border-b border-white/5 pb-3">
          <FileText className="h-5 w-5 text-safety-400" />
          <h2 className="font-outfit text-base font-bold text-white">Safety Incident Files</h2>
        </div>

        {reports.length === 0 ? (
          <p className="text-xs text-gray-500 py-4">No filed incidents.</p>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-gray-400">
                  <th className="py-2.5">User</th>
                  <th className="py-2.5">Details</th>
                  <th className="py-2.5">Category</th>
                  <th className="py-2.5">Evidence</th>
                  <th className="py-2.5">Filing Date</th>
                  <th className="py-2.5">Status</th>
                  <th className="py-2.5 text-right">Update Status</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 font-semibold text-white">{report.user_name}</td>
                    <td className="py-3 max-w-xs">
                      <p className="font-semibold text-white truncate">{report.title}</p>
                      <p className="text-gray-400 truncate text-[11px] mt-0.5">{report.description}</p>
                    </td>
                    <td className="py-3"><span className="px-2 py-0.5 roundedbg-white/5 border border-white/10 text-[9px] uppercase font-bold">{report.category}</span></td>
                    <td className="py-3">
                      {report.image_url ? (
                        <a href={`/uploads/${report.image_url}`} target="_blank" rel="noopener noreferrer" className="text-safety-400 flex items-center space-x-1 hover:underline">
                          <Eye className="h-3.5 w-3.5" />
                          <span>View Image</span>
                        </a>
                      ) : (
                        <span className="text-gray-500">None</span>
                      )}
                    </td>
                    <td className="py-3 text-gray-400">{new Date(report.created_at).toLocaleDateString()}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        report.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                        report.status === 'investigating' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                        'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <select
                        value={report.status}
                        onChange={(e) => handleUpdateReportStatus(report.id, e.target.value)}
                        disabled={actionLoading === report.id}
                        className="px-2 py-1 bg-[#161420] border border-white/10 text-white rounded-lg outline-none cursor-pointer text-[10px]"
                      >
                        <option value="pending">Pending</option>
                        <option value="investigating">Investigating</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* USERS REGISTRY */}
      <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
        <div className="flex items-center space-x-2 border-b border-white/5 pb-3">
          <Users className="h-5 w-5 text-safety-400" />
          <h2 className="font-outfit text-base font-bold text-white">Users Registry</h2>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-gray-400">
                <th className="py-2.5">Name</th>
                <th className="py-2.5">Email</th>
                <th className="py-2.5">Phone</th>
                <th className="py-2.5">Access Level</th>
                <th className="py-2.5 text-right">Remove</th>
              </tr>
            </thead>
            <tbody>
              {usersList.map((usr) => (
                <tr key={usr.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-3 font-semibold text-white">{usr.name}</td>
                  <td className="py-3 text-gray-300">{usr.email}</td>
                  <td className="py-3 text-gray-400">{usr.phone}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                      usr.role === 'admin' ? 'bg-safety-500/10 text-safety-400 border border-safety-500/20' : 
                      'bg-white/5 border border-white/10 text-gray-400'
                    }`}>
                      {usr.role}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => handleDeleteUser(usr.id)}
                      disabled={actionLoading === `user-${usr.id}` || usr.id === user.id}
                      className="p-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg hover:bg-rose-500/20 cursor-pointer disabled:opacity-30"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
