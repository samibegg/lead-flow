// components/contacts/ContactItem.js
import React from 'react';
import Link from 'next/link'; 
import { Briefcase, Mail, MapPin as PinIcon, Link as LinkIconExternal, Building, ExternalLink as ExternalLinkIcon, Edit3, Facebook, Twitter } from 'lucide-react'; 

export default function ContactItem({ contact }) {
  if (!contact) return null;

  
  const name = `${contact.first_name || ''} ${contact.last_name || ''}`.trim();
  const title = contact.title || 'N/A';
  const company = contact.organization_name || 'N/A';
  const email = contact.email || 'N/A';
  const fullAddress = contact.address || 'N/A'; 
  const industry = contact.industry || 'N/A';

  return (
    <div className="bg-surface-light dark:bg-surface-dark shadow-lg dark:shadow-slate-700/50 rounded-xl p-6 flex flex-col justify-between hover:shadow-xl dark:hover:shadow-slate-600/60 transition-shadow duration-300 ease-in-out border border-border-light dark:border-border-dark">
      <div>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-semibold text-primary dark:text-primary-dark">{name || 'Unnamed Contact'}</h2>
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark flex items-center mt-1">
              <Briefcase size={14} className="mr-1.5 text-slate-400 dark:text-slate-500" />
              {title}
            </p>
          </div>
          <Link href={`/contacts/${contact._id || contact.id}/edit`} className="p-2 text-text-secondary-light dark:text-text-secondary-dark hover:text-primary dark:hover:text-primary-dark transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
            <Edit3 size={18} />
          </Link>
        </div>

        <div className="space-y-3 text-sm text-text-secondary-light dark:text-text-secondary-dark mb-5">
          <p className="flex items-center">
            <Building size={14} className="mr-2 text-slate-400 dark:text-slate-500 flex-shrink-0" />
            Works at <span className="font-medium ml-1 text-text-primary-light dark:text-text-primary-dark">{company}</span>
          </p>
          {contact.organization_website_url && (
            <p className="flex items-center">
              <LinkIconExternal size={14} className="mr-2 text-slate-400 dark:text-slate-500 flex-shrink-0" />
              <a href={contact.organization_website_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 hover:underline truncate">
                {contact.organization_website_url}
              </a>
            </p>
          )}
          <p className="flex items-center">
            <Mail size={14} className="mr-2 text-slate-400 dark:text-slate-500 flex-shrink-0" />
            {email !== 'N/A' ? <a href={`mailto:${email}`} className="hover:underline">{email}</a> : email}
          </p>
          <p className="flex items-start"> 
            <PinIcon size={14} className="mr-2 text-slate-400 dark:text-slate-500 flex-shrink-0 mt-0.5" /> 
            <span>{fullAddress}</span>
          </p>
          {contact.linkedin_url && (
            <p className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="mr-2 text-slate-400 dark:text-slate-500 flex-shrink-0"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              <a href={contact.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 hover:underline truncate">
                LinkedIn Profile
              </a>
            </p>
          )}
          {contact.facebook_url && (
            <p className="flex items-center">
              <Facebook size={14} className="mr-2 text-slate-400 dark:text-slate-500 flex-shrink-0" />
              <a href={contact.facebook_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 hover:underline truncate">
                Facebook Profile
              </a>
            </p>
          )}
          {contact.twitter_url && (
            <p className="flex items-center">
              <Twitter size={14} className="mr-2 text-slate-400 dark:text-slate-500 flex-shrink-0" />
              <a href={contact.twitter_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 hover:underline truncate">
                Twitter Profile
              </a>
            </p>
          )}
          {industry && industry !== 'N/A' && (
            <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-full inline-block mt-2">
              Industry: {industry}
            </span>
          )}
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-border-light dark:border-border-dark">
        <Link href={`/email-composer/${contact._id || contact.id}`} className="text-sm text-primary dark:text-primary-dark hover:text-primary-hover-light dark:hover:text-primary-hover-dark font-medium flex items-center justify-center py-2.5 px-3 bg-indigo-50 dark:bg-indigo-500/20 hover:bg-indigo-100 dark:hover:bg-indigo-500/30 rounded-md transition-colors">
          Compose Email <ExternalLinkIcon size={14} className="ml-1.5" />
        </Link>
      </div>
    </div>
  );
}