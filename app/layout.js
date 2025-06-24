// app/layout.js
import { Inter } from 'next/font/google';
import '@/styles/globals.css'; 
import 'leaflet/dist/leaflet.css';
import ClientLayout from '@/components/layout/ClientLayout'; 
import AuthProvider from '@/components/auth/AuthProvider'; // Assuming this is needed as per error stack

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter', 
});

export const metadata = {
  title: 'Lead Flow',
  description: 'Manage leads efficiently',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}> 
      <body className="bg-background-light text-text-primary-light dark:bg-background-dark dark:text-text-primary-dark antialiased transition-colors duration-300">
        <AuthProvider>
          <ClientLayout>
            {children}
          </ClientLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
