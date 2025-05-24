// app/api/email/send/route.js (New File)
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/authOptions';
import { connectToDatabase } from '@/lib/mongodb';
import { sendEmail } from '@/lib/mailgun'; // Import our Mailgun helper

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { to, from, subject, textBody, htmlBody } = await request.json();

    if (!to || !from || !subject || (!textBody && !htmlBody)) {
      return NextResponse.json({ message: 'Missing required email fields (to, from, subject, and textBody or htmlBody).' }, { status: 400 });
    }

    // You might want to validate the 'from' address here to ensure it's one of your verified sending domains/addresses
    // or the user's own email if you allow that.

    const mailgunResponse = await sendEmail({
      to,
      from,
      subject,
      text: textBody, // Mailgun's 'text' parameter
      html: htmlBody, // Mailgun's 'html' parameter
    });

    // console.log("Mailgun API response in route:", mailgunResponse);

    if (mailgunResponse && mailgunResponse.id) { // Check for a successful-like response from Mailgun
        return NextResponse.json({ message: 'Email sent successfully!', mailgunId: mailgunResponse.id }, { status: 200 });
    } else {
        // This case might occur if Mailgun is mocked and returns a different structure, or if there's an unexpected API response
        return NextResponse.json({ message: 'Email processed, but final status from Mailgun is unclear.', details: mailgunResponse }, { status: 202 }); // 202 Accepted
    }

  } catch (error) {
    console.error('API Error sending email:', error);
    // Check if error has a response from Mailgun for more details
    const errorDetails = error.response ? await error.response.json() : error.message;
    return NextResponse.json({ message: 'Failed to send email.', error: errorDetails }, { status: error.status || 500 });
  }
}
