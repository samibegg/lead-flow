// app/api/contacts/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb'; 
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/authOptions'; 

const ITEMS_PER_PAGE = 25; // Default items per page

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || ITEMS_PER_PAGE.toString(), 10);
    
    const searchTerm = searchParams.get('searchTerm');
    const industry = searchParams.get('industry');
    const city = searchParams.get('city');
    const emailStatus = searchParams.get('emailStatus');
    const disqualificationStatus = searchParams.get('disqualificationStatus');
    const openedEmailStatus = searchParams.get('openedEmailStatus'); // New filter
    const clickedEmailStatus = searchParams.get('clickedEmailStatus'); // New filter

    const skip = (page - 1) * limit;

    const { db } = await connectToDatabase();
    const contactsCollection = db.collection('contacts'); 

    const query = {};
    const andConditions = []; 
    
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

    if (industry) {
      andConditions.push({ industry: { $regex: industry, $options: 'i' } });
    }
    if (city) {
      andConditions.push({ city: { $regex: city, $options: 'i' } });
    }

    if (emailStatus === 'contacted') {
      andConditions.push({ "email_history.0": { "$exists": true } }); 
    } else if (emailStatus === 'not_contacted') {
      andConditions.push({ 
        "$or": [
          { "email_history": { "$exists": false } },
          { "email_history": null },
          { "email_history": { "$size": 0 } }
        ]
      });
    }
    
    if (disqualificationStatus === 'disqualified') {
      andConditions.push({ 
        "disqualification": { "$exists": true, "$ne": null },
        "disqualification.reasons.0": { "$exists": true } 
      });
    } else if (disqualificationStatus === 'qualified') {
      andConditions.push({
        "$or": [
          { "disqualification": { "$exists": false } },
          { "disqualification": null },
          { "disqualification.reasons": { "$exists": true, "$size": 0 } } 
        ]
      });
    }

    // Handle openedEmailStatus filter
    if (openedEmailStatus === 'opened') {
        andConditions.push({ "last_email_opened_timestamp": { "$exists": true, "$ne": null } });
    } else if (openedEmailStatus === 'not_opened_sent') {
        andConditions.push({
            "email_history.0": { "$exists": true }, // Must have been emailed
            "$or": [ // And not marked as opened
                { "last_email_opened_timestamp": { "$exists": false } },
                { "last_email_opened_timestamp": null }
            ]
        });
    }

    if (clickedEmailStatus === 'clicked') {
      andConditions.push({ "last_email_clicked_timestamp": { "$exists": true, "$ne": null } });
    } else if (clickedEmailStatus === 'not_clicked_opened') {
      andConditions.push({
          "email_history.0": { "$exists": true }, // Must have been emailed
          "$or": [ // And not marked as clicked
              { "last_email_clicked_timestamp": { "$exists": false } },
              { "last_email_clicked_timestamp": null }
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