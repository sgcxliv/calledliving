// pages/forgot-password.js
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  const handleReset = async (e) => {
    e.preventDefault();
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://your-vercel-site.vercel.app/account/update-password',
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '400px', margin: 'auto' }}>
      <h2>Reset your password</h2>
      {sent ? (
        <p>Password reset link sent! Check your email.</p>
      ) : (
        <form onSubmit={handleReset}>
          <label htmlFor="email">Enter your email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ display: 'block', marginTop: '0.5rem', width: '100%' }}
          />
          <button type="submit" style={{ marginTop: '1rem' }}>
            Send Reset Link
          </button>
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </form>
      )}
    </div>
  );
}
