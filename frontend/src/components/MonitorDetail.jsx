import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { LayoutGrid, AlertCircle, FileText, Zap, Users, Settings, ChevronRight, Pause, Play } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MonitorDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [monitor, setMonitor] = useState(null);
  const [checks, setChecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const menuItems = [
    { id: 'monitors', label: 'Monitors', icon: LayoutGrid },
    { id: 'incidents', label: 'Incidents', icon: AlertCircle },
    { id: 'status-pages', label: 'Status Pages', icon: FileText },
    { id: 'integrations', label: 'Integrations', icon: Zap },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  useEffect(() => {
    fetchMonitorDetails();
    fetchMonitorChecks();

    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchMonitorDetails();
      fetchMonitorChecks();
    }, 30000);

    return () => clearInterval(interval);
  }, [id]);

  const fetchMonitorDetails = async () => {
    const token = localStorage.getItem('auth_token');

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/monitors/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setMonitor(data.monitor);
      } else {
        console.error('Failed to fetch monitor:', data.error);
      }
    } catch (error) {
      console.error('Error fetching monitor:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonitorChecks = async () => {
    const token = localStorage.getItem('auth_token');

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/monitors/${id}/checks?hours=24&limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setChecks(data.checks || []);
      }
    } catch (error) {
      console.error('Error fetching checks:', error);
    }
  };

  const handlePauseToggle = async () => {
    const token = localStorage.getItem('auth_token');

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/monitors/${id}/pause`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          paused: monitor.status !== 'paused',
        }),
      });

      if (response.ok) {
        fetchMonitorDetails();
      }
    } catch (error) {
      console.error('Error toggling pause:', error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this monitor?')) return;

    const token = localStorage.getItem('auth_token');

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/monitors/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error deleting monitor:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getTimeSince = (timestamp) => {
    if (!timestamp) return 'Never';
    const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  // Prepare chart data (reverse to show chronologically)
  const chartData = checks
    .slice()
    .reverse()
    .filter(check => check.responseTime !== null)
    .map(check => ({
      time: formatTime(check.timestamp),
      responseTime: check.responseTime,
      status: check.status
    }));

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!monitor) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-400 mb-4">Monitor not found</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-green-500 hover:bg-green-600 px-6 py-2 rounded-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      {/* Sidebar */}
      <aside className="w-56 bg-[#0f0f0f] border-r border-white/10 flex flex-col fixed h-full">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Pingly Logo" className="h-8 w-8" />
            <span className="text-xl font-bold">Pingly</span>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                      item.id === 'monitors'
                        ? 'bg-green-500/10 text-green-500'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <div className="text-xs text-gray-400 max-w-[100px] truncate">
                {user?.email}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-red-500 transition-colors text-xs"
              title="Logout"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-56 p-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="hover:text-white transition-colors"
          >
            monitors
          </button>
          <ChevronRight size={14} />
          <span className="text-white">{monitor.name}</span>
        </div>

        {/* Monitor Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              monitor.lastStatus === 'up' ? 'bg-green-500' :
              monitor.lastStatus === 'down' ? 'bg-red-500' :
              'bg-gray-400'
            }`}>
              <div className="w-5 h-5 bg-white rounded-full"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold">{monitor.name}</h1>
              <p className="text-sm text-green-500">
                Monitor for{' '}
                <a
                  href={monitor.url || `http://${monitor.ipAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {monitor.url || monitor.ipAddress}
                </a>
              </p>
            </div>
          </div>

          <button
            onClick={handlePauseToggle}
            className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
          >
            {monitor.status === 'paused' ? (
              <>
                <Play size={16} />
                <span className="text-sm">Resume</span>
              </>
            ) : (
              <>
                <Pause size={16} />
                <span className="text-sm">Pause</span>
              </>
            )}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-white/10">
          {['overview', 'notifications', 'settings', 'delete'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-1 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab
                  ? 'text-white border-white'
                  : 'text-gray-400 border-transparent hover:text-white'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab Content */}
        {activeTab === 'overview' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-[#0f0f0f] border border-white/10 rounded-lg p-5">
                <h3 className="text-sm text-gray-400 mb-1">Currently Up for</h3>
                <p className="text-xs text-gray-500 mb-2">Date from last incident</p>
                <p className="text-2xl font-bold">{getTimeSince(monitor.lastIncidentAt || monitor.createdAt)}</p>
              </div>

              <div className="bg-[#0f0f0f] border border-white/10 rounded-lg p-5">
                <h3 className="text-sm text-gray-400 mb-1">Last Checked at</h3>
                <p className="text-xs text-gray-500 mb-2">Checks every {monitor.frequency}</p>
                <p className="text-2xl font-bold">{getTimeSince(monitor.lastCheckedAt)}</p>
              </div>

              <div className="bg-[#0f0f0f] border border-white/10 rounded-lg p-5">
                <h3 className="text-sm text-gray-400 mb-1">Last 24 Hours</h3>
                <p className="text-xs text-gray-500 mb-2">{monitor.stats?.incidents24h || 0} Incidents</p>
                <p className="text-2xl font-bold">{monitor.stats?.uptime24h?.toFixed(2) || 0}%</p>
              </div>
            </div>

            {/* Response Time Chart */}
            <div className="bg-[#0f0f0f] border border-white/10 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Response time</h3>
                <select className="bg-[#1a1a1a] border border-white/10 rounded px-3 py-1.5 text-sm">
                  <option>Last 24 hours</option>
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                </select>
              </div>

              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis
                      dataKey="time"
                      stroke="#666"
                      tick={{ fill: '#999', fontSize: 11 }}
                    />
                    <YAxis
                      stroke="#666"
                      tick={{ fill: '#999', fontSize: 11 }}
                      label={{ value: 'ms', angle: -90, position: 'insideLeft', fill: '#999' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1a1a1a',
                        border: '1px solid #333',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="responseTime"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-500">
                  No check data available yet
                </div>
              )}

              <div className="mt-4 flex items-center gap-2 text-xs">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-400">{monitor.locations[0] || 'Default location'}</span>
              </div>
            </div>
          </>
        )}

        {/* Delete Tab */}
        {activeTab === 'delete' && (
          <div className="bg-[#0f0f0f] border border-white/10 rounded-lg p-6">
            <h3 className="text-lg font-bold mb-2 text-red-500">Delete Monitor</h3>
            <p className="text-gray-400 mb-4">
              This action cannot be undone. All check history will be permanently deleted.
            </p>
            <button
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Delete Monitor
            </button>
          </div>
        )}

        {/* Other Tabs */}
        {(activeTab === 'notifications' || activeTab === 'settings') && (
          <div className="bg-[#0f0f0f] border border-white/10 rounded-lg p-6">
            <p className="text-gray-400">Coming soon...</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default MonitorDetail;
