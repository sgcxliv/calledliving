// pages/update-password.js
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';

export default function UpdatePassword() {
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Use the token from the URL
  useEffect(() => {
    // Get the token from the URL
    const token = router.query.token || new URLSearchParams(window.location.search).get('token');
    
    // Debug info
    console.log('Token from URL:', token);
    
    if (!token) {
      // Check hash fragment for token (Supabase sometimes puts it there)
      const hashParams = new URLSearchParams(window.location.hash.replace('#', ''));
      const hashToken = hashParams.get('access_token');
      console.log('Hash token:', hashToken);
      
      if (!hashToken) {
        setError('No reset token found. Please request a new password reset link.');
      }
    }
  }, [router.query]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      // Get the token from the URL
      const urlToken = router.query.token || 
                     new URLSearchParams(window.location.search).get('token') ||
                     new URLSearchParams(window.location.hash.replace('#', '')).get('access_token');
      
      if (!urlToken) {
        setError('Missing password reset token. Please request a new password reset link.');
        setLoading(false);
        return;
      }

      // First, set session with the token
      const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
        access_token: urlToken,
        refresh_token: urlToken, // This might not be needed but included for safety
      });

      if (sessionError) {
        console.error('Session error:', sessionError);
        setError(sessionError.message);
        setLoading(false);
        return;
      }

      // Now update the password with the established session
      const { data, error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        setError(error.message);
      } else {
        setMessage('Password updated successfully! Redirecting to login...');
        // Redirect to login page after successful password reset
        setTimeout(() => router.push('/login'), 2000);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '400px', margin: 'auto' }}>
      <form onSubmit={handleUpdate}>
        <h2>Reset Your Password</h2>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem' }}>
            New Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem' }}
            minLength="6"
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            width: '100%', 
            padding: '0.5rem', 
            backgroundColor: loading ? '#ccc' : '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Updating...' : 'Update Password'}
        </button>
        {message && <p style={{ color: 'green', marginTop: '1rem' }}>{message}</p>}
        {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
      </form>
    </div>
  );
}
