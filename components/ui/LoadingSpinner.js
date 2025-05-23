// components/ui/LoadingSpinner.js
import React from 'react';

export default function LoadingSpinner({ size = '8', color = 'primary' }) { 
  return (
    <div className="flex justify-center items-center py-8">
      <div 
        className={`animate-spin rounded-full h-${size} w-${size} border-t-2 border-b-2 border-${color} dark:border-primary-dark`}
      ></div>
    </div>
  );
}