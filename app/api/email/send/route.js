// app/api/email/send/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/authOptions';
import { sendEmail } from '@/lib/mailgun'; 
import { connectToDatabase } from '@/lib/mongodb'; // Import DB connection
import { ObjectId } from 'mongodb'; // To validate contactId

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { to, from, subject, textBody, htmlBody, contactId } = await request.json(); // Destructure contactId

    if (!to || !from || !subject || (!textBody && !htmlBody)) {
      return NextResponse.json({ message: 'Missing required email fields (to, from, subject, and textBody or htmlBody).' }, { status: 400 });
    }

    if (!contactId || !ObjectId.isValid(contactId)) { // Validate contactId
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
    if (mailgunResponse && mailgunResponse.id) { 
      try {
        const { db } = await connectToDatabase();
        const emailHistoryEntry = {
          timestamp: new Date(),
          sent_from_email: from, // This is the 'fromAddress' from the composer
          subject: subject,
          mailgun_id: mailgunResponse.id, // Optionally store Mailgun ID for reference
        };

        const updateResult = await db.collection('contacts').updateOne(
          { _id: new ObjectId(contactId) },
          { $push: { email_history: emailHistoryEntry } }
        );

        if (updateResult.modifiedCount === 1) {
          dbUpdateMessage = "Contact history updated.";
        } else {
          dbUpdateMessage = "Contact history not updated (contact not found or no change).";
          console.warn(`Contact history update issue for contactId: ${contactId}`, updateResult);
        }
      } catch (dbError) {
        console.error("Error updating contact email history:", dbError);
        dbUpdateMessage = "Error updating contact history."; 
        // Decide if you want to throw an error here or just log it and proceed
      }
      
      return NextResponse.json({ 
        message: `Email sent successfully! ${dbUpdateMessage}`, 
        mailgunId: mailgunResponse.id 
      }, { status: 200 });

    } else {
        // This case might occur if Mailgun is mocked or there's an unexpected API response
        return NextResponse.json({ message: 'Email processed, but final status from Mailgun is unclear.', details: mailgunResponse }, { status: 202 }); 
    }

  } catch (error) {
    console.error('API Error sending email:', error);
    const errorDetails = error.response ? (await error.response.json().catch(() => ({}))) : error.message;
    return NextResponse.json({ message: 'Failed to send email.', error: errorDetails }, { status: error.status || 500 });
  }
}