import { supabase } from '../../lib/supabaseClient';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import util from 'util';

export const config = {
  api: {
    bodyParser: false, // Disabling Next.js body parsing
  },
};

// CORS headers for audio files
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',  // In production, change to your domain
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, HEAD',
  'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, Content-Type, Range, x-requested-with',
  'Access-Control-Expose-Headers': 'Content-Length, Content-Range, Content-Type',
};

export default async function handler(req, res) {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, HEAD');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, X-Client-Info, Content-Type, Range, x-requested-with');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Parse form with uploaded file
    const form = new IncomingForm();
    const readFile = util.promisify(fs.readFile);
    
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        resolve([fields, files]);
      });
    });
    
    const audioFile = files.file;
    const receiverId = fields.receiverId?.[0] || fields.receiverId;
    
    if (!audioFile || !receiverId) {
      return res.status(400).json({ error: 'Missing audio file or receiver ID' });
    }
    
    // Read the file
    const fileBuffer = await readFile(audioFile.filepath);
    
    // Determine format based on original file
    let extension = 'mp3';
    let contentType = 'audio/mpeg';

    // Check original file's type if available
    if (audioFile.mimetype) {
      if (audioFile.mimetype.includes('webm')) {
        extension = 'webm';
        contentType = 'audio/webm';
      } else if (audioFile.mimetype.includes('wav')) {
        extension = 'wav';
        contentType = 'audio/wav';
      }
    }
    
    // Generate unique filename
    const filename = `${user.id}_${Date.now()}.${extension}`;
    
    // Upload to Supabase Storage with correct content type
    const { data, error } = await supabase.storage
      .from('audio-messages')
      .upload(`${user.id}/${filename}`, fileBuffer, {
        contentType: contentType,
        cacheControl: '3600'
      });
    
    if (error) {
      console.error('Upload error:', error);
      return res.status(400).json({ error: error.message });
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('audio-messages')
      .getPublicUrl(`${user.id}/${filename}`);
    
    if (!urlData || !urlData.publicUrl) {
      return res.status(400).json({ error: 'Failed to get public URL' });
    }
    
    // Save message to database
    const { data: message, error: msgError } = await supabase
      .from('messages')
      .insert([
        {
          sender_id: user.id,
          receiver_id: receiverId,
          file_path: `${user.id}/${filename}`,
          audio_url: urlData.publicUrl,
          message_type: 'audio',
          duration: fields.duration ? parseFloat(fields.duration) : null
        }
      ]);
    
    if (msgError) {
      console.error('Database error:', msgError);
      return res.status(400).json({ error: msgError.message });
    }
    
    // Set CORS headers in response
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    
    return res.status(200).json({ 
      success: true, 
      message,
      url: urlData.publicUrl
    });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
