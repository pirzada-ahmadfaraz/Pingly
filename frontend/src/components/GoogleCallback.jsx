import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const handleGoogleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        // Send error to parent window
        window.opener?.postMessage({
          type: 'GOOGLE_AUTH_ERROR',
          error: 'Authentication failed'
        }, window.location.origin);
        window.close();
        return;
      }

      if (code) {
        try {
          // Exchange code for token with your backend
          const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/google-oauth`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code }),
          });

          const data = await response.json();

          if (response.ok) {
            // Send success to parent window
            window.opener?.postMessage({
              type: 'GOOGLE_AUTH_SUCCESS',
              credential: data.credential
            }, window.location.origin);
            window.close();
          } else {
            // Send error to parent window
            window.opener?.postMessage({
              type: 'GOOGLE_AUTH_ERROR',
              error: data.error || 'Authentication failed'
            }, window.location.origin);
            window.close();
          }
        } catch (err) {
          // Send error to parent window
          window.opener?.postMessage({
            type: 'GOOGLE_AUTH_ERROR',
            error: 'Network error'
          }, window.location.origin);
          window.close();
        }
      }
    };

    handleGoogleCallback();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p>Completing Google authentication...</p>
      </div>
    </div>
  );
};

export default GoogleCallback;
