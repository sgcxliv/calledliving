import { supabase } from '../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { file, receiverId } = req.body;
    
    if (!file || !receiverId) {
      return res.status(400).json({ error: 'Missing file or receiver ID' });
    }
    
    // Generate unique filename
    const filename = `${user.id}_${Date.now()}.mp3`;
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('audio-messages')
      .upload(`public/${filename}`, file, {
        contentType: 'audio/mp3'
      });
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('audio-messages')
      .getPublicUrl(`public/${filename}`);
    
    // Save message to database
    const { data: message, error: msgError } = await supabase
      .from('messages')
      .insert([
        {
          sender_id: user.id,
          receiver_id: receiverId,
          file_path: filename,
          audio_url: urlData.publicUrl
        }
      ]);
    
    if (msgError) {
      return res.status(400).json({ error: msgError.message });
    }
    
    return res.status(200).json({ success: true, message });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
