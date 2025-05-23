// lib/mongodb.js
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = 'leads'; //process.env.MONGODB_DB_NAME; // Optional: if you want to specify DB name via env

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections from growing exponentially
 * during API Route usage.
 */
let cachedClient = null;
let cachedDb = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    // console.log("Using cached MongoDB connection");
    return { client: cachedClient, db: cachedDb };
  }

  // If no connection is cached, create a new one
  const client = new MongoClient(MONGODB_URI, {
    // useNewUrlParser: true, // Deprecated in newer versions of the driver
    // useUnifiedTopology: true, // Deprecated in newer versions of the driver
  });

  try {
    // console.log("Attempting to connect to MongoDB...");
    await client.connect();
    // console.log("Successfully connected to MongoDB Atlas.");
    
    const dbName = MONGODB_DB_NAME || new URL(MONGODB_URI).pathname.substring(1);
    if (!dbName) {
        throw new Error('MongoDB database name could not be determined. Please set MONGODB_DB_NAME or ensure it is in the MONGODB_URI.');
    }
    const db = client.db(dbName);

    // Cache the connection
    cachedClient = client;
    cachedDb = db;

    return { client, db };
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    // Attempt to close the client if connection failed partway
    if (client) {
      await client.close();
    }
    throw error; // Re-throw the error to be caught by the caller
  }
}

// Optional: A helper to get just the db object if you don't need the client
export async function getDb() {
  const { db } = await connectToDatabase();
  return db;
}
