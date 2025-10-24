import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, AlertCircle, FileText, Zap, Users, Settings, ChevronRight, Lock } from 'lucide-react';

const CreatePingMonitor = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    ipAddress: '',
    frequency: '5min',
    locations: ['europe-west'],
    notifyOnFailure: true,
  });

  const menuItems = [
    { id: 'monitors', label: 'Monitors', icon: LayoutGrid },
    { id: 'incidents', label: 'Incidents', icon: AlertCircle },
    { id: 'status-pages', label: 'Status Pages', icon: FileText },
    { id: 'integrations', label: 'Integrations', icon: Zap },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleLocation = (location) => {
    setFormData(prev => ({
      ...prev,
      locations: prev.locations.includes(location)
        ? prev.locations.filter(loc => loc !== location)
        : [...prev.locations, location]
    }));
  };

  const handleSubmit = async () => {
    // TODO: Implement API call to create monitor
    console.log('Creating ping monitor with data:', formData);
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');

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
      <main className="flex-1 ml-56 p-5">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="hover:text-white transition-colors"
          >
            monitors
          </button>
          <ChevronRight size={14} />
          <span className="text-white">ping monitor</span>
        </div>

        {/* Page Title */}
        <h1 className="text-2xl font-bold mb-4">Create Ping Monitor</h1>

        {/* Form Container */}
        <div className="max-w-6xl">
          {/* Your Monitor Section */}
          <div className="bg-[#0f0f0f] border border-white/10 rounded-lg p-5 mb-4">
            <h2 className="text-base font-bold mb-1">Your Monitor</h2>
            <p className="text-gray-400 text-xs mb-4">Information we need to start monitoring your server.</p>

            <div className="grid grid-cols-2 gap-4">
              {/* Name Field */}
              <div>
                <label className="block text-white text-sm font-medium mb-1.5">Name</label>
                <input
                  type="text"
                  placeholder="monitor name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50"
                />
                <p className="text-gray-400 text-xs mt-1">Name of your monitor</p>
              </div>

              {/* IP Address Field */}
              <div>
                <label className="block text-white text-sm font-medium mb-1.5">IP Address</label>
                <input
                  type="text"
                  placeholder="192.168.1.1"
                  value={formData.ipAddress}
                  onChange={(e) => handleInputChange('ipAddress', e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50"
                />
                <p className="text-gray-400 text-xs mt-1">IP address or hostname to monitor</p>
              </div>
            </div>

            {/* Frequency Section */}
            <div className="mt-5">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-white text-sm font-medium">Frequency</label>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Lock size={12} />
                  <span>1 min freq available in paid plans</span>
                  <a href="#" className="text-green-500 hover:text-green-400">Upgrade now</a>
                </div>
              </div>

              <div className="flex gap-3 mb-1">
                <button
                  onClick={() => handleInputChange('frequency', '1min')}
                  disabled
                  className="px-6 py-2 text-sm rounded-lg bg-[#1a1a1a] border border-white/10 text-gray-500 cursor-not-allowed"
                >
                  1 Min
                </button>
                <button
                  onClick={() => handleInputChange('frequency', '5min')}
                  className={`px-6 py-2 text-sm rounded-lg border transition-colors ${
                    formData.frequency === '5min'
                      ? 'bg-green-500/10 border-green-500 text-white'
                      : 'bg-[#1a1a1a] border-white/10 text-gray-400 hover:border-green-500/50'
                  }`}
                >
                  5 Min
                </button>
                <button
                  onClick={() => handleInputChange('frequency', '10min')}
                  className={`px-6 py-2 text-sm rounded-lg border transition-colors ${
                    formData.frequency === '10min'
                      ? 'bg-green-500/10 border-green-500 text-white'
                      : 'bg-[#1a1a1a] border-white/10 text-gray-400 hover:border-green-500/50'
                  }`}
                >
                  10 min
                </button>
              </div>
              <p className="text-gray-400 text-xs mt-1">Frequency for checking server availability</p>
            </div>

            {/* Monitor Location Section */}
            <div className="mt-5">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-white text-sm font-medium">Monitor Location</label>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Lock size={12} />
                  <span>Multi location checks available in paid plans</span>
                  <a href="#" className="text-green-500 hover:text-green-400">Upgrade now</a>
                </div>
              </div>

              <p className="text-gray-400 text-xs mb-3">Select the locations from which you want to check the monitor</p>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'north-america-west', label: 'North America (West)', disabled: false },
                  { id: 'north-america-east', label: 'North America (East)', disabled: false },
                  { id: 'europe-west', label: 'Europe (West)', disabled: false },
                  { id: 'europe-east', label: 'Europe (East)', disabled: false },
                  { id: 'asia-pacific', label: 'Asia Pacific', disabled: false },
                  { id: 'oceania', label: 'Oceania', disabled: false },
                ].map((location) => (
                  <label
                    key={location.id}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors cursor-pointer ${
                      formData.locations.includes(location.id)
                        ? 'bg-green-500/10 border-green-500'
                        : 'bg-[#1a1a1a] border-white/10 hover:border-green-500/50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.locations.includes(location.id)}
                      onChange={() => toggleLocation(location.id)}
                      className="hidden"
                    />
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                      formData.locations.includes(location.id)
                        ? 'bg-green-500 border-green-500'
                        : 'border-gray-500'
                    }`}>
                      {formData.locations.includes(location.id) && (
                        <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none">
                          <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <span className="text-xs text-white">{location.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Notification Settings Section */}
          <div className="bg-[#0f0f0f] border border-white/10 rounded-lg p-5 mb-4">
            <h2 className="text-base font-bold mb-1">Notification Settings</h2>
            <p className="text-gray-400 text-xs mb-3">Configure how you want to be notified.</p>

            <div>
              <label className="block text-white text-sm font-medium mb-2">Notify on Failure</label>
              <label className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-green-500/10 border-green-500 w-fit cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.notifyOnFailure}
                  onChange={(e) => handleInputChange('notifyOnFailure', e.target.checked)}
                  className="hidden"
                />
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                  formData.notifyOnFailure
                    ? 'bg-green-500 border-green-500'
                    : 'border-gray-500'
                }`}>
                  {formData.notifyOnFailure && (
                    <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none">
                      <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <span className="text-xs text-white">Notify via email on failure</span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2.5 text-sm rounded-lg transition-colors flex items-center gap-2"
            >
              <span>Start Monitoring</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreatePingMonitor;
