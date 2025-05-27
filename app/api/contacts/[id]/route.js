// app/api/contacts/[id]/route.js
import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb'; 
import { connectToDatabase } from '@/lib/mongodb'; 
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/authOptions'; 

// GET a single contact by ID (remains the same)
export async function GET(request, context) { 
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  
  const { params } = context; 
  const awaitedParams = await params; 
  const contactId = awaitedParams.id; 

  if (!contactId || !ObjectId.isValid(contactId)) {
    return NextResponse.json({ message: 'Invalid contact ID' }, { status: 400 });
  }

  try {
    const { db } = await connectToDatabase();
    const contact = await db.collection('contacts').findOne({ _id: new ObjectId(contactId) });

    if (!contact) {
      return NextResponse.json({ message: 'Contact not found' }, { status: 404 });
    }

    return NextResponse.json(contact, { status: 200 });
  } catch (error) {
    console.error('API Error fetching contact:', error);
    return NextResponse.json({ message: 'Failed to fetch contact', error: error.message }, { status: 500 });
  }
}

// PUT (update) a single contact by ID
export async function PUT(request, context) { 
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { params } = context; 
  const awaitedParams = await params; 
  const contactId = awaitedParams.id; 

  if (!contactId || !ObjectId.isValid(contactId)) {
    return NextResponse.json({ message: 'Invalid contact ID' }, { status: 400 });
  }

  try {
    const updates = await request.json();
    
    // Prevent _id from being updated if it's part of the payload
    if (updates._id) delete updates._id; 

    // If 'disqualification' is in updates, handle it
    // If it's an object with an empty 'reasons' array or null timestamp, it means "re-qualify"
    if ('disqualification' in updates) {
      if (updates.disqualification === null || (Array.isArray(updates.disqualification.reasons) && updates.disqualification.reasons.length === 0 && !updates.disqualification.other_reason_text) ) {
        // If requalifying, set disqualification to null or remove the field
        updates.disqualification = null; // Or use $unset: { disqualification: "" } in $set
      } else if (updates.disqualification && Array.isArray(updates.disqualification.reasons)) {
        // If disqualifying or updating disqualification
        updates.disqualification.timestamp = new Date();
        // Ensure other_reason_text is cleared if 'other' is not a selected reason
        if (!updates.disqualification.reasons.includes('other')) {
          updates.disqualification.other_reason_text = '';
        }
      }
    }
    
    updates.updatedAt = new Date(); 

    const { db } = await connectToDatabase();
    const result = await db.collection('contacts').findOneAndUpdate(
      { _id: new ObjectId(contactId) },
      { $set: updates }, // Using $set to update specific fields
      { returnDocument: 'after' } 
    );
    
    const updatedContact = result.value ? result.value : result;

    if (!updatedContact) { 
      return NextResponse.json({ message: 'Contact not found or no changes made' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Contact updated successfully', updatedContact }, { status: 200 });

  } catch (error) {
    console.error('API Error updating contact:', error);
    return NextResponse.json({ message: 'Failed to update contact', error: error.message }, { status: 500 });
  }
}