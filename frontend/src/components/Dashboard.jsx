import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-white/10 bg-black/80 backdrop-blur-md">
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Pingly Logo" className="h-8 w-8" />
            <div className="text-2xl font-bold">Pingly</div>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 border border-white/20 rounded-lg hover:bg-white/5 transition-colors text-sm"
          >
            Logout
          </button>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Welcome to your Dashboard!</h1>
          <p className="text-gray-400 text-lg mb-8">
            You're successfully logged in as{' '}
            <span className="text-white font-semibold">{user?.email}</span>
          </p>

          <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">Your Account</h2>
            <div className="space-y-3">
              <div>
                <span className="text-gray-400">Email:</span>{' '}
                <span className="text-white">{user?.email}</span>
              </div>
              {user?.name && (
                <div>
                  <span className="text-gray-400">Name:</span>{' '}
                  <span className="text-white">{user?.name}</span>
                </div>
              )}
              <div>
                <span className="text-gray-400">Member since:</span>{' '}
                <span className="text-white">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold mb-2">0</div>
              <div className="text-gray-400">Monitors</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold mb-2">0</div>
              <div className="text-gray-400">Status Pages</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold mb-2">100%</div>
              <div className="text-gray-400">Uptime</div>
            </div>
          </div>

          <div className="mt-8 p-6 bg-white/5 border border-white/10 rounded-lg">
            <h3 className="text-xl font-bold mb-2">Get Started</h3>
            <p className="text-gray-400 mb-4">
              Your dashboard is ready! Start monitoring your websites and services.
            </p>
            <button className="px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-semibold">
              Create Your First Monitor
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
