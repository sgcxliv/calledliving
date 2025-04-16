import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function LoginForm({ onSuccessfulLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Call the callback for successful login
        if (onSuccessfulLogin) {
          onSuccessfulLogin();
        }
      }
    } catch (error) {
      setError(error.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="login-form">
    {error && <div className="error-message">{error}</div>}

    <form onSubmit={handleLogin}>
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>

    <p style={{ marginTop: '1rem' }}>
      <a href="/forgot-password" style={{ color: 'blue', textDecoration: 'underline' }}>
        Forgot your password?
      </a>
    </p>
  </div>
);
}
