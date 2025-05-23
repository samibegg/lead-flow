// lib/authOptions.js
// This file will configure NextAuth.js options including providers
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { connectToDatabase } from "./mongodb"; // Ready to be used
import bcrypt from 'bcryptjs'; // Ready to be used

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "john.doe@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password.");
        }

        try {
          const { db } = await connectToDatabase();
          const usersCollection = db.collection("users"); // Assuming your users are in a 'users' collection
          
          console.log(`CredentialsProvider: Searching for user ${credentials.email}`);
          const user = await usersCollection.findOne({ email: credentials.email });

          if (!user) {
            console.log(`CredentialsProvider: No user found with email ${credentials.email}`);
            throw new Error("No user found with this email.");
          }

          console.log(`CredentialsProvider: User found. Comparing password for ${credentials.email}`);
          const isValidPassword = await bcrypt.compare(credentials.password, user.password);
          
          if (!isValidPassword) {
            console.log(`CredentialsProvider: Incorrect password for ${credentials.email}`);
            throw new Error("Incorrect password.");
          }

          console.log(`CredentialsProvider: User ${credentials.email} authenticated successfully.`);
          // Return the user object, ensure it has an 'id' property (NextAuth expects it)
          // and any other properties you want in the session.
          return { 
            id: user._id.toString(), // MongoDB _id is an ObjectId, convert to string
            name: user.name, 
            email: user.email, 
            // role: user.role, // if you have roles
          };
        } catch (error) {
          console.error("CredentialsProvider authorize error:", error.message);
          // Re-throw the error so NextAuth can handle it (e.g., display to user)
          // Or throw a more generic error if you don't want to expose DB details.
          throw new Error(error.message || "Authentication failed.");
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id; // user.id is already a string from authorize function
        // token.role = user.role; 
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        // session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/', 
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};
