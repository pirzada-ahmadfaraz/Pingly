import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { LayoutGrid, AlertCircle, FileText, Zap, Users, Settings, ChevronRight, Pause, Play, Mail, Send, MessageCircle, Slack, MessageSquare, Bell, Phone, Webhook, X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MonitorDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [monitor, setMonitor] = useState(null);
  const [checks, setChecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [nextCheckIn, setNextCheckIn] = useState('');
  const [connectedIntegrations, setConnectedIntegrations] = useState([]);
  const [monitorIntegrations, setMonitorIntegrations] = useState([]);
  const [showIntegrationDropdown, setShowIntegrationDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const menuItems = [
    { id: 'monitors', label: 'Monitors', icon: LayoutGrid },
    { id: 'incidents', label: 'Incidents', icon: AlertCircle },
    { id: 'status-pages', label: 'Status Pages', icon: FileText },
    { id: 'integrations', label: 'Integrations', icon: Zap },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const allIntegrations = [
    { id: 'email', name: 'Email', icon: Mail, color: 'text-cyan-400', description: 'Sending email to below address' },
    { id: 'telegram', name: 'Telegram', icon: Send, color: 'text-blue-400', description: 'Sending message to Telegram' },
    { id: 'discord', name: 'Discord', icon: MessageCircle, color: 'text-indigo-400', description: 'Sending message to Discord channel' },
    { id: 'slack', name: 'Slack', icon: Slack, color: 'text-pink-400', description: 'Sending message to Slack channel' },
    { id: 'teams', name: 'Teams', icon: MessageSquare, color: 'text-blue-500', description: 'Sending message to Teams channel' },
    { id: 'pagerduty', name: 'PagerDuty', icon: Bell, color: 'text-green-400', description: 'Sending alert to PagerDuty' },
    { id: 'googlechat', name: 'Google Chat', icon: MessageSquare, color: 'text-green-500', description: 'Sending message to Google Chat' },
    { id: 'twiliosms', name: 'Twilio SMS', icon: Phone, color: 'text-red-400', description: 'Sending SMS via Twilio' },
    { id: 'webhook', name: 'Webhook', icon: Webhook, color: 'text-blue-300', description: 'Sending webhook notification' },
  ];

  // Fetch connected user integrations
  useEffect(() => {
    const fetchUserIntegrations = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const integrationChecks = [
        { id: 'telegram', endpoint: '/api/integrations/telegram/status' },
        { id: 'discord', endpoint: '/api/integrations/discord/status' },
        { id: 'slack', endpoint: '/api/integrations/slack/status' },
        { id: 'teams', endpoint: '/api/integrations/teams/status' },
        { id: 'pagerduty', endpoint: '/api/integrations/pagerduty/status' },
        { id: 'googlechat', endpoint: '/api/integrations/googlechat/status' },
        { id: 'twiliosms', endpoint: '/api/integrations/twiliosms/status' },
        { id: 'webhook', endpoint: '/api/integrations/webhook/status' },
      ];

      const connected = [];

      for (const integration of integrationChecks) {
        try {
          const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}${integration.endpoint}`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          const data = await response.json();
          if (response.ok && data.connected) {
            connected.push(integration.id);
          }
        } catch (error) {
          console.error(`Error checking ${integration.id}:`, error);
        }
      }

      setConnectedIntegrations(connected);
    };

    fetchUserIntegrations();
  }, []);

  // Fetch monitor-specific integrations
  useEffect(() => {
    const fetchMonitorIntegrations = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token || !id) return;

      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/monitors/${id}/integrations`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok) {
          setMonitorIntegrations(data.integrations || []);
        }
      } catch (error) {
        console.error('Error fetching monitor integrations:', error);
      }
    };

    if (id) {
      fetchMonitorIntegrations();
    }
  }, [id]);

  useEffect(() => {
    let isFetching = false;

    const fetchData = async () => {
      if (isFetching) return; // Prevent overlapping requests

      isFetching = true;
      try {
        await fetchMonitorDetails();
        await fetchMonitorChecks();
      } finally {
        isFetching = false;
      }
    };

    // Initial fetch only
    fetchData();

    // Auto-update every 5 minutes (300000ms) to get new check data
    const interval = setInterval(fetchData, 300000);

    return () => clearInterval(interval);
  }, [id]);

  // Countdown timer for next check
  useEffect(() => {
    if (!monitor || !monitor.lastCheckedAt) {
      setNextCheckIn('Pending...');
      return;
    }

    let hasTriggeredFetch = false;

    const calculateNextCheck = () => {
      const frequencyMs = {
        '1min': 60 * 1000,
        '5min': 5 * 60 * 1000,
        '10min': 10 * 60 * 1000
      }[monitor.frequency] || 5 * 60 * 1000;

      const lastCheck = new Date(monitor.lastCheckedAt).getTime();
      const nextCheck = lastCheck + frequencyMs;
      const now = Date.now();
      const timeUntilNext = nextCheck - now;

      // If past due time, show 0m 0s and trigger a fetch
      if (timeUntilNext <= 0 && !hasTriggeredFetch) {
        setNextCheckIn('0m 0s');
        hasTriggeredFetch = true;
        
        // Trigger a data fetch to get the new check
        setTimeout(async () => {
          try {
            await fetchMonitorDetails();
            await fetchMonitorChecks();
            hasTriggeredFetch = false; // Reset for next cycle
          } catch (error) {
            console.error('Auto-fetch error:', error);
            hasTriggeredFetch = false;
          }
        }, 2000); // Wait 2 seconds for the backend to complete the check
        return;
      }

      if (timeUntilNext <= 0) {
        setNextCheckIn('0m 0s');
        return;
      }

      const minutes = Math.floor(timeUntilNext / 60000);
      const seconds = Math.floor((timeUntilNext % 60000) / 1000);
      setNextCheckIn(`${minutes}m ${seconds}s`);
    };

    calculateNextCheck();
    const timer = setInterval(calculateNextCheck, 1000);

    return () => clearInterval(timer);
  }, [monitor, monitor?.lastCheckedAt]);

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

  const handleAddIntegration = async (integrationId) => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    const newIntegrations = [...monitorIntegrations, integrationId];

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/monitors/${id}/integrations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ integrations: newIntegrations }),
      });

      const data = await response.json();

      if (response.ok) {
        setMonitorIntegrations(data.integrations);
        setShowIntegrationDropdown(false);
        setSearchQuery('');
      }
    } catch (error) {
      console.error('Error adding integration:', error);
    }
  };

  const handleRemoveIntegration = async (integrationId) => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    const newIntegrations = monitorIntegrations.filter(id => id !== integrationId);

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/monitors/${id}/integrations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ integrations: newIntegrations }),
      });

      const data = await response.json();

      if (response.ok) {
        setMonitorIntegrations(data.integrations);
      }
    } catch (error) {
      console.error('Error removing integration:', error);
    }
  };

  const handleAddAll = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/monitors/${id}/integrations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ integrations: connectedIntegrations }),
      });

      const data = await response.json();

      if (response.ok) {
        setMonitorIntegrations(data.integrations);
      }
    } catch (error) {
      console.error('Error adding all integrations:', error);
    }
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

  // Prepare chart data (reverse to show chronologically and remove duplicates)
  // Memoize chart data to prevent unnecessary re-renders
  const chartData = useMemo(() => {
    return checks
      .slice()
      .reverse()
      .filter(check => check.responseTime !== null)
      .reduce((unique, check) => {
        // Only add if this timestamp doesn't exist yet
        const timestamp = new Date(check.timestamp).getTime();
        if (!unique.find(item => item.timestamp === timestamp)) {
          unique.push({
            time: formatTime(check.timestamp),
            responseTime: check.responseTime,
            status: check.status,
            timestamp: timestamp
          });
        }
        return unique;
      }, []);
  }, [checks]);

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
                    onClick={() => {
                      if (item.id === 'integrations') {
                        navigate('/dashboard', { state: { activeTab: 'integrations' } });
                      } else {
                        navigate('/dashboard');
                      }
                    }}
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
                <h3 className="text-sm text-gray-400 mb-1">Next Check In</h3>
                <p className="text-xs text-gray-500 mb-2">Checks every {monitor.frequency}</p>
                <p className="text-2xl font-bold">{nextCheckIn || 'Calculating...'}</p>
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

            {/* Region Response Time Stats */}
            {checks.length > 0 && (
              <div className="bg-[#0f0f0f] border border-white/10 rounded-lg p-6 mb-6">
                <div className="grid grid-cols-4 gap-4 mb-3 text-sm font-medium text-gray-400">
                  <div>Region</div>
                  <div>Average Response Time</div>
                  <div>Minimum Response Time</div>
                  <div>Last Response Time</div>
                </div>
                {monitor.locations.map(location => {
                  const locationChecks = checks.filter(c => c.location === location && c.responseTime !== null);
                  const avgResponse = locationChecks.length > 0
                    ? Math.round(locationChecks.reduce((sum, c) => sum + c.responseTime, 0) / locationChecks.length)
                    : 0;
                  const minResponse = locationChecks.length > 0
                    ? Math.min(...locationChecks.map(c => c.responseTime))
                    : 0;
                  const lastResponse = locationChecks.length > 0
                    ? locationChecks[0].responseTime
                    : 0;

                  return (
                    <div key={location} className="grid grid-cols-4 gap-4 py-3 border-t border-white/10">
                      <div className="text-white capitalize">{location.replace('-', ' ')}</div>
                      <div className="text-white">{avgResponse} ms</div>
                      <div className="text-white">{minResponse} ms</div>
                      <div className="text-white">{lastResponse} ms</div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Recent Incidents */}
            <div className="bg-[#0f0f0f] border border-white/10 rounded-lg p-6">
              <h3 className="text-lg font-bold mb-4">Recent Incidents</h3>
              <div className="grid grid-cols-4 gap-4 mb-3 text-sm font-medium text-gray-400">
                <div>Status</div>
                <div>Error</div>
                <div>Started</div>
                <div>Duration</div>
              </div>
              {(() => {
                // Find incidents (transitions from up to down)
                const incidents = [];
                let currentIncident = null;

                checks.slice().reverse().forEach((check, index, arr) => {
                  if (check.status === 'down' && !currentIncident) {
                    currentIncident = {
                      status: 'down',
                      error: check.errorMessage || 'Unknown error',
                      started: check.timestamp,
                      ended: null
                    };
                  } else if (check.status === 'up' && currentIncident) {
                    currentIncident.ended = check.timestamp;
                    incidents.push(currentIncident);
                    currentIncident = null;
                  }
                });

                // If there's an ongoing incident
                if (currentIncident) {
                  currentIncident.ended = new Date();
                  incidents.push(currentIncident);
                }

                return incidents.length > 0 ? (
                  incidents.slice(0, 5).map((incident, idx) => {
                    const duration = Math.floor((new Date(incident.ended) - new Date(incident.started)) / 1000 / 60);
                    return (
                      <div key={idx} className="grid grid-cols-4 gap-4 py-3 border-t border-white/10">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span className="text-white capitalize">{incident.status}</span>
                        </div>
                        <div className="text-gray-400 text-sm">{incident.error}</div>
                        <div className="text-gray-400 text-sm">{formatTime(incident.started)}</div>
                        <div className="text-gray-400 text-sm">{duration > 0 ? `${duration} min` : '< 1 min'}</div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-12 text-center">
                    <p className="text-gray-500">You caught up!</p>
                  </div>
                );
              })()}
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

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="bg-[#0f0f0f] border border-white/10 rounded-lg p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">Notifications</h3>
                <p className="text-gray-400">
                  If your monitor is down, you will be notified via below channels. If you want to add more channels, please first configure them on integrations page.
                </p>
              </div>
              <button
                onClick={() => navigate('/dashboard', { state: { activeTab: 'integrations' } })}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Configure Integrations
              </button>
            </div>

            {/* Search and Add Integration Dropdown */}
            <div className="mb-6 relative">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setShowIntegrationDropdown(!showIntegrationDropdown)}
                  className="flex-1 px-4 py-3 bg-transparent border border-green-500 rounded-lg text-white text-left flex items-center justify-between hover:bg-green-500/10 transition-colors"
                >
                  <span>Search and add integrations</span>
                  <ChevronRight className={`w-5 h-5 transition-transform ${showIntegrationDropdown ? 'rotate-90' : ''}`} />
                </button>
                <button
                  onClick={handleAddAll}
                  className="ml-4 px-6 py-3 bg-[#1a1a1a] hover:bg-[#252525] border border-white/10 rounded-lg text-white font-medium transition-colors"
                >
                  Add All
                </button>
              </div>

              {showIntegrationDropdown && (
                <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-4 mb-4">
                  <h4 className="text-white font-semibold mb-3">Integrations</h4>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search integrations..."
                    className="w-full px-4 py-2 bg-transparent border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50 mb-3"
                  />
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {connectedIntegrations
                      .filter(integrationId => {
                        const integration = allIntegrations.find(i => i.id === integrationId);
                        return integration &&
                          !monitorIntegrations.includes(integrationId) &&
                          integration.name.toLowerCase().includes(searchQuery.toLowerCase());
                      })
                      .map(integrationId => {
                        const integration = allIntegrations.find(i => i.id === integrationId);
                        if (!integration) return null;
                        const Icon = integration.icon;
                        return (
                          <button
                            key={integration.id}
                            onClick={() => handleAddIntegration(integration.id)}
                            className="w-full px-4 py-2 bg-[#0f0f0f] hover:bg-[#252525] border border-white/10 rounded-lg text-left transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <Icon className={`w-5 h-5 ${integration.color}`} />
                              <span className="text-white">{integration.name}</span>
                            </div>
                          </button>
                        );
                      })}
                    {connectedIntegrations.filter(integrationId => !monitorIntegrations.includes(integrationId)).length === 0 && (
                      <p className="text-gray-500 text-sm text-center py-4">All connected integrations have been added</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Added Integrations List */}
            <div className="space-y-4">
              {monitorIntegrations.map(integrationId => {
                const integration = allIntegrations.find(i => i.id === integrationId);
                if (!integration) return null;
                const Icon = integration.icon;

                // Get user info for this integration (placeholder for now)
                const integrationInfo = integrationId === 'email' ? 'ahmaddiscord2@gmail.com' :
                                       integrationId === 'discord' ? 'https://discord.com/api/webhooks/...' :
                                       'Connected';

                return (
                  <div key={integration.id} className="bg-[#1a1a1a] border border-white/10 rounded-lg p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                          <Icon className={`w-6 h-6 ${integration.color}`} />
                        </div>
                        <div>
                          <h4 className="text-white font-semibold text-lg mb-1">{integration.name}</h4>
                          <p className="text-gray-400 text-sm mb-2">{integration.description}</p>
                          <p className="text-gray-500 text-sm break-all">{integrationInfo}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveIntegration(integration.id)}
                        className="text-white hover:text-red-400 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {monitorIntegrations.length === 0 && (
                <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-8 text-center">
                  <p className="text-gray-400 mb-4">No integrations added yet</p>
                  <p className="text-gray-500 text-sm">Click "Search and add integrations" to add notification channels for this monitor</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-[#0f0f0f] border border-white/10 rounded-lg p-6">
            <p className="text-gray-400">Coming soon...</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default MonitorDetail;
