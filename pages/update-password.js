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

  // Extract hash fragment containing the access token
  useEffect(() => {
    // The token is typically in the hash fragment (#access_token=...)
    const hash = window.location.hash;
    const query = window.location.search;
    
    // Debug info - you can remove this later
    console.log('Hash:', hash);
    console.log('Query:', query);
    
    // Check if we're just loading the page directly without a token
    if (!hash && !query.includes('token=')) {
      setError('No reset token found. Please request a new password reset link.');
    }
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      // The access token is automatically included in the session when using the reset link
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
      setError('An unexpected error occurred.');
      console.error(err);
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
