import React, { useState } from 'react';
import RoofingCalculator from './RoofingCalculator';
import Dashboard from './Dashboard';
import { Calculator, BarChart3 } from 'lucide-react';
import './index.css';

function App() {
  const [activePage, setActivePage] = useState('calculator');

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Navigation */}
      <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              SPPB Roofing Suite
            </h1>
            <div className="flex gap-2">
              <button
                onClick={() => setActivePage('calculator')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activePage === 'calculator'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Calculator className="w-4 h-4" />
                Estimator
              </button>
              <button
                onClick={() => setActivePage('dashboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activePage === 'dashboard'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      {activePage === 'calculator' && <RoofingCalculator />}
      {activePage === 'dashboard' && <Dashboard />}
    </div>
  );
}

export default App;
