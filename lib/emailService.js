// lib/emailService.js
import nodemailer from 'nodemailer';

// Email configuration
let emailConfig = {
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
};

// For development/testing, you can use a test account from Ethereal
const createTestAccount = async () => {
  try {
    const testAccount = await nodemailer.createTestAccount();
    emailConfig = {
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    };
    console.log('Using Ethereal test account:', testAccount.web);
    return true;
  } catch (error) {
    console.error('Failed to create test account:', error);
    return false;
  }
};

// Use test account if in development mode and no email config is provided
const initializeEmailConfig = async () => {
  const isDev = process.env.NODE_ENV === 'development';
  const hasEmailConfig = process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASSWORD;
  
  if (isDev && !hasEmailConfig) {
    await createTestAccount();
  }
};

// Initialize email configuration
initializeEmailConfig();

// Create transporter
let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport(emailConfig);
  }
  return transporter;
};

// Text utilities
const stripHtml = (html) => {
  return html.replace(/<[^>]*>?/gm, '');
};

const createTextPreview = (content, maxLength = 150) => {
  const stripped = stripHtml(content);
  if (stripped.length <= maxLength) return stripped;
  return stripped.substring(0, maxLength) + '...';
};

// Helper function to send emails
const sendEmail = async ({ to, subject, html, text }) => {
  const emailTransporter = getTransporter();
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@yoursite.com',
    to,
    subject,
    html,
    text: text || stripHtml(html),
  };
  
  try {
    const info = await emailTransporter.sendMail(mailOptions);
    
    // Log preview URL for ethereal emails in development
    if (emailConfig.host === 'smtp.ethereal.email') {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Function to send announcement notification emails
const sendAnnouncementNotification = async ({ 
  recipients, 
  announcement, 
  courseName, 
  siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://whatiscalledliving.vercel.app'
}) => {
  // Link directly to the main dashboard
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
        <p>${createTextPreview(announcement.content, 300)}</p>
        
        ${hasAttachments ? 
          `<p style="margin-top: 20px; font-style: italic;">This announcement contains files or links that aren't shown in this email.</p>` : ''}
        
        <div style="margin-top: 30px; text-align: center;">
          <a href="${announcementUrl}" style="background-color: #4a69bd; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Full Announcement</a>
        </div>
      </div>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
        <p>This is an automated message from your learning management system. To view the full message, visit: <a href="${announcementUrl}">${siteUrl}</a></p>
      </div>
    </div>
  `;
  
  const plainTextContent = `
    New Announcement: ${announcement.title}
    Posted on ${new Date(announcement.created_at).toLocaleDateString()}
    
    ${createTextPreview(announcement.content, 300)}
    
    ${hasAttachments ? 'This announcement contains files or links that aren\'t shown in this email.\n' : ''}
    
    To view the full announcement, visit: ${announcementUrl}
    
    This is an automated message from your learning management system.
  `;

  // Use BCC for sending to multiple recipients at once
  return sendEmail({
    to: process.env.EMAIL_FROM || 'noreply@yoursite.com',
    bcc: recipients,
    subject: emailSubject,
    html: emailHtml,
    text: plainTextContent,
  });
};

export {
  sendEmail,
  sendAnnouncementNotification,
  stripHtml,
  createTextPreview
};