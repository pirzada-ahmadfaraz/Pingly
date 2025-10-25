import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, AlertCircle, FileText, Zap, Users, Settings, Globe, Radio, ChevronDown, Mail, Send, MessageCircle, Slack, MessageSquare, Bell, Phone, Webhook } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('monitors');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMonitorDropdown, setShowMonitorDropdown] = useState(false);
  const [monitors, setMonitors] = useState([]);
  const [monitorsLoading, setMonitorsLoading] = useState(true);
  const dropdownRef = useRef(null);

  // Integrations state
  const [selectedIntegration, setSelectedIntegration] = useState('email');
  const [emailInput, setEmailInput] = useState('');
  const [additionalEmails, setAdditionalEmails] = useState([]);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');

      if (!token) {
        navigate('/signup');
        return;
      }

      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          navigate('/signup');
        }
      } catch (err) {
        navigate('/signup');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  // Fetch monitors
  useEffect(() => {
    const fetchMonitors = async () => {
      const token = localStorage.getItem('auth_token');

      if (!token) return;

      try {
        setMonitorsLoading(true);
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/monitors`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok) {
          setMonitors(data.monitors || []);
        } else {
          console.error('Failed to fetch monitors:', data.error);
        }
      } catch (error) {
        console.error('Error fetching monitors:', error);
      } finally {
        setMonitorsLoading(false);
      }
    };

    if (!loading && user) {
      fetchMonitors();
      // Refresh monitors every 30 seconds
      const interval = setInterval(fetchMonitors, 30000);
      return () => clearInterval(interval);
    }
  }, [loading, user]);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowMonitorDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleCreateMonitor = (type) => {
    setShowMonitorDropdown(false);
    navigate(`/dashboard/monitors/new-monitor/${type}`);
  };

  // Integration handlers
  const handleAddEmail = () => {
    if (emailInput && emailInput.includes('@')) {
      setAdditionalEmails([...additionalEmails, emailInput]);
      setEmailInput('');
    }
  };

  const handleRemoveEmail = (index) => {
    setAdditionalEmails(additionalEmails.filter((_, i) => i !== index));
  };

  const integrations = [
    { id: 'email', name: 'Email', icon: Mail, color: 'text-cyan-400' },
    { id: 'telegram', name: 'Telegram', icon: Send, color: 'text-blue-400' },
    { id: 'discord', name: 'Discord', icon: MessageCircle, color: 'text-indigo-400' },
    { id: 'slack', name: 'Slack', icon: Slack, color: 'text-pink-400' },
    { id: 'teams', name: 'Teams', icon: MessageSquare, color: 'text-blue-500' },
    { id: 'pagerduty', name: 'PagerDuty', icon: Bell, color: 'text-green-400' },
    { id: 'googlechat', name: 'Google Chat', icon: MessageSquare, color: 'text-green-500' },
    { id: 'twiliosms', name: 'Twilio SMS', icon: Phone, color: 'text-red-400' },
    { id: 'webhook', name: 'Webhook', icon: Webhook, color: 'text-blue-300' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  const menuItems = [
    { id: 'monitors', label: 'Monitors', icon: LayoutGrid },
    { id: 'incidents', label: 'Incidents', icon: AlertCircle },
    { id: 'status-pages', label: 'Status Pages', icon: FileText },
    { id: 'integrations', label: 'Integrations', icon: Zap },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      {/* Sidebar */}
      <aside className="w-56 bg-[#0f0f0f] border-r border-white/10 flex flex-col fixed h-full">
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Pingly Logo" className="h-8 w-8" />
            <span className="text-xl font-bold">Pingly</span>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                      activeTab === item.id
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

        {/* User Info */}
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
      <main className="flex-1 ml-56 flex">
        {/* Center Content */}
        <div className="flex-1 p-8">
          <h1 className="text-3xl font-bold mb-8">
            {activeTab === 'integrations' ? 'Integrations' : 'Monitors'}
          </h1>

          {activeTab === 'integrations' ? (
            // Integrations View
            <div className="flex gap-6">
              {/* Integrations Sidebar */}
              <div className="w-56 bg-[#0f0f0f] border border-white/10 rounded-lg p-4">
                <div className="space-y-1">
                  {integrations.map((integration) => {
                    const Icon = integration.icon;
                    const isSelected = selectedIntegration === integration.id;

                    return (
                      <button
                        key={integration.id}
                        onClick={() => setSelectedIntegration(integration.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          isSelected
                            ? 'bg-[#1a1a1a] text-white'
                            : 'text-gray-400 hover:bg-[#1a1a1a]/50 hover:text-white'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${isSelected ? integration.color : ''}`} />
                        <span className="font-medium text-sm">{integration.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Integrations Content */}
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-6">
                  {integrations.find(i => i.id === selectedIntegration)?.name} Notifications
                </h2>

                {selectedIntegration === 'email' ? (
                  <div className="bg-[#0f0f0f] border border-white/10 rounded-lg p-6">
                    <p className="text-gray-400 mb-6">
                      You can add up to 2 more email addresses apart from primary emails. We'll send notifications to these emails if any of your monitors go down.
                    </p>

                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-gray-300 font-medium">Primary Emails:</span>
                        <span className="text-gray-400">{user?.email || 'ahmaddiscord2@gmail.com'}</span>
                      </div>
                    </div>

                    {additionalEmails.length > 0 && (
                      <div className="mb-6">
                        <div className="text-gray-300 font-medium mb-3">Additional Emails:</div>
                        <div className="space-y-2">
                          {additionalEmails.map((email, index) => (
                            <div key={index} className="flex items-center justify-between bg-[#1a1a1a] px-4 py-2 rounded-lg">
                              <span className="text-gray-400">{email}</span>
                              <button
                                onClick={() => handleRemoveEmail(index)}
                                className="text-red-400 hover:text-red-300 text-sm"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {additionalEmails.length < 2 && (
                      <div className="flex gap-3">
                        <input
                          type="email"
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          placeholder="Enter email address"
                          className="flex-1 px-4 py-3 bg-transparent border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50"
                          onKeyPress={(e) => e.key === 'Enter' && handleAddEmail()}
                        />
                        <button
                          onClick={handleAddEmail}
                          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                        >
                          Add Email
                        </button>
                      </div>
                    )}

                    {additionalEmails.length >= 2 && (
                      <p className="text-yellow-500 text-sm mt-4">
                        Maximum limit of 2 additional emails reached
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="bg-[#0f0f0f] border border-white/10 rounded-lg p-6">
                    <p className="text-gray-400 mb-4">
                      {integrations.find(i => i.id === selectedIntegration)?.name} integration is coming soon. Stay tuned for updates!
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                      <span>Under Development</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Monitors View
            <>
              {/* Search and Filter */}
              <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Search sites..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50"
                  />
                </div>
                <button className="px-6 py-3 bg-[#1a1a1a] border border-white/10 rounded-lg hover:bg-white/5 transition-colors flex items-center gap-2 text-sm">
                  <span>Filter</span>
                </button>
              </div>

          {/* Table */}
          <div className="bg-[#0f0f0f] border border-white/10 rounded-lg overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-4 gap-4 px-6 py-4 border-b border-white/10 text-sm font-medium text-gray-400">
              <div className="flex items-center gap-1">
                Name <span className="text-xs">↕</span>
              </div>
              <div>Type</div>
              <div>Frequency</div>
              <div className="flex items-center gap-1">
                Status <span className="text-xs">↕</span>
              </div>
            </div>

            {/* Monitors List */}
            {monitorsLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mb-4"></div>
                <p className="text-gray-400">Loading monitors...</p>
              </div>
            ) : monitors.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <p className="text-gray-400 text-lg">Nothing to see here</p>
                <p className="text-gray-500 text-sm mt-2">Create your first monitor to get started</p>
              </div>
            ) : (
              monitors
                .filter(monitor =>
                  monitor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (monitor.url && monitor.url.toLowerCase().includes(searchQuery.toLowerCase())) ||
                  (monitor.ipAddress && monitor.ipAddress.toLowerCase().includes(searchQuery.toLowerCase()))
                )
                .map((monitor) => (
                  <div
                    key={monitor._id}
                    onClick={() => navigate(`/dashboard/monitors/${monitor._id}`)}
                    className="grid grid-cols-4 gap-4 px-6 py-4 border-b border-white/10 hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        monitor.lastStatus === 'up' ? 'bg-green-500' :
                        monitor.lastStatus === 'down' ? 'bg-red-500' :
                        'bg-gray-400'
                      }`}></div>
                      <span className="text-white font-medium">{monitor.name}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-400 capitalize">{monitor.type}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-400">{monitor.frequency}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`${
                        monitor.lastStatus === 'up' ? 'text-green-500' :
                        monitor.lastStatus === 'down' ? 'text-red-500' :
                        'text-gray-400'
                      } font-medium capitalize`}>
                        {monitor.lastStatus || 'Pending'}
                      </span>
                      {monitor.uptime24h !== undefined && (
                        <span className="text-xs text-gray-500">{monitor.uptime24h}%</span>
                      )}
                    </div>
                  </div>
                ))
            )}
          </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-gray-400">Showing {monitors.length} of {monitors.length} rows</p>
                <div className="flex gap-2">
                  <button className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">
                    Show 10 ▼
                  </button>
                  <button className="px-4 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-sm text-gray-500">
                    Previous
                  </button>
                  <button className="px-4 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-sm text-gray-500">
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Sidebar */}
        <aside className="w-80 bg-[#0f0f0f] border-l border-white/10 p-6">
          {/* New Monitor Dropdown */}
          <div className="relative mb-8" ref={dropdownRef}>
            <button
              onClick={() => setShowMonitorDropdown(!showMonitorDropdown)}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <ChevronDown size={20} />
              <span>New Monitor</span>
            </button>

            {/* Dropdown Menu */}
            {showMonitorDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-white/10 rounded-lg overflow-hidden shadow-xl z-50">
                {/* HTTP Monitor Option */}
                <button
                  onClick={() => handleCreateMonitor('http')}
                  className="w-full px-6 py-4 text-left hover:bg-white/5 transition-colors border-b border-white/10"
                >
                  <div className="flex items-start gap-3">
                    <Globe size={24} className="text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-white font-semibold text-base mb-1">HTTP Monitor</h4>
                      <p className="text-gray-400 text-sm">Monitor websites and API endpoints</p>
                    </div>
                  </div>
                </button>

                {/* Ping Monitor Option */}
                <button
                  onClick={() => handleCreateMonitor('ping')}
                  className="w-full px-6 py-4 text-left hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <Radio size={24} className="text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-white font-semibold text-base mb-1">Ping Monitor</h4>
                      <p className="text-gray-400 text-sm">Monitor server availability using IP addresses</p>
                    </div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Current Status */}
          <div className="mb-8">
            <h3 className="text-lg font-bold mb-4">Current Status</h3>
            <div className="flex items-center justify-between mb-2">
              <div className="flex gap-2">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                <span className="w-3 h-3 bg-gray-400 rounded-full"></span>
              </div>
            </div>
            <p className="text-sm text-gray-400">Using {monitors.length} out of 5 Monitors</p>
          </div>

          {/* Last 24 Hours */}
          <div>
            <h3 className="text-lg font-bold mb-4">Last 24 hours</h3>
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Overall</p>
                  <p className="text-sm text-gray-400">Uptime</p>
                </div>
                <div className="text-3xl font-bold">
                  {monitors.length > 0
                    ? (monitors.reduce((sum, m) => sum + (m.uptime24h || 0), 0) / monitors.length).toFixed(1)
                    : 0}%
                </div>
              </div>

              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-400">Incidents</p>
                <p className="text-3xl font-bold">
                  {monitors.filter(m => m.lastStatus === 'down').length}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Active</p>
                  <p className="text-2xl font-bold">{monitors.filter(m => m.lastStatus === 'up').length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Down</p>
                  <p className="text-2xl font-bold">{monitors.filter(m => m.lastStatus === 'down').length}</p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default Dashboard;
