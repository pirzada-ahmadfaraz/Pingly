import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, AlertCircle, FileText, Zap, Settings, Lock } from 'lucide-react';

const StatusPages = () => {
  const navigate = useNavigate();
  const [statusPages, setStatusPages] = useState([]);
  const [loading, setLoading] = useState(true);

  const menuItems = [
    { id: 'monitors', label: 'Monitors', icon: LayoutGrid },
    { id: 'incidents', label: 'Incidents', icon: AlertCircle },
    { id: 'status-pages', label: 'Status Pages', icon: FileText },
    { id: 'integrations', label: 'Integrations', icon: Zap },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  useEffect(() => {
    fetchStatusPages();
  }, []);

  const fetchStatusPages = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      navigate('/');
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/status-pages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setStatusPages(data.statusPages || []);
      } else {
        console.error('Failed to fetch status pages:', data.error);
      }
    } catch (error) {
      console.error('Error fetching status pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // If no status pages, show create page
  if (statusPages.length === 0) {
    navigate('/dashboard/status-pages/create');
    return null;
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
                      if (item.id === 'monitors') {
                        navigate('/dashboard');
                      } else if (item.id === 'incidents') {
                        navigate('/dashboard/incidents');
                      } else if (item.id === 'status-pages') {
                        navigate('/dashboard/status-pages');
                      } else if (item.id === 'integrations') {
                        navigate('/dashboard', { state: { activeTab: 'integrations' } });
                      }
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                      item.id === 'status-pages'
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
      <main className="flex-1 ml-56 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Status Pages</h1>
            <p className="text-gray-400 text-sm">Using {statusPages.length} of 1 available status pages</p>
          </div>
          <button
            className="px-6 py-3 bg-green-500 hover:bg-green-600 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Lock size={18} />
            Upgrade Plan
          </button>
        </div>

        {/* Status Pages Table */}
        <div className="bg-[#0f0f0f] border border-white/10 rounded-lg overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-3 gap-4 px-6 py-4 bg-[#1a1a1a] border-b border-white/10">
            <div className="text-sm font-medium text-gray-400">Name</div>
            <div className="text-sm font-medium text-gray-400">Status</div>
            <div className="text-sm font-medium text-gray-400">Public Link</div>
          </div>

          {/* Table Body */}
          <div>
            {statusPages.map((page) => (
              <div
                key={page._id}
                className="grid grid-cols-3 gap-4 px-6 py-4 border-b border-white/10 hover:bg-white/5 transition-colors"
              >
                <button
                  onClick={() => navigate(`/dashboard/status-pages/${page._id}`)}
                  className="text-white text-left hover:text-green-500 transition-colors"
                >
                  {page.name}
                </button>
                <div>
                  <span className="px-3 py-1 bg-green-500/20 text-green-500 rounded-full text-sm">
                    Operational
                  </span>
                </div>
                <a
                  href={`${window.location.origin}/status/${page._id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors text-sm truncate"
                >
                  {`${window.location.origin}/status/${page._id}`}
                </a>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default StatusPages;
