// app/api/webhooks/mailgun/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import crypto from 'crypto'; // For webhook signature verification

// IMPORTANT: Store your Mailgun Webhook Signing Key in .env.local
const MAILGUN_WEBHOOK_SIGNING_KEY = process.env.MAILGUN_WEBHOOK_SIGNING_KEY;

// Mailgun webhook signature verification function
// Refer to Mailgun documentation for the most up-to-date verification method
function verifyMailgunWebhook(timestamp, token, signature) {
  if (!MAILGUN_WEBHOOK_SIGNING_KEY) {
    console.error('Mailgun webhook signing key not configured. Cannot verify webhook.');
    return false; // Or true in dev if you want to bypass, but not recommended for prod
  }
  const encodedToken = crypto
    .createHmac('sha256', MAILGUN_WEBHOOK_SIGNING_KEY)
    .update(timestamp + token)
    .digest('hex');
  return crypto.timingSafeEqual(Buffer.from(encodedToken, 'hex'), Buffer.from(signature, 'hex'));
}

export async function POST(request) {
  try {
    const body = await request.json(); // Mailgun sends JSON payload

    // --- Webhook Signature Verification (CRITICAL for security) ---
    const signatureData = body.signature;
    if (!signatureData || !signatureData.timestamp || !signatureData.token || !signatureData.signature) {
      console.warn('Mailgun Webhook: Missing signature data.');
      return NextResponse.json({ message: 'Webhook signature data missing.' }, { status: 400 });
    }
    
    // In development, you might bypass this if you haven't set up signing keys yet,
    // BUT DO NOT BYPASS IN PRODUCTION.
    if (process.env.NODE_ENV !== 'development' && !verifyMailgunWebhook(signatureData.timestamp.toString(), signatureData.token, signatureData.signature)) {
      console.warn('Mailgun Webhook: Invalid signature.');
      return NextResponse.json({ message: 'Invalid webhook signature.' }, { status: 403 });
    }
    // --- End Signature Verification ---

    const eventData = body['event-data'];
    if (!eventData) {
      return NextResponse.json({ message: 'No event data in webhook.' }, { status: 400 });
    }

    console.log('Mailgun Webhook Received:', eventData.event, 'for recipient:', eventData.recipient);

    if (eventData.event === 'opened' || eventData.event === 'clicked') { // Handle 'opened' or 'clicked' events
      const recipientEmail = eventData.recipient;
      const messageId = eventData.message?.headers?.['message-id']; // Mailgun often provides message-id here
      const timestamp = new Date(eventData.timestamp * 1000); // Mailgun timestamp is in seconds

      if (!recipientEmail || !messageId) {
        console.warn('Mailgun Webhook: Missing recipient or message-id for opened/clicked event.');
        return NextResponse.json({ message: 'Recipient or message-id missing.' }, { status: 400 });
      }

      const { db } = await connectToDatabase();
      
      // Find the contact and update the specific email_history entry
      // This query assumes mailgun_id in email_history matches the messageId from the webhook
      const updateResult = await db.collection('contacts').updateOne(
        { 
          "email": recipientEmail, // Find contact by email
          "email_history.mailgun_id": messageId // Match the specific email
        },
        { 
          $set: { 
            "email_history.$.opened_at": timestamp, // Update the matched email_history element
            "email_history.$.status": eventData.event, // e.g., 'opened' or 'clicked'
            "last_email_opened_timestamp": timestamp, // Also update the top-level field
            "updatedAt": new Date()
          }
        }
      );

      if (updateResult.matchedCount === 0) {
        console.warn(`Mailgun Webhook: No matching contact/email found for recipient ${recipientEmail} and messageId ${messageId}`);
        return NextResponse.json({ message: 'No matching contact or email history entry found.' }, { status: 404 });
      }
      if (updateResult.modifiedCount === 0) {
        console.log(`Mailgun Webhook: Contact/email already marked or no change for ${recipientEmail}, messageId ${messageId}`);
      } else {
        console.log(`Mailgun Webhook: Marked email as ${eventData.event} for ${recipientEmail}, messageId ${messageId}`);
      }
      
      return NextResponse.json({ message: `Webhook processed successfully for event: ${eventData.event}` }, { status: 200 });
    }

    return NextResponse.json({ message: 'Webhook received, event not processed.' }, { status: 200 });

  } catch (error) {
    console.error('Mailgun Webhook Error:', error);
    return NextResponse.json({ message: 'Error processing webhook', error: error.message }, { status: 500 });
  }
}
