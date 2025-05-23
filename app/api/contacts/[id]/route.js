// app/api/contacts/[id]/route.js
import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb'; 
import { connectToDatabase } from '@/lib/mongodb'; // Using alias
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/authOptions'; // Using alias

// GET a single contact by ID
export async function GET(request, context) { 
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  
  // The `params` object is available on the `context` argument
  const resolvedParams = await context.params; 
  const contactId = resolvedParams.id;

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

  const resolvedParams = await context.params;
  const contactId = resolvedParams.id;

  if (!contactId || !ObjectId.isValid(contactId)) {
    return NextResponse.json({ message: 'Invalid contact ID' }, { status: 400 });
  }

  try {
    const updates = await request.json();
    
    if (updates._id) delete updates._id; 

    updates.updatedAt = new Date(); 

    const { db } = await connectToDatabase();
    const result = await db.collection('contacts').findOneAndUpdate(
      { _id: new ObjectId(contactId) },
      { $set: updates },
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

