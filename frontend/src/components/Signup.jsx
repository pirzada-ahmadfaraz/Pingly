import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('email');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Load Google Identity Services script
    const loadGoogleScript = () => {
      if (window.google) return;
      
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    };

    loadGoogleScript();
  }, []);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setStep('otp');
      } else {
        setError(data.error || 'Failed to send code');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token: otp }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/dashboard');
      } else {
        setError(data.error || 'Invalid code');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    setLoading(true);
    setError('');
    
    // Create a popup window for Google OAuth
    const redirectUri = `${window.location.origin}/auth/google/callback`;
    const googleAuthUrl = `https://accounts.google.com/oauth/authorize?` +
      `client_id=${process.env.REACT_APP_GOOGLE_CLIENT_ID}&` +
      `response_type=code&` +
      `scope=openid%20email%20profile&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `access_type=offline&` +
      `prompt=select_account`;
    
    console.log('Google Auth URL:', googleAuthUrl);
    console.log('Redirect URI:', redirectUri);
    console.log('Client ID:', process.env.REACT_APP_GOOGLE_CLIENT_ID);
    
    const popup = window.open(
      googleAuthUrl,
      'googleAuth',
      'width=500,height=600,scrollbars=yes,resizable=yes,top=100,left=100'
    );
    
    // Listen for popup close
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        setLoading(false);
      }
    }, 1000);
    
    // Listen for messages from popup
    const messageListener = (event) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
        handleGoogleCallback({ credential: event.data.credential });
        popup.close();
        window.removeEventListener('message', messageListener);
      } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
        setError(event.data.error || 'Google authentication failed');
        setLoading(false);
        popup.close();
        window.removeEventListener('message', messageListener);
      }
    };
    
    window.addEventListener('message', messageListener);
  };

  const handleGoogleCallback = async (response) => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/dashboard');
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">

      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <img src="/logo.png" alt="Pingly Logo" className="h-12 w-12" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
          <p className="text-gray-400 text-base">
            {step === 'email' ? 'Sign in to your account or create a new one' : 'Enter the verification code sent to your email'}
          </p>
        </div>

        {message && (
          <div className="mb-4 p-3 bg-white/10 border border-white/20 rounded-lg text-sm text-white">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
            {error}
          </div>
        )}

        {step === 'email' ? (
          <>
            <form onSubmit={handleSendOTP} className="mb-5">
              <input
                type="email"
                placeholder="mail@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 mb-3 bg-transparent border border-white/20 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-white/40 transition-colors text-sm"
                required
                disabled={loading}
              />
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-white hover:bg-gray-200 text-black text-base py-5 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Continue with Email'}
              </Button>
            </form>

            <div className="relative mb-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-black text-gray-400">OR CONTINUE WITH</span>
              </div>
            </div>

            <button
              onClick={handleGoogleSignup}
              disabled={loading}
              className="w-full px-4 py-3 bg-transparent border border-white/20 rounded-lg text-white hover:bg-white/5 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span className="font-medium text-sm">
                {loading ? 'Loading...' : 'Login with Google'}
              </span>
            </button>
          </>
        ) : (
          <form onSubmit={handleVerifyOTP} className="mb-5">
            <input
              type="text"
              placeholder="Enter verification code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-4 py-3 mb-3 bg-transparent border border-white/20 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-white/40 transition-colors text-center"
              required
              disabled={loading}
            />
            <Button
              type="submit"
              disabled={loading || !otp.trim()}
              className="w-full bg-white hover:bg-gray-200 text-black text-base py-5 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed mb-3"
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </Button>
            <button
              type="button"
              onClick={() => {
                setStep('email');
                setOtp('');
                setError('');
                setMessage('');
              }}
              className="w-full text-sm text-gray-400 hover:text-white transition-colors"
            >
              Change email
            </button>
          </form>
        )}

        <p className="text-center text-gray-400 text-xs mt-6">
          By continuing, you agree to our{' '}
          <a href="#" className="text-white underline hover:text-gray-300">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-white underline hover:text-gray-300">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
};

export default Signup;
