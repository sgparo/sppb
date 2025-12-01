import React from 'react';
import { X } from 'lucide-react';

const NotesModal = ({ customerName, notes, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-slate-100">{customerName} - Notes</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {notes ? (
            <p className="text-sm text-slate-300 whitespace-pre-wrap break-words max-h-96 overflow-y-auto">
              {notes}
            </p>
          ) : (
            <p className="text-sm text-slate-500 italic">No notes added for this customer</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotesModal;
