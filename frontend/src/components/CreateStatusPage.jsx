import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Check, LayoutGrid, AlertCircle, FileText, Zap, Settings } from 'lucide-react';

const CreateStatusPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    logoUrl: '',
    faviconUrl: '',
  });
  const [creating, setCreating] = useState(false);

  const menuItems = [
    { id: 'monitors', label: 'Monitors', icon: LayoutGrid },
    { id: 'incidents', label: 'Incidents', icon: AlertCircle },
    { id: 'status-pages', label: 'Status Pages', icon: FileText },
    { id: 'integrations', label: 'Integrations', icon: Zap },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      alert('Please enter a status page name');
      return;
    }

    setCreating(true);

    const token = localStorage.getItem('auth_token');

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/status-pages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        navigate(`/dashboard/status-pages/${data.statusPage._id}`);
      } else {
        alert(`Failed to create status page: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating status page:', error);
      alert('Error creating status page. Please try again.');
    } finally {
      setCreating(false);
    }
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
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
        <button
          onClick={() => navigate('/dashboard/status-pages')}
          className="hover:text-white transition-colors"
        >
          Status Pages
        </button>
        <ChevronRight size={16} />
      </div>

      {/* Main Content */}
      <div className="max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Create Status Page</h1>

        <div className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-white font-medium mb-3">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Status Page Name"
              className="w-full px-4 py-3 bg-[#1a1a1a] border border-green-500 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-400"
            />
          </div>

          {/* Logo Link */}
          <div>
            <label className="block text-white font-medium mb-3">Logo Link</label>
            <input
              type="text"
              value={formData.logoUrl}
              onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
              placeholder="https://public.uptimebeats.com/logo.svg"
              className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50"
            />
            <p className="text-gray-400 text-sm mt-2">
              Add link to your logo. It will be displayed on the status page.
            </p>
          </div>

          {/* Favicon Link */}
          <div>
            <label className="block text-white font-medium mb-3">Favicon Link</label>
            <input
              type="text"
              value={formData.faviconUrl}
              onChange={(e) => setFormData({ ...formData, faviconUrl: e.target.value })}
              placeholder="https://uptimebeats.com/favicon.ico"
              className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50"
            />
            <p className="text-gray-400 text-sm mt-2">
              Add link to your favicon. It will be displayed on the status page.
            </p>
          </div>

          {/* Info Message */}
          <p className="text-gray-400 text-sm">
            After creating the status page, you'll be able to add monitors and configure additional settings
          </p>

          {/* Create Button */}
          <button
            onClick={handleCreate}
            disabled={creating}
            className="w-full py-4 bg-[#1a1a1a] hover:bg-[#252525] border border-white/10 rounded-lg text-white font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check size={20} />
            {creating ? 'Creating...' : 'Create Status Page'}
          </button>
        </div>
      </div>
      </main>
    </div>
  );
};

export default CreateStatusPage;
