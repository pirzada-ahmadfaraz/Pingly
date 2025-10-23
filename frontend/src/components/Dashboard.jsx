import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('monitors');
  const [searchQuery, setSearchQuery] = useState('');

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

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  const menuItems = [
    { id: 'monitors', label: 'Monitors', icon: '📊' },
    { id: 'incidents', label: 'Incidents', icon: '⚠️' },
    { id: 'status-pages', label: 'Status Pages', icon: '📄' },
    { id: 'integrations', label: 'Integrations', icon: '🔗' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
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
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                    activeTab === item.id
                      ? 'bg-green-500/10 text-green-500'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              </li>
            ))}
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
              🚪
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-56 flex">
        {/* Center Content */}
        <div className="flex-1 p-8">
          <h1 className="text-3xl font-bold mb-8">Monitors</h1>

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
              <span className="absolute right-4 top-3.5 text-gray-500">🔍</span>
            </div>
            <button className="px-6 py-3 bg-[#1a1a1a] border border-white/10 rounded-lg hover:bg-white/5 transition-colors flex items-center gap-2 text-sm">
              <span>⚡</span>
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

            {/* Empty State */}
            <div className="flex flex-col items-center justify-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-gray-400 text-lg">Nothing to see here</p>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-gray-400">Showing 0 of 0 rows</p>
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
        </div>

        {/* Right Sidebar */}
        <aside className="w-80 bg-[#0f0f0f] border-l border-white/10 p-6">
          {/* New Monitor Button */}
          <button className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 mb-8">
            <span>▼</span>
            <span>New Monitor</span>
          </button>

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
            <p className="text-sm text-gray-400">Using 0 out of 5 Monitors</p>
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
                <div className="text-3xl font-bold">0%</div>
              </div>

              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-400">Incidents</p>
                <p className="text-3xl font-bold">0</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Without Inc.</p>
                  <p className="text-2xl font-bold">0d.</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Affected</p>
                  <p className="text-sm text-gray-400">Mon.</p>
                  <p className="text-2xl font-bold">0</p>
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
