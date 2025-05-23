// app/page.js (Replace default content)
import React from 'react';

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="text-center py-10 bg-brand-surface-light dark:bg-brand-surface-dark rounded-lg shadow-lg border border-brand-border-light dark:border-brand-border-dark">
        <h1 className="text-4xl font-bold text-brand-primary-light dark:text-brand-primary-dark mb-4">
          Testing Tailwind & Dark Mode
        </h1>
        <p className="text-lg text-brand-text-muted dark:text-brand-text-muted mb-6">
          This page demonstrates basic styling and dark mode functionality.
        </p>
        <button className="bg-brand-primary-light dark:bg-brand-primary-dark hover:opacity-80 text-white font-semibold py-2 px-6 rounded-lg shadow transition-opacity">
          A Styled Button
        </button>
      </section>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-6 bg-brand-surface-light dark:bg-brand-surface-dark rounded-lg shadow border border-brand-border-light dark:border-brand-border-dark">
          <h2 className="text-2xl font-semibold text-brand-text-light dark:text-brand-text-dark mb-2">Light Mode Card</h2>
          <p className="text-brand-text-muted dark:text-brand-text-muted">
            This card uses light theme surface and text colors.
            When dark mode is active, it will switch to dark surface and text colors.
          </p>
          <p className="mt-4 text-red-500 dark:text-green-500">This text is red in light, green in dark.</p>
        </div>
        <div className="p-6 bg-brand-primary-light dark:bg-brand-primary-dark text-white rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-2">Accent Card</h2>
          <p>This card uses the primary accent color for its background.</p>
        </div>
      </div>
      
      <div className="mt-8 p-4 border-2 border-dashed border-brand-border-light dark:border-brand-border-dark rounded-md">
        <p className="text-center text-brand-text-muted dark:text-brand-text-muted">Container with dashed border.</p>
      </div>
    </div>
  );
}