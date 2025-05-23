// lib/mailgun.js (New File)
import formData from 'form-data'; // mailgun.js v5+ uses form-data
import Mailgun from 'mailgun.js'; // mailgun.js v5+

const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY;
const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN;
const MAILGUN_API_URL = process.env.MAILGUN_API_URL || 'https://api.mailgun.net';

if (!MAILGUN_API_KEY || !MAILGUN_DOMAIN) {
  console.warn(
    "Mailgun API Key or Domain is not configured. Email sending will not work. " +
    "Please set MAILGUN_API_KEY and MAILGUN_DOMAIN environment variables."
  );
}

const mailgun = new Mailgun(formData);
let mg;

if (MAILGUN_API_KEY && MAILGUN_DOMAIN) {
  mg = mailgun.client({
    username: 'api',
    key: MAILGUN_API_KEY,
    url: MAILGUN_API_URL, // Use the configured API URL
  });
} else {
  // Provide a mock client if not configured, to prevent crashes
  mg = {
    messages: {
      create: async (domain, data) => {
        console.warn("Mailgun is not configured. Mock email send:", data);
        // Simulate a successful response structure for testing UI flow
        return {
          id: `<mock-${Date.now()}@${domain}>`,
          message: "Queued. Thank you. (Mocked - Mailgun not configured)",
        };
      }
    }
  };
}


/**
 * Sends an email using Mailgun.
 * @param {object} mailData
 * @param {string} mailData.to - Recipient's email address.
 * @param {string} mailData.from - Sender's email address (e.g., "Your Name <you@yourdomain.com>").
 * @param {string} mailData.subject - Email subject.
 * @param {string} mailData.text - Plain text body of the email.
 * @param {string} [mailData.html] - HTML body of the email (optional).
 * @param {Array<object>} [mailData.attachment] - Array of attachment objects (optional).
 * @returns {Promise<object>} - The Mailgun API response.
 */
export const sendEmail = async ({ to, from, subject, text, html, attachment }) => {
  if (!MAILGUN_API_KEY || !MAILGUN_DOMAIN) {
    console.error("Mailgun not configured. Cannot send email.");
    // Fallback to mock send if not configured, to allow UI testing.
    return mg.messages.create(MAILGUN_DOMAIN || 'mock.domain', { to, from, subject, text, html, attachment });
  }

  const data = {
    to,
    from,
    subject,
    text,
    ...(html && { html }), // Add HTML if provided
    ...(attachment && { attachment }), // Add attachment if provided
  };

  try {
    const response = await mg.messages.create(MAILGUN_DOMAIN, data);
    console.log('Email sent successfully via Mailgun:', response);
    return response;
  } catch (error) {
    console.error('Error sending email via Mailgun:', error);
    throw error; // Re-throw the error to be handled by the caller
  }
};
