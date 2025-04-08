// pages/api/send-announcement-email.js
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role key for admin access
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Email configuration (use environment variables in production)
const emailConfig = {
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
};

// Create helper function to strip HTML tags for the plaintext version
const stripHtml = (html) => {
  return html.replace(/<[^>]*>?/gm, '');
};

// Function to create a plaintext preview of announcement content
const createTextPreview = (content, maxLength = 150) => {
  const stripped = stripHtml(content);
  if (stripped.length <= maxLength) return stripped;
  return stripped.substring(0, maxLength) + '...';
};

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Create an Ethereal test account
    let transporter;
    try {
      // Create test account
      const testAccount = await nodemailer.createTestAccount();
      console.log('Ethereal test account created:', {
        user: testAccount.user,
        pass: testAccount.pass
      });
      
      // Create transporter with test account
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    } catch (error) {
      console.error('Error creating test account:', error);
      transporter = nodemailer.createTransport(emailConfig); // Fallback to regular config
    }

    const { announcementId, courseId } = req.body;
    
    if (!announcementId) {
      return res.status(400).json({ error: 'Announcement ID is required' });
    }

    // 1. Get the announcement details
    const { data: announcement, error: announcementError } = await supabase
      .from('announcements')
      .select('*')
      .eq('id', announcementId)
      .single();
    
    if (announcementError) {
      console.error('Error fetching announcement:', announcementError);
      return res.status(500).json({ error: 'Error fetching announcement' });
    }
    
    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    // 2. Get all student profiles
    // Get all user profiles with role 'student'
    const { data: studentProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('role', 'student');
    
    if (profilesError) {
      console.error('Error fetching student profiles:', profilesError);
      return res.status(500).json({ error: 'Error fetching student profiles' });
    }
    
    if (!studentProfiles || studentProfiles.length === 0) {
      return res.status(200).json({ message: 'No student profiles found to notify' });
    }
    
    // Extract email addresses from student profiles
    const emailAddresses = studentProfiles.map(profile => profile.email).filter(Boolean);
    
    if (emailAddresses.length === 0) {
      return res.status(200).json({ message: 'No student email addresses found' });
    }

    // 3. Create the email content
    const courseName = 'RELIGST18N: What is Called Living?';
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://whatiscalledliving.vercel.app';
    
    // Link directly to the main dashboard where announcements are displayed
    const announcementUrl = siteUrl; // Main dashboard is at the root URL
    
    const hasAttachments = announcement.file_path || announcement.link;
    
    const emailSubject = `[${courseName}] New Announcement: ${announcement.title}`;
    
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
          <h2 style="margin-top: 0; color: #333;">${announcement.title}</h2>
          <p style="color: #666; font-size: 14px;">Posted on ${new Date(announcement.created_at).toLocaleDateString()}</p>
        </div>
        
        <div style="line-height: 1.6; color: #333;">
          <p>${createTextPreview(announcement.content, 300)}</p>
          
          ${hasAttachments ? 
            `<p style="margin-top: 20px; font-style: italic;">This announcement contains files or links that aren't shown in this email.</p>` : ''}
          
          <div style="margin-top: 30px; text-align: center;">
            <a href="${announcementUrl}" style="background-color: #4a69bd; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Full Announcement</a>
          </div>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
          <p>This is an automated message. Do not reply to this email. To view the full announcement, please visit: <a href="${announcementUrl}">${siteUrl}</a></p>
        </div>
      </div>
    `;
    
    const plainTextContent = `
      New Announcement: ${announcement.title}
      Posted on ${new Date(announcement.created_at).toLocaleDateString()}
      
      ${createTextPreview(announcement.content, 300)}
      
      ${hasAttachments ? 'This announcement contains files or links that aren\'t shown in this email.\n' : ''}
      
      To view the full announcement, visit: ${announcementUrl}
      
      This is an automated message from your learning management system. Do not reply to this email.
    `;

    // 4. Send the emails
    // For production, consider using a batch email service that supports bulk sending
    // For this example, we'll use BCC to send to all recipients at once
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'whatiscalledliving@gmail.com',
      bcc: emailAddresses, // Use BCC for privacy
      subject: emailSubject,
      text: plainTextContent,
      html: emailHtml,
    };
    
    const info = await transporter.sendMail(mailOptions);
    
    // Log preview URL if using Ethereal
    if (transporter.options.host === 'smtp.ethereal.email') {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log('Ethereal Preview URL:', previewUrl);
      
      // Include preview URL in response for easier access
      return res.status(200).json({ 
        success: true, 
        message: `Test email created. Check logs for preview URL.`,
        previewUrl: previewUrl,
        recipients: emailAddresses.length
      });
    }
    
    // 5. Return success response
    res.status(200).json({ 
      success: true, 
      message: `Notification emails sent to ${emailAddresses.length} recipients` 
    });
    
  } catch (error) {
    console.error('Error sending announcement emails:', error);
    res.status(500).json({ error: 'Failed to send announcement emails' });
  }
}
