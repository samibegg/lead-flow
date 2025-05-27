// components/contacts/DisqualifyModal.js
'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal'; // Assuming your generic Modal component path
import { XCircle, Save } from 'lucide-react';

const disqualificationReasons = [
  { id: 'inactive', label: 'Inactive / No Response' },
  { id: 'wrong_market', label: 'Not a Fit / Wrong Market' },
  { id: 'budget_constraints', label: 'Budget Constraints' },
  { id: 'timeline_mismatch', label: 'Timeline Mismatch' },
  { id: 'other', label: 'Other' },
];

export default function DisqualifyModal({ isOpen, onClose, contact, onDisqualify }) {
  const [selectedReasons, setSelectedReasons] = useState([]);
  const [otherReasonText, setOtherReasonText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (contact?.disqualification?.reasons) {
      setSelectedReasons(contact.disqualification.reasons);
      if (contact.disqualification.reasons.includes('other')) {
        setOtherReasonText(contact.disqualification.other_reason_text || '');
      } else {
        setOtherReasonText('');
      }
    } else {
      setSelectedReasons([]);
      setOtherReasonText('');
    }
  }, [isOpen, contact]); // Reset form when modal opens or contact changes

  const handleCheckboxChange = (reasonId) => {
    setSelectedReasons(prev =>
      prev.includes(reasonId)
        ? prev.filter(r => r !== reasonId)
        : [...prev, reasonId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const disqualificationData = {
      reasons: selectedReasons,
      other_reason_text: selectedReasons.includes('other') ? otherReasonText : '',
      timestamp: new Date(),
    };
    await onDisqualify(disqualificationData);
    setIsSaving(false);
    onClose();
  };

  const handleRequalify = async () => {
    setIsSaving(true);
    // Send null or an empty structure to signify requalification
    await onDisqualify({ reasons: [], other_reason_text: '', timestamp: null }); 
    setIsSaving(false);
    onClose();
  };
  
  const isAlreadyDisqualified = contact?.disqualification && contact.disqualification.reasons && contact.disqualification.reasons.length > 0;


  if (!isOpen || !contact) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isAlreadyDisqualified ? `Update Disqualification: ${contact.first_name}` : `Disqualify Contact: ${contact.first_name}`}>
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-3">
            Select reason(s) for disqualifying this contact:
          </p>
          <div className="space-y-3">
            {disqualificationReasons.map(reason => (
              <div key={reason.id} className="flex items-center">
                <input
                  id={`reason-${reason.id}`}
                  name="disqualificationReason"
                  type="checkbox"
                  value={reason.id}
                  checked={selectedReasons.includes(reason.id)}
                  onChange={() => handleCheckboxChange(reason.id)}
                  className="h-4 w-4 text-primary dark:text-primary-dark border-border-light dark:border-border-dark rounded focus:ring-primary dark:focus:ring-primary-dark"
                />
                <label htmlFor={`reason-${reason.id}`} className="ml-3 block text-sm text-text-primary-light dark:text-text-primary-dark">
                  {reason.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {selectedReasons.includes('other') && (
          <div>
            <label htmlFor="otherReasonText" className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
              Other Reason Details:
            </label>
            <textarea
              id="otherReasonText"
              name="otherReasonText"
              rows={3}
              value={otherReasonText}
              onChange={(e) => setOtherReasonText(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-md shadow-sm focus:ring-primary dark:focus:border-primary sm:text-sm bg-surface-light dark:bg-slate-700 text-text-primary-light dark:text-text-primary-dark"
              placeholder="Please specify other reason"
            />
          </div>
        )}

        <div className="pt-5 border-t border-border-light dark:border-border-dark flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="w-full sm:w-auto px-4 py-2 border border-border-light dark:border-border-dark text-sm font-medium rounded-md text-text-secondary-light dark:text-text-secondary-dark bg-surface-light dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light dark:focus:ring-offset-slate-900 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          {isAlreadyDisqualified && (
             <button
              type="button"
              onClick={handleRequalify}
              disabled={isSaving}
              className="w-full sm:w-auto flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-slate-900 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Re-qualify Contact'}
            </button>
          )}
          <button
            type="submit"
            disabled={isSaving || selectedReasons.length === 0 || (selectedReasons.includes('other') && !otherReasonText.trim())}
            className="w-full sm:w-auto flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-slate-900 disabled:opacity-50 disabled:bg-red-400 dark:disabled:bg-red-800"
          >
            <Save size={16} className="mr-2" />
            {isSaving ? 'Saving...' : (isAlreadyDisqualified ? 'Update Disqualification' : 'Disqualify Contact')}
          </button>
        </div>
      </form>
    </Modal>
  );
}