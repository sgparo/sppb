import React, { useState, useMemo } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import scopeItemsData from './scopeItems.json';

const FormModal = ({ modalType, editingId, formData, onFormDataChange, onSave, onCancel }) => {
  const [expandedCategory, setExpandedCategory] = useState(null);
  const getFields = () => {
    if (modalType === 'lead') {
      return [
        { label: 'Customer Name', key: 'Customer_Name', required: true },
        { label: 'Address', key: 'Address' },
        { label: 'City', key: 'City' },
        { label: 'State', key: 'State' },
        { label: 'Zip', key: 'Zip' },
        { label: 'Phone', key: 'Phone' },
        { label: 'Email', key: 'Email', required: true },
        { label: 'Lead Source', key: 'Lead_Source' },
        { label: 'Status', key: 'Status', type: 'select', options: ['PENDING', 'NEW', 'CONTACTED', 'QUOTED'] },
        { label: 'Roof Type', key: 'Roof_Type' },
        { label: 'Roof Pitch', key: 'Roof_Pitch' },
        { label: 'Estimated Squares', key: 'Squares_Est' },
        { label: 'Notes', key: 'Notes', type: 'textarea' },
      ];
    } else if (modalType === 'project') {
      return [
        { label: 'Lead ID', key: 'Lead_ID' },
        { label: 'Customer Name', key: 'Customer_Name', required: true },
        { label: 'Project Address', key: 'Project_Address' },
        { label: 'Status', key: 'Status', type: 'select', options: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED'] },
        { label: 'Date Sold', key: 'Date_Sold' },
        { label: 'Sale Amount', key: 'Sale_Amount', required: true },
        { label: 'Deposit Amount', key: 'Deposit_Amount' },
        { label: 'Deposit Date', key: 'Deposit_Date' },
        { label: 'Scheduled Start', key: 'Scheduled_Start' },
        { label: 'Scheduled Complete', key: 'Scheduled_Complete' },
        { label: 'Project Manager', key: 'Project_Manager' },
        { label: 'Notes', key: 'Notes', type: 'textarea' },
      ];
    } else if (modalType === 'quote') {
      return [
        { label: 'Lead ID', key: 'Lead_ID' },
        { label: 'Customer Name', key: 'Customer_Name', required: true },
        { label: 'Valid Until', key: 'Valid_Until' },
        { label: 'Status', key: 'Status', type: 'select', options: ['PENDING', 'ACCEPTED', 'DECLINED'] },
        { label: 'Roof Area (SF)', key: 'Roof_Area_SF' },
        { label: 'Roof Squares', key: 'Roof_Area_Squares' },
        { label: 'Material Type', key: 'Material_Type' },
        { label: 'Material Grade', key: 'Material_Grade' },
        { label: 'Labor Rate / Sq', key: 'Labor_Rate_Per_Sq' },
        { label: 'Material Cost', key: 'Material_Cost' },
        { label: 'Labor Cost', key: 'Labor_Cost' },
        { label: 'Disposal Cost', key: 'Disposal_Cost' },
        { label: 'Total Quote', key: 'Total_Quote', required: true },
        { label: 'Profit Margin %', key: 'Profit_Margin_Percent' },
        { label: 'Deposit Required', key: 'Deposit_Required' },
        { label: 'Notes', key: 'Notes', type: 'textarea' },
      ];
    }
    return [];
  };

  const fields = getFields();

  // Get scope items grouped by category
  const scopeItemsByCategory = useMemo(() => {
    const grouped = {};
    scopeItemsData.scopeItems.forEach(item => {
      if (!grouped[item.category]) {
        grouped[item.category] = [];
      }
      grouped[item.category].push(item);
    });
    return grouped;
  }, []);

  // Handle scope item selection
  const selectedScopes = useMemo(() => {
    return formData.Scope_Items ? (typeof formData.Scope_Items === 'string' ? JSON.parse(formData.Scope_Items) : formData.Scope_Items) : [];
  }, [formData.Scope_Items]);

  const toggleScopeItem = (itemId) => {
    const updated = selectedScopes.includes(itemId)
      ? selectedScopes.filter(id => id !== itemId)
      : [...selectedScopes, itemId];
    onFormDataChange({ ...formData, Scope_Items: updated });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {editingId ? 'Edit' : 'Add'} {modalType?.charAt(0).toUpperCase() + modalType?.slice(1)}
          </h2>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-200">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {fields.map(field => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {field.label}
                {field.required && <span className="text-red-400">*</span>}
              </label>
              {field.type === 'select' ? (
                <select
                  value={formData[field.key] || ''}
                  onChange={(e) => onFormDataChange({ ...formData, [field.key]: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select...</option>
                  {field.options?.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea
                  value={formData[field.key] || ''}
                  onChange={(e) => onFormDataChange({ ...formData, [field.key]: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
                  rows="3"
                />
              ) : (
                <input
                  type="text"
                  value={formData[field.key] || ''}
                  onChange={(e) => onFormDataChange({ ...formData, [field.key]: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
                />
              )}
            </div>
          ))}
        </div>

        {/* Scope Items for Quotes */}
        {modalType === 'quote' && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-200 mb-4">Scope of Work</h3>
            <div className="space-y-2">
              {Object.entries(scopeItemsByCategory).map(([category, items]) => (
                <div key={category} className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
                  <button
                    onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-800 transition-colors"
                  >
                    <span className="font-medium text-slate-300">{category}</span>
                    {expandedCategory === category ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                  {expandedCategory === category && (
                    <div className="px-4 py-3 bg-slate-900/50 border-t border-slate-700 space-y-2">
                      {items.map(item => (
                        <label key={item.id} className="flex items-start gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={selectedScopes.includes(item.id)}
                            onChange={() => toggleScopeItem(item.id)}
                            className="mt-1 w-4 h-4 rounded border-slate-600 bg-slate-800 cursor-pointer"
                          />
                          <div>
                            <p className="text-sm font-medium text-slate-200 group-hover:text-white">{item.name}</p>
                            <p className="text-xs text-slate-400">{item.description}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormModal;
