import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, AlertCircle, FileText, Zap, Settings, Filter, Search } from 'lucide-react';

const Incidents = () => {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState([]);
  const [filteredIncidents, setFilteredIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'started', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const menuItems = [
    { id: 'monitors', label: 'Monitors', icon: LayoutGrid },
    { id: 'incidents', label: 'Incidents', icon: AlertCircle },
    { id: 'status-pages', label: 'Status Pages', icon: FileText },
    { id: 'integrations', label: 'Integrations', icon: Zap },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  useEffect(() => {
    fetchIncidents();
  }, []);

  useEffect(() => {
    // Filter incidents based on search query
    if (searchQuery.trim() === '') {
      setFilteredIncidents(incidents);
    } else {
      const filtered = incidents.filter(incident =>
        incident.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
        incident.error.toLowerCase().includes(searchQuery.toLowerCase()) ||
        incident.status.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredIncidents(filtered);
    }
    setCurrentPage(1); // Reset to first page when searching
  }, [searchQuery, incidents]);

  const fetchIncidents = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      navigate('/');
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/incidents`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setIncidents(data.incidents || []);
        setFilteredIncidents(data.incidents || []);
      } else {
        console.error('Failed to fetch incidents:', data.error);
      }
    } catch (error) {
      console.error('Error fetching incidents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedIncidents = [...filteredIncidents].sort((a, b) => {
    if (sortConfig.key === 'status') {
      return sortConfig.direction === 'asc'
        ? a.status.localeCompare(b.status)
        : b.status.localeCompare(a.status);
    }
    if (sortConfig.key === 'started') {
      const dateA = new Date(a.started).getTime();
      const dateB = new Date(b.started).getTime();
      return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
    }
    if (sortConfig.key === 'duration') {
      return sortConfig.direction === 'asc'
        ? a.duration - b.duration
        : b.duration - a.duration;
    }
    return 0;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentIncidents = sortedIncidents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedIncidents.length / itemsPerPage);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDuration = (minutes) => {
    if (minutes < 1) return '< 1 min';
    if (minutes < 60) return `${Math.round(minutes)} min`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
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
                      item.id === 'incidents'
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
        <h1 className="text-3xl font-bold mb-8">Incidents</h1>

        {/* Search and Filter */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search Sites..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50"
            />
          </div>
          <button className="ml-4 px-6 py-3 bg-[#1a1a1a] border border-white/10 rounded-lg text-white hover:bg-white/5 transition-colors flex items-center gap-2">
            <Filter size={18} />
            Filter
          </button>
        </div>

        {/* Incidents Table */}
        <div className="bg-[#0f0f0f] border border-white/10 rounded-lg overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-[#1a1a1a] border-b border-white/10">
            <button
              onClick={() => handleSort('status')}
              className="col-span-2 text-left text-sm font-medium text-gray-400 hover:text-white transition-colors flex items-center gap-2"
            >
              Status
              <span className="text-xs">↕</span>
            </button>
            <div className="col-span-3 text-left text-sm font-medium text-gray-400">
              Url
            </div>
            <div className="col-span-3 text-left text-sm font-medium text-gray-400">
              Error
            </div>
            <button
              onClick={() => handleSort('started')}
              className="col-span-2 text-left text-sm font-medium text-gray-400 hover:text-white transition-colors flex items-center gap-2"
            >
              Started
              <span className="text-xs">↕</span>
            </button>
            <button
              onClick={() => handleSort('duration')}
              className="col-span-2 text-left text-sm font-medium text-gray-400 hover:text-white transition-colors flex items-center gap-2"
            >
              Duration
              <span className="text-xs">↕</span>
            </button>
          </div>

          {/* Table Body */}
          {currentIncidents.length > 0 ? (
            <div>
              {currentIncidents.map((incident, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/10 hover:bg-white/5 transition-colors"
                >
                  <div className="col-span-2 flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      incident.status === 'down' ? 'bg-red-500' : 'bg-yellow-500'
                    }`}></div>
                    <span className="text-white capitalize text-sm">{incident.status}</span>
                  </div>
                  <div className="col-span-3 text-white text-sm truncate" title={incident.url}>
                    {incident.url}
                  </div>
                  <div className="col-span-3 text-gray-400 text-sm truncate" title={incident.error}>
                    {incident.error}
                  </div>
                  <div className="col-span-2 text-gray-400 text-sm">
                    {formatDate(incident.started)}
                  </div>
                  <div className="col-span-2 text-gray-400 text-sm">
                    {formatDuration(incident.duration)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-24 text-center">
              <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Nothing to see here</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-gray-400">
            Showing {sortedIncidents.length > 0 ? indexOfFirstItem + 1 : 0} to{' '}
            {Math.min(indexOfLastItem, sortedIncidents.length)} of {sortedIncidents.length} rows
          </p>
          <div className="flex items-center gap-4">
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-4 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-green-500/50"
            >
              <option value={10}>Show 10</option>
              <option value={25}>Show 25</option>
              <option value={50}>Show 50</option>
              <option value={100}>Show 100</option>
            </select>
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white text-sm hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages || sortedIncidents.length === 0}
              className="px-4 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white text-sm hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Incidents;
