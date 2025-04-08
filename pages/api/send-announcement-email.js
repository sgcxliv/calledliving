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

// Create email transporter
const transporter = nodemailer.createTransport(emailConfig);

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
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

    // 2. Get course details
    let courseData;
    
    if (courseId) {
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();
      
      if (!courseError && course) {
        courseData = course;
      }
    }

    // 3. Get all users who should receive this announcement (only enrolled students)
    // This depends on your database structure, assuming a 'course_enrollments' table
    // that connects users to courses and has a role field
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from('course_enrollments')
      .select('user_id')
      .eq('course_id', courseId || announcement.course_id)
      .eq('role', 'student'); // Only select students, not professors or CDAs
    
    if (enrollmentsError) {
      console.error('Error fetching enrollments:', enrollmentsError);
      return res.status(500).json({ error: 'Error fetching enrolled students' });
    }
    
    // Extract user IDs
    const userIds = enrollments.map(enrollment => enrollment.user_id);
    
    if (userIds.length === 0) {
      return res.status(200).json({ message: 'No enrolled students to notify' });
    }
    
    // 4. Get user email addresses
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('email')
      .in('id', userIds);
    
    if (usersError) {
      console.error('Error fetching user emails:', usersError);
      return res.status(500).json({ error: 'Error fetching user emails' });
    }
    
    const emailAddresses = users.map(user => user.email);
    
    if (emailAddresses.length === 0) {
      return res.status(200).json({ message: 'No email addresses found' });
    }

    // 5. Create the email content
    const courseName = courseData ? courseData.title || courseData.name : 'RELIGST18N: What is Called Living?';
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

    // 6. Send the emails
    // For production, consider using a batch email service that supports bulk sending
    // For this example, we'll use BCC to send to all recipients at once
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'whatiscalledliving@gmail.com',
      bcc: emailAddresses, // Use BCC for privacy
      subject: emailSubject,
      text: plainTextContent,
      html: emailHtml,
    };
    
    await transporter.sendMail(mailOptions);
    
    // 7. Return success response
    res.status(200).json({ 
      success: true, 
      message: `Notification emails sent to ${emailAddresses.length} recipients` 
    });
    
  } catch (error) {
    console.error('Error sending announcement emails:', error);
    res.status(500).json({ error: 'Failed to send announcement emails' });
  }
}
