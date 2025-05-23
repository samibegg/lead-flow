// app/api/auth/signup/route.js
// API Route for user registration
import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb'; // Adjust path as necessary
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    // --- Basic Input Validation ---
    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Missing required fields (name, email, password).' }, { status: 400 });
    }
    if (password.length < 6) { 
        return NextResponse.json({ message: 'Password must be at least 6 characters long.' }, { status: 400 });
    }
    // You might want to add more robust email validation here
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return NextResponse.json({ message: 'Invalid email format.' }, { status: 400 });
    }


    const { db } = await connectToDatabase();
    const usersCollection = db.collection('users'); // Assuming your users are in a 'users' collection

    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: 'User with this email already exists.' }, { status: 409 }); // 409 Conflict
    }
    
    console.log(`Attempting to sign up user: ${email}`);

    const hashedPassword = await bcrypt.hash(password, 12); 

    const newUser = {
      name,
      email,
      password: hashedPassword,
      createdAt: new Date(),
      // role: 'user', // Default role if you have roles
    };
    const result = await usersCollection.insertOne(newUser);
    
    console.log(`User ${email} created successfully with ID: ${result.insertedId}`);
    return NextResponse.json({ message: 'User registered successfully!', userId: result.insertedId.toString() }, { status: 201 });

  } catch (error) {
    console.error('Signup API Error:', error);
    // Avoid sending detailed error messages to the client in production
    const errorMessage = process.env.NODE_ENV === 'development' ? error.message : 'An internal server error occurred.';
    return NextResponse.json({ message: 'An internal server error occurred during registration.', error: errorMessage }, { status: 500 });
  }
}
