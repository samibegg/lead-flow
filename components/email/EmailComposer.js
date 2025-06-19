// components/email/EmailComposer.js
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Send, Sparkles, ChevronDown } from 'lucide-react';
import { useSession } from 'next-auth/react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Predefined list of "From" email addresses
const senderEmails = [
  "alexandra.hamilton@mail.forgemission.com",
  "aaron.adams@mail.forgemission.com",
  "sara.madison@mail.forgemission.com",
  "allie.jackson@mail.forgemission.com",
  "caitlyn.thomas@mail.forgemission.com",
  "sami.begg@mail.forgemission.com",
];

// Helper function to extract a display name from an email
const getNameFromEmail = (email) => {
  if (!email) return 'Your Name'; // Fallback name
  const namePart = email.split('@')[0];
  // Capitalize first letter of each part (e.g., bill.johnson -> Bill Johnson)
  return namePart
    .split(/[._-]/) // Split by dot, underscore, or hyphen
    .map(name => name.charAt(0).toUpperCase() + name.slice(1))
    .join(' ');
};

export default function EmailComposer({ contact, onEmailSent }) { // Added onEmailSent prop
  const { data: session } = useSession(); // Still useful if you want to use session.user.company or other details
  const [fromAddress, setFromAddress] = useState(senderEmails[0]); // Default to the first email
  const [subject, setSubject] = useState('');
  const [textBody, setTextBody] = useState('');
  const [htmlBody, setHtmlBody] = useState(''); // Kept for potential future rich text editor
  const [isSending, setIsSending] = useState(false);
  const [isPolishing, setIsPolishing] = useState(false);
  const [sendStatus, setSendStatus] = useState({ message: '', type: '' });

  const emailTemplates = [
    { id: 'blank', name: '-- No Template --', subject: '', body: `\n\nBest,\n{{user.name}}` }, // Default blank with signature
    { id: 'ai-intro-ntl', name: 'AI Intro - non tech leader', 
      subject: `Serious improvements using AI for {{contact.organization_name}}`, 
      body: `Hey {{contact.first_name}}, hope you are well.\n
Very impressed by your success with {{contact.industry}}. I've been working in IT modernization leveraging AI and wanted to run something by you.\n
My team has had some recent success helping IT services firms bring agentic automation, RAG and custom LLMs into their own operations within days, and I believe we can help you as well. We saved a tech consulting firm in VA $2.5M annualized by automating workflows with AI agents. And this took days to implement.\n
We did similar AI operationalization for a cloud transformation company in FL for their proposal and BD teams, and they saw a significant uptick in new business the following quarter as a result. I know this is completely out of the blue, but I went through {{contact.organization_website_url}} and based on my understanding, I'm fairly confident we could help you in a similar manner.\n
Just wanted to see if there was interest. {{contact.organization_name}} is one of the first firms I came across when looking into it. Would this be of value to you at all? Are you open to a 20 minute chat to see if we could identify a potential fit?\n
Reply with your thoughts when you have a moment?
Thanks,
{{user.name}}
Principal Engineer
Forge Mission\n` 
    },  
    { id: 'ai-intro-train', name: 'Weekly offer', 
      subject: `{{contact.first_name}}, empower your team for the AI modernization wave`, 
      body: `Hello {{contact.first_name}}, hope things are going great for you!
My collegue Alex reached out a few weeks ago regarding AI enablement for {{contact.organization_name}} and I'd like to follow up...\n
We are empowering Ops teams across the {{contact.industry}} space globally, offering weekly 1-hour live-interactive sessions on real strategies to effectively use AI for routine tasks and complex workflows, improving efficiency, reducing costs and boosting revenue. Similar companies are already engaged, moving the needle from Day 1 and seeing great success quickly.
Are you interested? 10 second intro here: https://www.forgemission.com/ai/services \n
Please let me know if you have 15 mins to discuss?
Best,
{{user.name}}
Principal Engineer
Forge Mission\n` 
  },  
  { id: 'ai-intro', name: 'AI Intro - training', 
        subject: `Hi {{contact.first_name}}, free AI Training for {{contact.organization_name}}`, 
        body: `Hi {{contact.first_name}}, hope you are well.\n
Impressed by your success in the {{contact.industry}} space. Does your team already have an AI execution strategy in place?\n
Forge Mission is enabling firms like {{contact.organization_name}} start operationalizing with AI FOR FREE!
Is your team already up and running with agentic workflows, RAG and custom model training pipelines?
Join us for a jumpstart - Limited availability!\n
Please let me know if you are interested - Thank You,\n\n
{{user.name}}
Principal AI Engineer
Forge Mission\n` 
      },  
    { id: 'ai-followup', name: 'AI Follow-up', 
        subject: `Hi {{contact.first_name}}, free AI Training for {{contact.organization_name}}`, 
        body: `{{contact.first_name}}, just making sure you didn't miss out.\n
Following up to see if {{contact.organization_name}} would like to join us for free AI training starting this month.
Forge Mission enables teams like yours to begin implementing agentic workflows, RAG and custom model training pipelines for your projects.
The live virtual sessions are filling up now!\n
Thank You,\n\n
{{user.name}}
Principal AI Engineer
Forge Mission\n` 
      },  
  ];
  const [selectedTemplate, setSelectedTemplate] = useState(emailTemplates.find(t => t.id === 'blank'));

  // Function to replace placeholders
  const applyTemplate = useCallback((templateContent, contactData, currentFromAddress) => {
    if (!templateContent) return '';
    let processedContent = templateContent;

    const senderName = getNameFromEmail(currentFromAddress);
    const userData = {
      name: senderName,
      company: "Lead Flow App" // Placeholder, or derive from email domain, or use session.user.company
    };

    if (contactData) {
      processedContent = processedContent.replace(/{{contact\.first_name}}/g, contactData.first_name || '');
      processedContent = processedContent.replace(/{{contact\.last_name}}/g, contactData.last_name || '');
      processedContent = processedContent.replace(/{{contact\.organization_name}}/g, contactData.organization_name || '');
      processedContent = processedContent.replace(/{{contact\.industry}}/g, contactData.industry || '');
      processedContent = processedContent.replace(/{{contact\.organization_website_url}}/g, contactData.organization_website_url.replace(/^(https?:\/\/)?(www\.)?/, '') || '');
    }
    if (userData) {
      processedContent = processedContent.replace(/{{user\.name}}/g, userData.name);
      processedContent = processedContent.replace(/{{user\.company}}/g, userData.company);
    }
    return processedContent;
  }, []);

  // Effect to update subject and body when template or fromAddress changes
  useEffect(() => {
    if (selectedTemplate && contact && fromAddress) {
      const newSubject = applyTemplate(selectedTemplate.subject, contact, fromAddress);
      const newBody = applyTemplate(selectedTemplate.body, contact, fromAddress);
      setSubject(newSubject);
      setTextBody(newBody);
      setHtmlBody(''); // Clear HTML body when applying text-based templates
    }
  }, [selectedTemplate, contact, fromAddress, applyTemplate]);

  const handleTemplateChange = (e) => {
    const templateId = e.target.value;
    const template = emailTemplates.find(t => t.id === templateId);
    setSelectedTemplate(template);
    // The useEffect above will handle applying the template with the current fromAddress
  };

  const handleFromAddressChange = (e) => {
    setFromAddress(e.target.value);
    // The useEffect above will handle re-applying the template to update the signature
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    setIsSending(true);
    setSendStatus({ message: '', type: '' });

    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: contact.email,
          from: fromAddress, // Use the selected fromAddress
          subject,
          textBody,
          htmlBody: htmlBody || `<p>${textBody.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>`,
          contactId: contact._id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to send email');
      }
      setSendStatus({ message: `Email sent successfully! (ID: ${result.mailgunId || 'N/A'})`, type: 'success' });

      // Call the callback to refresh contact details in the parent page
      if (onEmailSent) {
        onEmailSent();
      }

      setSubject('');
      setTextBody(''); // Or reset to a default template
      setSelectedTemplate(emailTemplates.find(t => t.id === 'blank'));

    } catch (error) {
      console.error("Error sending email:", error);
      setSendStatus({ message: error.message || 'An error occurred.', type: 'error' });
    } finally {
      setIsSending(false);
    }
  };

  const handlePolishEmail = async () => {
    const currentContent = textBody || htmlBody;
    if (!currentContent.trim()) {
        setSendStatus({ message: "Please write some email content before polishing.", type: 'error' });
        return;
    }
    setIsPolishing(true);
    setSendStatus({ message: '', type: '' });
    try {
      const response = await fetch('/api/email/polish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ textToPolish: currentContent })
      });
      const data = await response.json();
      if (response.ok) {
        setTextBody(data.polishedText);
        setHtmlBody('');
        setSendStatus({ message: "Email content polished by AI!", type: 'success' });
      } else {
        throw new Error(data.message || "Failed to polish email");
      }
    } catch (error) {
      console.error("Error polishing email:", error);
      setSendStatus({ message: `Error polishing: ${error.message}`, type: 'error' });
    } finally {
      setIsPolishing(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700">
      <form onSubmit={handleSendEmail} className="space-y-6">
        {/* From Address Dropdown */}
        <div className="relative">
          <label htmlFor="fromAddress" className="block text-sm font-medium text-slate-700 dark:text-slate-300">From:</label>
          <select
            id="fromAddress"
            name="fromAddress"
            value={fromAddress}
            onChange={handleFromAddressChange}
            required
            className="mt-1 block w-full pl-3 pr-10 py-2.5 text-base border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md appearance-none bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200"
          >
            {senderEmails.map(email => (
              <option key={email} value={email}>{getNameFromEmail(email)} ({email})</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 top-6 flex items-center px-2 text-slate-700 dark:text-slate-300">
            <ChevronDown size={20} />
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Ensure this email is from a domain verified with Mailgun.</p>
        </div>

        {/* To Address (fixed to contact's email) */}
        <div>
          <label htmlFor="to" className="block text-sm font-medium text-slate-700 dark:text-slate-300">To:</label>
          <input
            type="email"
            id="to"
            value={contact.email}
            readOnly
            className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 sm:text-sm cursor-not-allowed"
          />
        </div>
        
        {/* Email Template Selector */}
        <div className="relative">
          <label htmlFor="template" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Select Template:</label>
          <select
            id="template"
            value={selectedTemplate ? selectedTemplate.id : ''}
            onChange={handleTemplateChange}
            className="mt-1 block w-full pl-3 pr-10 py-2.5 text-base border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md appearance-none bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200"
          >
            {emailTemplates.map(template => (
              <option key={template.id} value={template.id}>{template.name}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 top-6 flex items-center px-2 text-slate-700 dark:text-slate-300">
            <ChevronDown size={20} />
          </div>
        </div>

        {/* Subject */}
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Subject:</label>
          <input
            type="text"
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200"
          />
        </div>

        {/* Email Body (Textarea for now) */}
        <div>
          <label htmlFor="textBody" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email Body:</label>
          <textarea
            id="textBody"
            value={textBody}
            onChange={(e) => { setTextBody(e.target.value); setHtmlBody(''); /* Clear HTML if typing in text */}}
            rows={12}
            required={!htmlBody} 
            className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200"
            placeholder="Write your email content here..."
          />
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex space-x-3">
                 <button
                    type="button"
                    onClick={handlePolishEmail}
                    disabled={isSending || isPolishing}
                    className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 dark:focus:ring-offset-slate-900 disabled:opacity-50"
                >
                    {isPolishing ? <LoadingSpinner size="4" color="white" /> : <Sparkles size={18} className="mr-2" />}
                    {isPolishing ? 'Polishing...' : 'Polish with AI'}
                </button>
            </div>
            <button
                type="submit"
                disabled={isSending || isPolishing}
                className="w-full sm:w-auto flex items-center justify-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-900 disabled:opacity-50"
            >
                {isSending ? <LoadingSpinner size="4" color="white" /> : <Send size={18} className="mr-2" />}
                {isSending ? 'Sending...' : 'Send Email'}
            </button>
        </div>
      </form>

      {sendStatus.message && (
        <div className={`mt-4 p-3 rounded-md text-sm ${
          sendStatus.type === 'success' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
        }`}>
          {sendStatus.message}
        </div>
      )}
    </div>
  );
}
