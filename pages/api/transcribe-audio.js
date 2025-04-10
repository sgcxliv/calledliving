import { supabase } from '../../lib/supabaseClient';
import formidable from 'formidable';
import fs from 'fs';
import fetch from 'node-fetch';

// Configure formidable to handle file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

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
    // Parse the incoming form data with formidable
    const form = new formidable.IncomingForm();
    
    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });
    
    const file = files.file;
    if (!file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }
    
    // Read the file
    const fileData = fs.readFileSync(file.filepath);
    
    // Here you would use a transcription service API like Whisper API or another service
    // For this example, I'll show a placeholder for how you'd use OpenAI Whisper API
    // You'll need to fill in the actual API endpoint and key for the service you choose
    
    // Option 1: Using OpenAI Whisper API (requires API key)
    // const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    //   },
    //   body: createFormData('file', fileData, file.originalFilename)
    // });
    
    // Option 2: Using AssemblyAI (requires API key)
    // const response = await fetch('https://api.assemblyai.com/v2/transcript', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `${process.env.ASSEMBLY_AI_KEY}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({ audio_url: uploadedAudioUrl })
    // });
    
    // Temporary placeholder for demo/development
    // In a real app, replace this with actual API call to transcription service
    const transcriptionText = "This is a placeholder transcription. Replace with actual transcription service.";
    
    // Delete the temporary file
    fs.unlinkSync(file.filepath);
    
    return res.status(200).json({ 
      success: true, 
      text: transcriptionText
    });
  } catch (error) {
    console.error('Error processing audio:', error);
    return res.status(500).json({ error: 'Error processing audio file' });
  }
}

// Helper function to create FormData for API requests
function createFormData(fieldName, fileData, filename) {
  const formData = new FormData();
  const blob = new Blob([fileData]);
  formData.append(fieldName, blob, filename);
  return formData;
}