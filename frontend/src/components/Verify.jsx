import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const Verify = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('Verifying your magic link...');

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link');
        return;
      }

      try {
        const response = await fetch('http://localhost:8000/api/auth/verify-magic-link', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem('auth_token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));

          setStatus('success');
          setMessage('Successfully verified! Redirecting to dashboard...');

          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        } else {
          setStatus('error');
          setMessage(data.error || 'Verification failed');
        }
      } catch (err) {
        setStatus('error');
        setMessage('Network error. Please try again.');
      }
    };

    verifyToken();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center mb-6">
          <img src="/logo.png" alt="Pingly Logo" className="h-16 w-16" />
        </div>

        {status === 'verifying' && (
          <div>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-lg text-gray-400">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <div className="text-6xl mb-4">✓</div>
            <h1 className="text-2xl font-bold mb-2">Success!</h1>
            <p className="text-gray-400">{message}</p>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div className="text-6xl mb-4 text-red-500">✗</div>
            <h1 className="text-2xl font-bold mb-2">Verification Failed</h1>
            <p className="text-gray-400 mb-6">{message}</p>
            <button
              onClick={() => navigate('/signup')}
              className="px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
            >
              Back to Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Verify;
