import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const { token, newPassword } = req.body;

  const { data, error } = await supabaseAdmin
    .from('password_reset_tokens')
    .select('email, expires_at, used')
    .eq('token', token)
    .single();

  if (error || !data) return res.status(400).json({ error: 'Invalid or expired token' });

  if (data.used) return res.status(400).json({ error: 'Token already used' });

  if (new Date(data.expires_at) < new Date()) {
    return res.status(400).json({ error: 'Token has expired' });
  }

  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserByEmail(data.email, {
    password: newPassword
  });

  if (updateError) return res.status(500).json({ error: 'Could not update password' });

  await supabaseAdmin
    .from('password_reset_tokens')
    .update({ used: true })
    .eq('token', token);

  return res.status(200).json({ success: true });
}
