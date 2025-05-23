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

    const skip = (page - 1) * limit;

    const { db } = await connectToDatabase();
    const contactsCollection = db.collection('contacts'); 

    const query = {};
    
    // General search term (searches multiple fields)
    if (searchTerm) {
      query.$or = [
        { first_name: { $regex: searchTerm, $options: 'i' } },
        { last_name: { $regex: searchTerm, $options: 'i' } },
        { organization_name: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } },
        { title: { $regex: searchTerm, $options: 'i' } },
        // Note: If industry and city are also meant to be part of general search, add them here.
        // Otherwise, they are treated as separate, additive filters below.
      ];
    }

    // Specific field filters (additive to the general search if searchTerm is also present)
    if (industry) {
      query.industry = { $regex: industry, $options: 'i' };
    }
    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }
    // Add more specific filters here if needed, e.g., for state, title, etc.
    // if (searchParams.get('state')) {
    //   query.state = { $regex: searchParams.get('state'), $options: 'i' };
    // }


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

