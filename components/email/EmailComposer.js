// components/email/EmailComposer.js
'use client';

import React, { useState, useEffect } from 'react';
import { Send, Sparkles, Paperclip, Trash2, RotateCcw, ChevronDown } from 'lucide-react';
import { useSession } from 'next-auth/react'; // To get current user's email for 'from' field
import LoadingSpinner from '@/components/ui/LoadingSpinner';


export default function EmailComposer({ contact }) {
  const { data: session } = useSession();
  const [fromAddress, setFromAddress] = useState(''); 
  const [subject, setSubject] = useState('');
  const [textBody, setTextBody] = useState(''); 
  const [htmlBody, setHtmlBody] = useState(''); 
  const [isSending, setIsSending] = useState(false);
  const [isPolishing, setIsPolishing] = useState(false);
  const [sendStatus, setSendStatus] = useState({ message: '', type: '' }); 
  
  const emailTemplates = [
    { id: 'aifocus', name: 'AI Outreach Email', 
      subject: `Hi {{contact.first_name}}, free AI Training for {{contact.organization_name}}`, 
      body: `Hi {{contact.first_name}}, hope you are well.\n
Forge Mission is enabling firms like {{contact.organization_name}} start operationalizing with AI FOR FREE!
Is your team already up and running with agentic workflows, RAG and custom model training pipelines?
Limited availability!\n
Reply if interested - Thank You,\n\n
Alex\n
Principal AI Engineer
Forge Mission
Alexandra.Hamilton@mail.forgemission.com\n` 
    },
    { id: 'intro', name: 'Introduction Email', 
      subject: `Intro: {{contact.first_name}} from {{user.company}}`, 
      body: `Hi {{contact.first_name}},\n\nMy name is {{user.name}} from {{user.company}}. I wanted to reach out because...\n\nBest,\n{{user.name}}` },
    { id: 'followup', name: 'Follow-up Email', 
      subject: `Following up: {{contact.first_name}}`, 
      body: `Hi {{contact.first_name}},\n\nJust wanted to follow up on our previous conversation about...\n\nThanks,\n{{user.name}}` },
  ];
  const [selectedTemplate, setSelectedTemplate] = useState(null);


  useEffect(() => {
    if (session?.user?.email) {
      setFromAddress("Alexandra.Hamilton@mail.forgemission.com");
    } else {
      // Fallback if session or email is not available, though ideally user should be logged in.
      // Ensure this domain is verified with Mailgun.
      setFromAddress("Alexandra.Hamilton@mail.forgemission.com"); 
    }
  }, [session]);

  const applyTemplate = (templateContent, contactData, userData) => {
    let processedContent = templateContent;
    if (contactData) {
      processedContent = processedContent.replace(/{{contact\.first_name}}/g, contactData.first_name || '');
      processedContent = processedContent.replace(/{{contact\.last_name}}/g, contactData.last_name || '');
      processedContent = processedContent.replace(/{{contact\.organization_name}}/g, contactData.organization_name || '');
    }
    if (userData) {
      // Assuming session.user.name might be full name, and company isn't directly in session.
      // You might need to fetch more user details or have a default company.
      processedContent = processedContent.replace(/{{user\.name}}/g, userData.name || 'Your Name');
      processedContent = processedContent.replace(/{{user\.company}}/g, userData.company || 'Your Company');
    }
    return processedContent;
  };

  const handleTemplateChange = (e) => {
    const templateId = e.target.value;
    const template = emailTemplates.find(t => t.id === templateId);
    setSelectedTemplate(template);
    if (template) {
      const userData = { 
        name: session?.user?.name, 
        // company: session?.user?.company // if you add company to session user
        company: "Lead Flow App" // Placeholder
      };
      setSubject(applyTemplate(template.subject, contact, userData));
      setTextBody(applyTemplate(template.body, contact, userData));
      setHtmlBody(''); 
    } else {
      setSubject('');
      setTextBody('');
      setHtmlBody('');
    }
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
          from: fromAddress, 
          subject,
          textBody, 
          htmlBody: htmlBody || `<p>${textBody.replace(/\n/g, '<br>')}</p>`, 
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to send email');
      }
      setSendStatus({ message: `Email sent successfully! (ID: ${result.mailgunId || 'N/A'})`, type: 'success' });
    } catch (error) {
      console.error("Error sending email:", error);
      setSendStatus({ message: error.message || 'An error occurred.', type: 'error' });
    } finally {
      setIsSending(false);
    }
  };

  const handlePolishEmail = async () => {
    const currentContent = textBody || htmlBody; // Prefer HTML body if it exists
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
        // Assuming AI returns plain text, update textBody.
        // If it returns HTML, you'd update htmlBody and potentially convert to textBody.
        setTextBody(data.polishedText);
        setHtmlBody(''); // Clear HTML if we're setting text body
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
        <div>
          <label htmlFor="from" className="block text-sm font-medium text-slate-700 dark:text-slate-300">From:</label>
          <input
            type="email"
            id="from"
            value={fromAddress}
            onChange={(e) => setFromAddress(e.target.value)} 
            required
            className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
            placeholder="your-email@yourverifieddomain.com"
          />
           <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Ensure this email is from a domain verified with Mailgun.</p>
        </div>

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
        
        <div className="relative">
          <label htmlFor="template" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Select Template:</label>
          <select
            id="template"
            value={selectedTemplate ? selectedTemplate.id : ''}
            onChange={handleTemplateChange}
            className="mt-1 block w-full pl-3 pr-10 py-2.5 text-base border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md appearance-none bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200"
          >
            <option value="">-- No Template --</option>
            {emailTemplates.map(template => (
              <option key={template.id} value={template.id}>{template.name}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 top-6 flex items-center px-2 text-slate-700 dark:text-slate-300">
            <ChevronDown size={20} />
          </div>
        </div>


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
