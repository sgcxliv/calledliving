// pages/api/upload-contribution.js
import { createClient } from '@supabase/supabase-js';

// Use service role key that bypasses RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { 
      week_id, 
      contributor_name, 
      media_type, 
      caption, 
      file_path, 
      file_size, 
      file_type 
    } = req.body;

    // Insert with admin privileges
    const { data, error } = await supabaseAdmin
      .from('student_contributions')
      .insert({
        week_id,
        contributor_name,
        media_type,
        caption,
        file_path,
        file_size,
        file_type,
        created_at: new Date()
      });

    if (error) {
      console.error('Server insert error:', error);
      return res.status(400).json({ message: error.message });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}