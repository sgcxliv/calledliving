import { supabase } from '../../lib/supabaseClient';
import crypto from 'crypto';

export default async function handler(req, res) {
  const { email } = req.body;

  if (!email) return res.status(400).json({ error: 'Email is required' });

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60).toISOString(); // 1 hour

  // You’ll need a “password_reset_tokens” table in Supabase
  const { error: insertError } = await supabase
    .from('password_reset_tokens')
    .insert([{ email, token, expires_at: expiresAt }]);

  if (insertError) return res.status(500).json({ error: 'Could not save token' });

  const resetUrl = `https://whatiscalledliving.vercel.app/update-password?token=${token}`;

  // Use your own email API like Resend, SendGrid, etc. Here we just log it.
  console.log(`Reset link for ${email}: ${resetUrl}`);

  return res.status(200).json({ message: 'Password reset link sent' });
}
