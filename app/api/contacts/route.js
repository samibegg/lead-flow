// app/api/contacts/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb'; // Adjust path
import { getServerSession } from "next-auth/next";
import { authOptions } from '../../../lib/authOptions'; // Corrected import path

const ITEMS_PER_PAGE = 10; // Default items per page

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || ITEMS_PER_PAGE.toString(), 10);
    
    // Get filter parameters
    const searchTerm = searchParams.get('searchTerm');
    const industry = searchParams.get('industry');
    const city = searchParams.get('city');
    const emailStatus = searchParams.get('emailStatus'); // New filter

    const skip = (page - 1) * limit;

    const { db } = await connectToDatabase();
    const contactsCollection = db.collection('contacts'); 

    const query = {};
    const andConditions = []; // Use $and for combining multiple conditions cleanly

    // General search term (searches multiple fields)
    if (searchTerm) {
      andConditions.push({
        $or: [
          { first_name: { $regex: searchTerm, $options: 'i' } },
          { last_name: { $regex: searchTerm, $options: 'i' } },
          { organization_name: { $regex: searchTerm, $options: 'i' } },
          { email: { $regex: searchTerm, $options: 'i' } },
          { title: { $regex: searchTerm, $options: 'i' } },
          { address: { $regex: searchTerm, $options: 'i' } }, 
        ]
      });
    }

    // Specific field filters (additive to the general search if searchTerm is also present)
    if (industry) {
      query.industry = { $regex: industry, $options: 'i' };
    }
    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }

    if (emailStatus === 'contacted') {
      // Checks if email_history array exists and is not empty
      andConditions.push({ "email_history.0": { "$exists": true } }); 
    } else if (emailStatus === 'not_contacted') {
      // Checks if email_history array does not exist, is null, or is empty
      andConditions.push({ 
        "$or": [
          { "email_history": { "$exists": false } },
          { "email_history": null },
          { "email_history": { "$size": 0 } }
        ]
      });
    }
    
    if (andConditions.length > 0) {
      query.$and = andConditions;
    }


    const contacts = await contactsCollection.find(query).skip(skip).limit(limit).toArray();
    const totalContacts = await contactsCollection.countDocuments(query);

    return NextResponse.json({
      contacts,
      totalContacts,
      currentPage: page,
      totalPages: Math.ceil(totalContacts / limit),
    }, { status: 200 });

  } catch (error) {
    console.error('API Error fetching contacts:', error);
    return NextResponse.json({ message: 'Failed to fetch contacts', error: error.message }, { status: 500 });
  }
}

