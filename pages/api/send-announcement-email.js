// pages/api/send-announcement-email.js
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Email configuration
const emailConfig = {
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
};

// Helper functions
const stripHtml = (html) => html.replace(/<[^>]*>?/gm, '');
const createTextPreview = (content, maxLength = 150) => {
  const stripped = stripHtml(content);
  return stripped.length <= maxLength ? stripped : stripped.substring(0, maxLength) + '...';
};

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Log environment variables (redacted for security)
    console.log('Environment check:', {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasEmailHost: !!process.env.EMAIL_HOST,
      hasEmailUser: !!process.env.EMAIL_USER,
      hasEmailPass: !!process.env.EMAIL_PASSWORD,
      emailFrom: process.env.EMAIL_FROM || 'whatiscalledliving@gmail.com',
      nodeEnv: process.env.NODE_ENV
    });

    const { announcementId, courseId } = req.body;
    console.log('Request payload:', { announcementId, courseId });
    
    if (!announcementId) {
      return res.status(400).json({ error: 'Announcement ID is required' });
    }

    // Create the email transporter
    // In production, always use the configured email service
    let transporter = nodemailer.createTransport(emailConfig);
    let isEtherealAccount = false;
    let previewUrl = null;

    // Test SMTP connection
    try {
      await transporter.verify();
      console.log('SMTP connection verified successfully');
    } catch (verifyError) {
      console.error('SMTP verification failed:', verifyError);
      return res.status(500).json({ 
        error: 'Email service configuration error', 
        details: verifyError.message 
      });
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
    console.log('Announcement found:', { id: announcement.id, title: announcement.title });

    // 2. Get all student profiles
    const { data: studentProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('role', 'student');
    
    if (profilesError) {
      console.error('Error fetching student profiles:', profilesError);
      return res.status(500).json({ error: 'Error fetching student profiles' });
    }
    
    if (!studentProfiles || studentProfiles.length === 0) {
      console.log('No student profiles found');
      return res.status(200).json({ message: 'No student profiles found to notify' });
    }
    
    // Extract email addresses from student profiles
    const emailAddresses = studentProfiles.map(profile => profile.email).filter(Boolean);
    console.log(`Found ${emailAddresses.length} student email addresses`);
    
    if (emailAddresses.length === 0) {
      return res.status(200).json({ message: 'No student email addresses found' });
    }

    // 3. Create the email content
    const courseName = 'RELIGST18N: What is Called Living?';
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://whatiscalledliving.vercel.app';
    const announcementUrl = siteUrl;
    const hasAttachments = announcement.file_path || announcement.link;
    
    const emailSubject = `[${courseName}] New Announcement: ${announcement.title}`;
    
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
          <h2 style="margin-top: 0; color: #333;">${announcement.title}</h2>
          <p style="color: #666; font-size: 14px;">Posted on ${new Date(announcement.created_at).toLocaleDateString()}</p>
        </div>
        
        <div style="line-height: 1.6; color: #333;">
          <p>${announcement.content}</p>
          
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
      
      ${announcement.content}
      
      ${hasAttachments ? 'This announcement contains files or links that aren\'t shown in this email.\n' : ''}
      
      To view the full announcement, visit: ${announcementUrl}
      
      This is an automated message from your learning management system. Do not reply to this email.
    `;

    // 4. Send the email to all students
    const emailFrom = process.env.EMAIL_FROM || 'whatiscalledliving@gmail.com';
    
    console.log(`Sending email from ${emailFrom} to ${emailAddresses.length} students`);
    
    const mailOptions = {
      from: emailFrom,
      bcc: emailAddresses, // Send to all students using BCC for privacy
      subject: emailSubject,
      text: plainTextContent,
      html: emailHtml,
    };
    
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      
      // 5. Return success response
      return res.status(200).json({
        success: true,
        message: `Notification email sent to ${emailAddresses.length} recipients`,
        messageId: info.messageId,
        recipientCount: emailAddresses.length
      });
    } catch (sendError) {
      console.error('Error sending email:', sendError);
      return res.status(500).json({ 
        error: 'Failed to send email',
        details: sendError.message
      });
    }
  } catch (error) {
    console.error('General error in email handler:', error);
    return res.status(500).json({ 
      error: 'Failed to process request',
      details: error.message
    });
  }
}
