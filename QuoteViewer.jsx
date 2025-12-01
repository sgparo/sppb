import React from 'react';
import { X, Mail, Download } from 'lucide-react';

const QuoteViewer = ({ quote, onClose }) => {
  const fmtCurrency = (val) => {
    const num = parseFloat(val);
    return isNaN(num) ? '$0' : new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(num);
  };

  const fmtDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900 border-b border-slate-800 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Quote #{quote.Quote_ID}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Quote Document */}
          <div className="bg-white text-slate-900 rounded-lg p-8 print:shadow-none">
            {/* Company Header */}
            <div className="mb-8 pb-6 border-b-2 border-slate-300">
              <h1 className="text-3xl font-bold text-blue-600">SPPB Roofing</h1>
              <p className="text-slate-600">Professional Roofing Solutions</p>
            </div>

            {/* Quote Title and Info */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h2 className="text-xl font-bold mb-4">Quote Details</h2>
                <div className="space-y-2 text-sm">
                  <p><span className="font-semibold">Quote #:</span> {quote.Quote_ID}</p>
                  <p><span className="font-semibold">Date:</span> {fmtDate(quote.Date_Generated)}</p>
                  <p><span className="font-semibold">Valid Until:</span> {fmtDate(quote.Valid_Until)}</p>
                  <p><span className="font-semibold">Status:</span> <span className={`font-semibold ${
                    quote.Status === 'ACCEPTED' ? 'text-green-600' :
                    quote.Status === 'PENDING' ? 'text-amber-600' :
                    'text-red-600'
                  }`}>{quote.Status}</span></p>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold mb-4">Customer</h2>
                <div className="space-y-1 text-sm">
                  <p className="font-semibold">{quote.Customer_Name}</p>
                  {quote.Lead_ID && <p className="text-slate-600">Lead ID: {quote.Lead_ID}</p>}
                </div>
              </div>
            </div>

            {/* Roof Specifications */}
            <div className="mb-8 pb-6 border-b border-slate-300">
              <h3 className="text-lg font-bold mb-4">Roof Specifications</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-600">Roof Area</p>
                  <p className="font-semibold">{quote.Roof_Area_Squares} squares ({parseFloat(quote.Roof_Area_SF || 0).toFixed(0)} sq ft)</p>
                </div>
                <div>
                  <p className="text-slate-600">Material Type</p>
                  <p className="font-semibold">{quote.Material_Type || 'Asphalt Shingle'}</p>
                </div>
                <div>
                  <p className="text-slate-600">Material Grade</p>
                  <p className="font-semibold">{quote.Material_Grade || 'Standard'}</p>
                </div>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="mb-8 pb-6 border-b border-slate-300">
              <h3 className="text-lg font-bold mb-4">Cost Breakdown</h3>
              <div className="space-y-3 text-sm">
                {quote.Material_Cost && (
                  <div className="flex justify-between">
                    <span>Material Cost</span>
                    <span>{fmtCurrency(quote.Material_Cost)}</span>
                  </div>
                )}
                {quote.Labor_Cost && (
                  <div className="flex justify-between">
                    <span>Labor Cost</span>
                    <span>{fmtCurrency(quote.Labor_Cost)}</span>
                  </div>
                )}
                {quote.Disposal_Cost && parseFloat(quote.Disposal_Cost) > 0 && (
                  <div className="flex justify-between">
                    <span>Disposal Cost</span>
                    <span>{fmtCurrency(quote.Disposal_Cost)}</span>
                  </div>
                )}
                {quote.Permit_Cost && parseFloat(quote.Permit_Cost) > 0 && (
                  <div className="flex justify-between">
                    <span>Permit Cost</span>
                    <span>{fmtCurrency(quote.Permit_Cost)}</span>
                  </div>
                )}
                {quote.Other_Costs && parseFloat(quote.Other_Costs) > 0 && (
                  <div className="flex justify-between">
                    <span>Other Costs</span>
                    <span>{fmtCurrency(quote.Other_Costs)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Summary */}
            <div className="mb-8 bg-slate-100 rounded-lg p-6">
              <div className="space-y-3">
                {quote.Subtotal && (
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{fmtCurrency(quote.Subtotal)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-3 border-t-2 border-slate-300">
                  <span>Total Quote</span>
                  <span className="text-emerald-600">{fmtCurrency(quote.Total_Quote)}</span>
                </div>
              </div>
            </div>

            {/* Deposit and Terms */}
            <div className="grid grid-cols-2 gap-6 mb-8 text-sm">
              <div>
                <p className="text-slate-600 font-semibold">Deposit Required</p>
                <p className="text-lg font-bold">{fmtCurrency(quote.Deposit_Required)}</p>
              </div>
              <div>
                <p className="text-slate-600 font-semibold">Profit Margin</p>
                <p className="text-lg font-bold">{quote.Profit_Margin_Percent}%</p>
              </div>
            </div>

            {/* Notes */}
            {quote.Notes && (
              <div className="mb-6 bg-slate-50 p-4 rounded border border-slate-200">
                <p className="text-slate-600 font-semibold text-sm mb-2">Notes</p>
                <p className="text-sm text-slate-700">{quote.Notes}</p>
              </div>
            )}

            {/* Footer */}
            <div className="pt-6 border-t border-slate-300 text-center text-xs text-slate-600">
              <p>Thank you for your business!</p>
              <p>This quote is valid until {fmtDate(quote.Valid_Until)}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-slate-900 border-t border-slate-800 p-6 flex gap-3 justify-end">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            Print / Save PDF
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuoteViewer;
