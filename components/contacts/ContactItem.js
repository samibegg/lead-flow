// components/contacts/ContactItem.js
import React from 'react';
import Link from 'next/link'; 
import { 
    Briefcase, Mail, MapPin as PinIcon, Link as LinkIconExternal, 
    Building, ExternalLink as ExternalLinkIcon, Edit3, 
    Facebook, Twitter, CheckCircle, AlertCircle, XOctagon, Eye, MailOpen // Added MailOpen
} from 'lucide-react'; 

export default function ContactItem({ contact, onDisqualifyClick, onMarkAsOpenedClick }) { 
  if (!contact) return null;

  const name = `${contact.first_name || ''} ${contact.last_name || ''}`.trim();
  const title = contact.title || 'N/A';
  const company = contact.organization_name || 'N/A';
  const email = contact.email || 'N/A';
  const fullAddress = contact.address || 'N/A'; 
  const industry = contact.industry || 'N/A';

  const hasBeenEmailed = contact.email_history && contact.email_history.length > 0;
  const isDisqualified = contact.disqualification && contact.disqualification.reasons && contact.disqualification.reasons.length > 0;
  const lastEmailOpenedTimestamp = contact.last_email_opened_timestamp; 
  const lastEmailClickedTimestamp = contact.last_email_clicked_timestamp; 

  const disqualificationDisplayReason = isDisqualified 
    ? contact.disqualification.reasons.map(r => r.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')).join(', ') + 
      (contact.disqualification.other_reason_text ? ` (${contact.disqualification.other_reason_text})` : '') 
    : '';

  let cardBaseClasses = `
    bg-surface-light dark:bg-surface-dark 
    shadow-lg dark:shadow-slate-700/50 
    rounded-xl p-6 flex flex-col justify-between 
    hover:shadow-xl dark:hover:shadow-slate-600/60 
    transition-all duration-300 ease-in-out 
    border
  `;
  
  let titleColorClass = 'text-primary dark:text-primary-dark'; // Default title color

  if (isDisqualified) {
    cardBaseClasses += " border-orange-400 dark:border-orange-600 bg-orange-50/30 dark:bg-orange-900/20 opacity-70";
    titleColorClass = 'text-orange-700 dark:text-orange-400 line-through';
  } else if (lastEmailOpenedTimestamp) {
    // Style for "emailed and opened"
    cardBaseClasses += " border-sky-300 dark:border-sky-700/80 bg-sky-50/30 dark:bg-sky-900/20";
    titleColorClass = 'text-sky-700 dark:text-sky-400';
  } else if (lastEmailClickedTimestamp) {
    // Style for "opened and clicked"
    cardBaseClasses += " border-indigo-300 dark:border-indigo-700/80 bg-sky-50/30 dark:bg-indigo-900/20";
    titleColorClass = 'text-indigo-700 dark:text-indigo-400';
  } else if (hasBeenEmailed) {
    // Style for "emailed but not yet marked opened"
    cardBaseClasses += " border-green-300 dark:border-green-700/80 bg-green-50/30 dark:bg-green-900/20";
    titleColorClass = 'text-green-700 dark:text-green-400';
  } else {
    cardBaseClasses += " border-border-light dark:border-border-dark";
  }

  return (
    <div className={cardBaseClasses}>
      <div>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className={`text-xl font-semibold ${titleColorClass}`}>
              {name || 'Unnamed Contact'}
            </h2>
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark flex items-center mt-1">
              <Briefcase size={14} className="mr-1.5 text-slate-400 dark:text-slate-500" />
              {title}
            </p>
            {isDisqualified && (
              <p className="mt-1 text-xs text-orange-600 dark:text-orange-500 font-medium break-words" title={disqualificationDisplayReason}>
                Disqualified: {disqualificationDisplayReason.substring(0,40)}{disqualificationDisplayReason.length > 40 ? '...' : ''}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end space-y-1 shrink-0 ml-2">
            {!isDisqualified && (
                <Link href={`/contacts/${contact._id || contact.id}/edit`} className="p-1.5 text-text-secondary-light dark:text-text-secondary-dark hover:text-primary dark:hover:text-primary-dark transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                    <Edit3 size={16} />
                </Link>
            )}
            {/* Visual cues for email status */}
            {lastEmailOpenedTimestamp && !isDisqualified && (
                <MailOpen size={16} className="text-sky-500 dark:text-sky-400" title={`Last email opened: ${new Date(lastEmailOpenedTimestamp).toLocaleDateString()}`} />
            )}
            {hasBeenEmailed && !lastEmailOpenedTimestamp && !isDisqualified && (
              <CheckCircle size={16} className="text-green-500 dark:text-green-400" title="Emailed (Pending Open)" />
            )}
            {!hasBeenEmailed && !isDisqualified && (
              <AlertCircle size={16} className="text-amber-500 dark:text-amber-400" title="Not Emailed Yet" />
            )}
          </div>
        </div>

        <div className={`space-y-3 text-sm text-text-secondary-light dark:text-text-secondary-dark mb-5 ${isDisqualified ? 'opacity-60' : ''}`}>
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

      <div className="mt-auto pt-4 border-t border-border-light dark:border-border-dark space-y-2">
        {!isDisqualified && (
          <Link 
            href={`/email-composer/${contact._id || contact.id}`} 
            className="text-sm text-primary dark:text-primary-dark hover:text-primary-hover-light dark:hover:text-primary-hover-dark font-medium flex items-center justify-center py-2.5 px-3 bg-indigo-50 dark:bg-indigo-500/20 hover:bg-indigo-100 dark:hover:bg-indigo-500/30 rounded-md transition-colors"
            target="_blank" 
            rel="noopener noreferrer"
          >
            Compose Email <ExternalLinkIcon size={14} className="ml-1.5" />
          </Link>
        )}
        {/* "Mark as Opened" button logic */}
        {!isDisqualified && hasBeenEmailed && !lastEmailOpenedTimestamp && (
            <button
                onClick={() => onMarkAsOpenedClick && onMarkAsOpenedClick(contact)}
                className="w-full text-sm font-medium flex items-center justify-center py-2.5 px-3 rounded-md transition-colors bg-sky-50 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-500/30"
            >
                <Eye size={14} className="mr-1.5" />
                Mark as Opened
            </button>
        )}
        {/* Display opened timestamp if it exists */}
        {lastEmailOpenedTimestamp && !isDisqualified && (
            <div className="text-xs text-sky-600 dark:text-sky-400 flex items-center justify-center py-2 bg-sky-50/50 dark:bg-sky-900/30 rounded-md">
                <MailOpen size={14} className="mr-1.5" />
                Last email opened: {new Date(lastEmailOpenedTimestamp).toLocaleDateString()}
            </div>
        )}
        <button
          onClick={() => onDisqualifyClick(contact)}
          className={`w-full text-sm font-medium flex items-center justify-center py-2.5 px-3 rounded-md transition-colors
            ${isDisqualified 
              ? 'bg-yellow-100 dark:bg-yellow-700/30 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-700/40' 
              : 'bg-red-50 dark:bg-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/30'}`}
        >
          <XOctagon size={14} className="mr-1.5" />
          {isDisqualified ? 'Update Disqualification' : 'Disqualify'}
        </button>
      </div>
    </div>
  );
}