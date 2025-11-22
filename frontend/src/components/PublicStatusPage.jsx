import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Check } from 'lucide-react';

const PublicStatusPage = () => {
  const { id } = useParams();
  const [statusPage, setStatusPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicStatusPage();
  }, [id]);

  const fetchPublicStatusPage = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/public/status-pages/${id}`);
      const data = await response.json();

      if (response.ok) {
        setStatusPage(data);
      } else {
        console.error('Failed to fetch status page:', data.error);
      }
    } catch (error) {
      console.error('Error fetching status page:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUptimePercentage = (monitor) => {
    if (!monitor.uptimeData || monitor.uptimeData.length === 0) return '0.00';
    const upCount = monitor.uptimeData.filter(d => d.status === 'up').length;
    return ((upCount / monitor.uptimeData.length) * 100).toFixed(2);
  };

  const getOverallStatus = () => {
    if (!statusPage || !statusPage.sections) return 'operational';

    for (const section of statusPage.sections) {
      for (const monitor of section.monitors) {
        if (monitor.lastStatus === 'down') {
          return 'down';
        }
      }
    }
    return 'operational';
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZoneName: 'short'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!statusPage) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <p className="text-xl text-gray-400">Status page not found</p>
      </div>
    );
  }

  const overallStatus = getOverallStatus();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0f0f0f]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {statusPage.logoUrl ? (
              <a
                href={statusPage.logoLinkUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center"
              >
                <img
                  src={statusPage.logoUrl}
                  alt={statusPage.name}
                  className="h-10 w-10 object-contain"
                />
              </a>
            ) : (
              <div className="w-10 h-10 bg-white rounded flex items-center justify-center">
                <span className="text-black font-bold text-xl">
                  {statusPage.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-6">
            <button className="text-white font-medium">Services</button>
            <button className="text-gray-400 hover:text-white transition-colors">
              Status Updates
            </button>
            <button className="text-gray-400 hover:text-white transition-colors">
              Get in touch
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-16">
        {/* Overall Status */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center ${
              overallStatus === 'operational' ? 'bg-green-500' : 'bg-red-500'
            }`}>
              {overallStatus === 'operational' && <Check size={48} className="text-white" />}
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">
            {overallStatus === 'operational' ? 'All services are online' : 'Some services are down'}
          </h1>
          <p className="text-gray-400">
            As of {formatDate(new Date())}
          </p>
        </div>

        {/* Services */}
        {statusPage.sections && statusPage.sections.map((section, index) => (
          <div key={index} className="mb-12">
            <h2 className="text-2xl font-bold mb-6">{section.name}</h2>

            <div className="space-y-6">
              {section.monitors && section.monitors.map((monitor) => (
                <div key={monitor._id} className="bg-[#0f0f0f] border border-white/10 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        monitor.lastStatus === 'up' ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <h3 className="text-xl font-semibold">{monitor.name}</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-green-500 font-semibold">
                        Uptime {getUptimePercentage(monitor)}%
                      </p>
                    </div>
                  </div>

                  {/* Uptime Bars */}
                  <div className="flex items-center gap-1 mb-2">
                    {monitor.uptimeData && monitor.uptimeData.length > 0 ? (
                      monitor.uptimeData.map((data, idx) => (
                        <div
                          key={idx}
                          className={`flex-1 h-10 rounded ${
                            data.status === 'up' ? 'bg-green-500' :
                            data.status === 'down' ? 'bg-red-500' :
                            'bg-gray-700'
                          }`}
                          title={`${data.status} - ${new Date(data.timestamp).toLocaleString()}`}
                        ></div>
                      ))
                    ) : (
                      // Show grey bars when no data
                      Array.from({ length: 60 }).map((_, idx) => (
                        <div
                          key={idx}
                          className="flex-1 h-10 rounded bg-gray-700"
                        ></div>
                      ))
                    )}
                  </div>

                  <div className="flex justify-between text-sm text-gray-400">
                    <span>7 days ago</span>
                    <span>Today</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {(!statusPage.sections || statusPage.sections.length === 0) && (
          <div className="text-center py-12">
            <p className="text-gray-400">No monitors configured yet</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#0f0f0f] mt-16">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center text-gray-400 text-sm">
          <p>Powered by Pingly</p>
        </div>
      </footer>
    </div>
  );
};

export default PublicStatusPage;
