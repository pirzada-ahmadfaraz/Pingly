import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, ExternalLink, Plus, Save, Globe, LayoutGrid, AlertCircle, FileText, Zap, Users, Settings } from 'lucide-react';

const StatusPageDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [statusPage, setStatusPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('settings');
  const [monitors, setMonitors] = useState([]);
  const [userMonitors, setUserMonitors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [sections, setSections] = useState([{ name: 'Primary Services', monitors: [] }]);

  const [formData, setFormData] = useState({
    name: '',
    logoUrl: '',
    logoLinkUrl: '',
    faviconUrl: '',
  });

  const menuItems = [
    { id: 'monitors', label: 'Monitors', icon: LayoutGrid },
    { id: 'incidents', label: 'Incidents', icon: AlertCircle },
    { id: 'status-pages', label: 'Status Pages', icon: FileText },
    { id: 'integrations', label: 'Integrations', icon: Zap },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  useEffect(() => {
    fetchStatusPage();
    fetchUserMonitors();
  }, [id]);

  const fetchStatusPage = async () => {
    const token = localStorage.getItem('auth_token');

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/status-pages/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setStatusPage(data.statusPage);
        setFormData({
          name: data.statusPage.name || '',
          logoUrl: data.statusPage.logoUrl || '',
          logoLinkUrl: data.statusPage.logoLinkUrl || '',
          faviconUrl: data.statusPage.faviconUrl || '',
        });
        setSections(data.statusPage.sections || [{ name: 'Primary Services', monitors: [] }]);
      } else {
        console.error('Failed to fetch status page:', data.error);
      }
    } catch (error) {
      console.error('Error fetching status page:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserMonitors = async () => {
    const token = localStorage.getItem('auth_token');

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/monitors`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setUserMonitors(data.monitors || []);
      }
    } catch (error) {
      console.error('Error fetching monitors:', error);
    }
  };

  const handleUpdateSettings = async () => {
    const token = localStorage.getItem('auth_token');

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/status-pages/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Status page updated successfully!');
        fetchStatusPage();
      } else {
        const data = await response.json();
        alert(`Failed to update: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating status page:', error);
      alert('Error updating status page. Please try again.');
    }
  };

  const handleSaveMonitors = async () => {
    const token = localStorage.getItem('auth_token');

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/status-pages/${id}/monitors`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sections }),
      });

      if (response.ok) {
        alert('Monitors saved successfully!');
        fetchStatusPage();
      } else {
        const data = await response.json();
        alert(`Failed to save monitors: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving monitors:', error);
      alert('Error saving monitors. Please try again.');
    }
  };

  const handleAddMonitorToSection = (sectionIndex, monitorId) => {
    const monitor = userMonitors.find(m => m._id === monitorId);
    if (!monitor) return;

    const newSections = [...sections];
    if (!newSections[sectionIndex].monitors.some(m => m._id === monitorId)) {
      newSections[sectionIndex].monitors.push(monitor);
      setSections(newSections);
    }
    setSearchQuery('');
  };

  const handleRemoveMonitorFromSection = (sectionIndex, monitorId) => {
    const newSections = [...sections];
    newSections[sectionIndex].monitors = newSections[sectionIndex].monitors.filter(
      m => m._id !== monitorId
    );
    setSections(newSections);
  };

  const handleAddSection = () => {
    setSections([...sections, { name: 'New Section', monitors: [] }]);
  };

  const handleUpdateSectionName = (sectionIndex, name) => {
    const newSections = [...sections];
    newSections[sectionIndex].name = name;
    setSections(newSections);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this status page? This action cannot be undone.')) {
      return;
    }

    const token = localStorage.getItem('auth_token');

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/status-pages/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        navigate('/dashboard/status-pages');
      } else {
        const data = await response.json();
        alert(`Failed to delete: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting status page:', error);
      alert('Error deleting status page. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const filteredMonitors = userMonitors.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        {loading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
        ) : !statusPage ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <p className="text-xl text-gray-400 mb-4">Status page not found</p>
              <button
                onClick={() => navigate('/dashboard/status-pages')}
                className="bg-green-500 hover:bg-green-600 px-6 py-2 rounded-lg"
              >
                Back to Status Pages
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
              <button
                onClick={() => navigate('/dashboard/status-pages')}
                className="hover:text-white transition-colors"
              >
                Status Pages
              </button>
              <ChevronRight size={16} />
              <span className="text-white">{statusPage.name}</span>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold">{statusPage.name}</h1>
              <a
                href={`/status/${id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <ExternalLink size={20} />
              </a>
            </div>

            {/* Tabs */}
            <div className="flex gap-6 mb-8 border-b border-white/10">
              {['settings', 'monitors', 'delete'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 px-1 text-sm font-medium transition-colors capitalize ${
                    activeTab === tab
                      ? 'text-white border-b-2 border-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="max-w-4xl space-y-6">
                <div>
                  <label className="block text-white font-medium mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-lg text-white focus:outline-none focus:border-green-500/50"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Logo</label>
                  <input
                    type="text"
                    value={formData.logoUrl}
                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                    placeholder="https://example.com/logo.png"
                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50"
                  />
                  <p className="text-gray-400 text-sm mt-2">
                    Enter the URL of your logo image. This will appear at the top of your status page.
                  </p>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Logo click destination URL</label>
                  <input
                    type="text"
                    value={formData.logoLinkUrl}
                    onChange={(e) => setFormData({ ...formData, logoLinkUrl: e.target.value })}
                    placeholder="https://example.com"
                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50"
                  />
                  <p className="text-gray-400 text-sm mt-2">
                    Enter the URL where your logo should link to when clicked on the status page.
                  </p>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Favicon Link</label>
                  <input
                    type="text"
                    value={formData.faviconUrl}
                    onChange={(e) => setFormData({ ...formData, faviconUrl: e.target.value })}
                    placeholder="https://example.com/favicon.ico"
                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50"
                  />
                  <p className="text-gray-400 text-sm mt-2">
                    Add link to your favicon. It will be displayed on the status page.
                  </p>
                </div>

                <button
                  onClick={handleUpdateSettings}
                  className="px-6 py-3 bg-green-500 hover:bg-green-600 rounded-lg font-medium transition-colors"
                >
                  Save Settings
                </button>
              </div>
            )}

            {/* Monitors Tab */}
            {activeTab === 'monitors' && (
              <div className="max-w-6xl">
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-2">Service Monitors</h3>
                  <p className="text-gray-400 text-sm mb-1">
                    Choose which monitors to show on your status page.
                  </p>
                  <p className="text-gray-400 text-sm">
                    You can drag them around to change their order, give them friendly names and add tooltip descriptions so visitors know what each monitor does.
                  </p>
                  <p className="text-green-500 text-sm mt-2">
                    Note: Remember to click "Save Changes" to apply your modifications.
                  </p>
                </div>

                {sections.map((section, sectionIndex) => (
                  <div key={sectionIndex} className="mb-8">
                    <div className="mb-4">
                      <label className="block text-white font-medium mb-2">Section name</label>
                      <input
                        type="text"
                        value={section.name}
                        onChange={(e) => handleUpdateSectionName(sectionIndex, e.target.value)}
                        className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-lg text-white focus:outline-none focus:border-green-500/50"
                      />
                    </div>

                    <div className="mb-4">
                      <h4 className="text-white font-medium mb-3">Resources</h4>
                      <div className="relative mb-4">
                        <button
                          onClick={() => {
                            const nextOpen = !isSearchOpen;
                            setIsSearchOpen(nextOpen);
                            if (nextOpen) {
                              setSearchQuery('');
                            }
                          }}
                          className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-lg text-gray-400 text-left flex items-center gap-2 hover:bg-[#252525] transition-colors"
                        >
                          <Plus size={18} />
                          Search to add resources
                        </button>

                        {isSearchOpen && (
                          <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-white/10 rounded-lg p-4 z-10">
                            <input
                              type="text"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              placeholder="Search resources..."
                              autoFocus
                              className="w-full px-4 py-2 bg-transparent border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50 mb-3"
                            />
                            <div className="max-h-60 overflow-y-auto">
                              {filteredMonitors.map((monitor) => (
                                <button
                                  key={monitor._id}
                                  onClick={() => handleAddMonitorToSection(sectionIndex, monitor._id)}
                                  className="w-full px-4 py-2 text-left hover:bg-white/5 rounded transition-colors flex items-center gap-3"
                                >
                                  <Globe size={16} className="text-gray-400" />
                                  <span className="text-white">{monitor.name}</span>
                                </button>
                              ))}
                              {filteredMonitors.length === 0 && (
                                <p className="text-gray-500 text-sm text-center py-4">No monitors found</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {section.monitors.length > 0 && (
                        <div className="space-y-2">
                          {section.monitors.map((monitor) => (
                            <div
                              key={monitor._id}
                              className="flex items-center justify-between px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <Globe size={16} className="text-gray-400" />
                                <span className="text-white">{monitor.name}</span>
                              </div>
                              <button
                                onClick={() => handleRemoveMonitorFromSection(sectionIndex, monitor._id)}
                                className="text-red-500 hover:text-red-400 text-sm"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                <button
                  onClick={handleAddSection}
                  className="px-6 py-3 bg-[#1a1a1a] border border-white/10 rounded-lg text-white hover:bg-[#252525] transition-colors flex items-center gap-2 mb-6"
                >
                  <Plus size={18} />
                  Add section
                </button>

                <button
                  onClick={handleSaveMonitors}
                  className="px-8 py-3 bg-green-500 hover:bg-green-600 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Save size={18} />
                  Save Changes
                </button>
              </div>
            )}

            {/* Delete Tab */}
            {activeTab === 'delete' && (
              <div className="max-w-2xl">
                <div className="bg-[#0f0f0f] border border-red-500/20 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-red-500 mb-2">Delete Status Page</h3>
                  <p className="text-gray-400 mb-6">
                    This action cannot be undone. This will permanently delete the status page and all associated data.
                  </p>
                  <button
                    onClick={handleDelete}
                    className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Delete Status Page
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default StatusPageDetail;
