// app/api/email/send/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/authOptions';
import { sendEmail } from '@/lib/mailgun'; 
import { connectToDatabase } from '@/lib/mongodb'; 
import { ObjectId } from 'mongodb'; 

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { to, from, subject, textBody, htmlBody, contactId } = await request.json();

    if (!to || !from || !subject || (!textBody && !htmlBody)) {
      return NextResponse.json({ message: 'Missing required email fields (to, from, subject, and textBody or htmlBody).' }, { status: 400 });
    }

    if (!contactId || !ObjectId.isValid(contactId)) { 
        return NextResponse.json({ message: 'Valid contactId is required.' }, { status: 400 });
    }

    const mailgunResponse = await sendEmail({
      to,
      from,
      subject,
      text: textBody, 
      html: htmlBody, 
    });

    let dbUpdateMessage = "";
    let parsedMailgunId = null;

    if (mailgunResponse && mailgunResponse.id) { 
      // Parse the Message-ID from Mailgun's response (e.g., <2023...@yourdomain.com>)
      const idMatch = mailgunResponse.id.match(/<([^>]+)>/);
      if (idMatch && idMatch[1]) {
        parsedMailgunId = idMatch[1];
      } else {
        parsedMailgunId = mailgunResponse.id; // Fallback if parsing fails, though Mailgun usually includes <>
      }

      try {
        const { db } = await connectToDatabase();
        const emailHistoryEntry = {
          timestamp: new Date(),
          sent_from_email: from, 
          subject: subject,
          mailgun_id: parsedMailgunId, // Store the parsed ID
          status: 'sent', // Add initial status
          // opened_at: null, // This field will be updated by the webhook
        };

        const updateResult = await db.collection('contacts').updateOne(
          { _id: new ObjectId(contactId) },
          { 
            $push: { email_history: emailHistoryEntry },
            $set: { updatedAt: new Date() } // Also update the contact's general updatedAt timestamp
          }
        );

        if (updateResult.modifiedCount === 1) {
          dbUpdateMessage = "Contact history updated with sent email.";
        } else if (updateResult.matchedCount === 1 && updateResult.modifiedCount === 0) {
          // This might happen if only $push occurred on a new field and $set wasn't considered a modification alone
          // or if an identical history entry was pushed (though timestamp makes this unlikely).
          // Still, consider it a success for the email history part.
          dbUpdateMessage = "Contact history likely updated (matched, no other fields modified).";
        } else {
          dbUpdateMessage = "Contact history not updated (contact not found or no change).";
          console.warn(`Contact history update issue for contactId: ${contactId}`, updateResult);
        }
      } catch (dbError) {
        console.error("Error updating contact email history:", dbError);
        dbUpdateMessage = "Error updating contact history."; 
      }
      
      return NextResponse.json({ 
        message: `Email sent successfully! ${dbUpdateMessage}`, 
        mailgunId: mailgunResponse.id // Return the raw Mailgun ID for reference if needed by client
      }, { status: 200 });

    } else {
        return NextResponse.json({ message: 'Email processed, but final status from Mailgun is unclear.', details: mailgunResponse }, { status: 202 }); 
    }

  } catch (error) {
    console.error('API Error sending email:', error);
    const errorDetails = error.response ? (await error.response.json().catch(() => ({}))) : { message: error.message }; // Ensure errorDetails has a message
    return NextResponse.json({ message: 'Failed to send email.', error: errorDetails.message || error.message }, { status: error.status || 500 });
  }
}