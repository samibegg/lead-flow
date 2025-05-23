// app/page.js
'use client'; 

import React, { useContext } from 'react'; // Added useContext
import Link from 'next/link';
import { Users, MapPin, BarChart3, Target } from 'lucide-react'; 
import { useSession } from 'next-auth/react'; 
import { useModal } from '@/context/ModalContext'; // Import useModal hook

export default function HomePage() { 
  const { data: session, status } = useSession();
  const { openAuthModal } = useModal(); // Use context to get openAuthModal
  const isLoadingSession = status === "loading";

  const handleFeatureClick = (e, href) => {
    if (isLoadingSession) {
      e.preventDefault(); 
      return;
    }
    if (!session) { 
      e.preventDefault(); 
      if (openAuthModal) {
        openAuthModal();
      } else {
        console.error("openAuthModal function not available from context.");
      }
    }
  };
  
  const features = [
    { href: "/contacts", icon: Users, title: "Manage Contacts", desc: "View, edit, and organize your valuable leads.", iconColor: "text-indigo-500 dark:text-indigo-400" },
    { href: "/map", icon: MapPin, title: "View Lead Map", desc: "Visualize the geographical distribution of your leads.", iconColor: "text-teal-500 dark:text-teal-400" },
    { href: "#", icon: BarChart3, title: "Analytics", desc: "Gain insights into your lead pipeline (Coming Soon).", iconColor: "text-amber-500 dark:text-amber-400" }
  ];

  return (
    <div className="py-12 sm:py-16 lg:py-20">
      <div className="max-w-4xl mx-auto text-center">
        <Target size={56} className="mx-auto text-primary dark:text-primary-dark mb-6" />
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark mb-6">
          Welcome to Lead Flow!
        </h1>
        <p className="text-lg sm:text-xl text-text-secondary-light dark:text-text-secondary-dark mb-10 sm:mb-12 max-w-2xl mx-auto">
          Your central hub for managing, tracking, and nurturing leads with precision and efficiency.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
        {features.map((item) => (
          <Link 
            key={item.title}
            href={(session || isLoadingSession || item.href === '#') ? item.href : '#'} 
            onClick={(e) => handleFeatureClick(e, item.href)}
            className="group block p-6 sm:p-8 bg-surface-light dark:bg-surface-dark rounded-xl shadow-lg hover:shadow-xl dark:hover:shadow-slate-700/60 transform hover:-translate-y-1 transition-all duration-300 ease-in-out border border-border-light dark:border-border-dark"
          >
            <div className="flex flex-col items-center text-center">
              <item.icon size={40} className={`${item.iconColor} mb-4 transition-colors`} />
              <h2 className="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark mb-2">{item.title}</h2>
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-16 text-center">
        <p className="text-text-secondary-light dark:text-text-secondary-dark">
          Ready to get started? Click on one of the sections above or use the navigation in the header.
        </p>
      </div>
    </div>
  );
}