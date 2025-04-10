import { supabase } from '../../lib/supabaseClient';
import formidable from 'formidable';
import fs from 'fs';

// Configure Next.js to handle file uploads
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
    
    const parsedForm = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });
    
    const file = parsedForm.files.file;
    if (!file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }
    
    // Read the file
    const fileData = fs.readFileSync(file.filepath);
    
    // For now, we'll use a placeholder transcription while you decide on a transcription service
    // This way your UI will work, but you'll need to replace this with a real transcription later
    
    const transcriptionText = "This is a temporary placeholder transcription. Replace with a real transcription service when ready.";
    
    // Clean up the temporary file
    fs.unlinkSync(file.filepath);
    
    return res.status(200).json({ 
      success: true, 
      text: transcriptionText
    });
    
    /* 
    // Uncomment this section when you're ready to implement a real transcription service
    
    // Option 1: Using Web Speech API from browser and sending results to server
    // This is the simplest but requires browser transcription
    
    // Option 2: Using a transcription service API
    // Install necessary packages first: npm install openai
    
    import { Configuration, OpenAIApi } from 'openai';
    
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);
    
    const response = await openai.createTranscription(
      fs.createReadStream(file.filepath),
      "whisper-1",
      undefined,
      'text',
      1.0,
      'en'
    );
    
    const transcriptionText = response.data;
    */
    
  } catch (error) {
    console.error('Error processing audio:', error);
    return res.status(500).json({ error: 'Error processing audio file' });
  }
}
