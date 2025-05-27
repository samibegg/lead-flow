// app/api/contacts/[id]/mark-opened/route.js
import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/authOptions';

export async function POST(request, context) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { params } = context;
  const awaitedParams = await params; // Address potential Next.js warning
  const contactId = awaitedParams.id;

  if (!contactId || !ObjectId.isValid(contactId)) {
    return NextResponse.json({ message: 'Invalid contact ID' }, { status: 400 });
  }

  try {
    const { db } = await connectToDatabase();
    const currentTimestamp = new Date();

    // Update the contact document
    // Option 1: Add/update a specific field for the last opened timestamp
    const updateResult = await db.collection('contacts').updateOne(
      { _id: new ObjectId(contactId) },
      { 
        $set: { 
          last_email_opened_timestamp: currentTimestamp,
          updatedAt: currentTimestamp // Also update the general updatedAt timestamp
        } 
      }
    );

    // Option 2: If you wanted to push to an array of open events (more complex if tracking specific emails)
    // const updateResult = await db.collection('contacts').updateOne(
    //   { _id: new ObjectId(contactId) },
    //   { 
    //     $push: { 
    //       email_open_history: { timestamp: currentTimestamp, opened_by: session.user.email } // Example
    //     },
    //     $set: { updatedAt: currentTimestamp }
    //   }
    // );

    if (updateResult.matchedCount === 0) {
      return NextResponse.json({ message: 'Contact not found' }, { status: 404 });
    }
    if (updateResult.modifiedCount === 0 && updateResult.matchedCount === 1) {
      // This might happen if the timestamp was set to the exact same value, though unlikely with new Date()
      // Or if the document was matched but no actual change was made to the data being set.
      // For simply marking, even if the timestamp is the same, it's conceptually a new mark.
      // For robustness, you could just check matchedCount.
      return NextResponse.json({ message: 'Contact found, but status was not changed (already marked as opened recently or no actual update).', contactId }, { status: 200 });
    }
    
    // Fetch the updated contact to return it (optional, but good for UI consistency)
     const updatedContact = await db.collection('contacts').findOne({ _id: new ObjectId(contactId) });

    return NextResponse.json({ message: 'Contact marked as email opened successfully', contactId, opened_at: currentTimestamp, updatedContact }, { status: 200 });

  } catch (error) {
    console.error('API Error marking email as opened:', error);
    return NextResponse.json({ message: 'Failed to mark email as opened', error: error.message }, { status: 500 });
  }
}
