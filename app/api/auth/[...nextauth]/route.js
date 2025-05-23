// app/api/auth/[...nextauth]/route.js
// This file handles all NextAuth.js API requests (e.g., for sign-in, sign-out, session management)
import NextAuth from "next-auth";
import { authOptions } from "../../../../lib/authOptions"; // Adjust path as necessary

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

