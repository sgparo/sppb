import React, { useState, useEffect, useMemo } from 'react';
import {
  Calculator,
  Ruler,
  TrendingUp,
  DollarSign,
  Home,
  FileText,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Printer,
  Sun,
  Zap
} from 'lucide-react';
import materialsData from './materialsData.json';

const RoofingCalculator = ({ quoteFromLead, onQuoteSaved }) => {
  // --- State Management ---
  const [homeFootprintArea, setHomeFootprintArea] = useState(2500); // sq ft
  const [basePricePerSq, setBasePricePerSq] = useState(785); // Default: $785/sq (Insurance pricing)
  const [pitch, setPitch] = useState(4); // x/12
  const [steepSurcharge, setSteepSurcharge] = useState(100); // $ added per square for steep roofs
  const [wasteFactor, setWasteFactor] = useState(10); // %

  // --- Material Selection ---
  const [selectedShingle, setSelectedShingle] = useState('shingles_owens_duration');
  const [selectedUnderlayment, setSelectedUnderlayment] = useState('underlayment_synthetic');

  // --- Solar State ---
  const [hasSolar, setHasSolar] = useState(false);
  const [solarPanelCount, setSolarPanelCount] = useState(16);
  const [solarRrPrice, setSolarRrPrice] = useState(150); // $ per panel (CO Avg $150-$200)
  const [needsElecUpgrade, setNeedsElecUpgrade] = useState(false);
  const [elecUpgradeCost, setElecUpgradeCost] = useState(1200);

  // --- Pre-fill from lead data ---
  useEffect(() => {
    if (quoteFromLead && quoteFromLead.Roof_Area_Squares) {
      // Convert squares to roof area (1 square = 100 sq ft)
      const roofArea = parseInt(quoteFromLead.Roof_Area_Squares) * 100;
      setHomeFootprintArea(roofArea);
    }
  }, [quoteFromLead]);

  // --- Helper Functions ---
  const getPitchMultiplier = (pitchValue) => {
    return Math.sqrt(pitchValue * pitchValue + 144) / 12;
  };

  const getShinglePrice = (shingleId) => {
    for (const item of materialsData.categories.SHINGLES.items) {
      if (item.id === shingleId) return item.pricePerSquare.avg;
    }
    return 0;
  };

  const getUnderlaymentPrice = (underlaymentId) => {
    for (const item of materialsData.categories.UNDERLAYMENT.items) {
      if (item.id === underlaymentId) return item.pricePerSquare.avg;
    }
    return 0;
  };

  const getShingleName = (shingleId) => {
    for (const item of materialsData.categories.SHINGLES.items) {
      if (item.id === shingleId) return item.name;
    }
    return 'Unknown';
  };

  const getUnderlaymentName = (underlaymentId) => {
    for (const item of materialsData.categories.UNDERLAYMENT.items) {
      if (item.id === underlaymentId) return item.name;
    }
    return 'Unknown';
  };

  // --- Calculations ---
  const calculations = useMemo(() => {
    const pitchMultiplier = getPitchMultiplier(pitch);
    const actualRoofArea = homeFootprintArea * pitchMultiplier;
    const squares = actualRoofArea / 100;

    // Pitch Logic - Steep Slope Adder only applies at 7/12 or above
    let pitchCategory = "Standard";
    let activeSurcharge = 0;

    if (pitch < 7) {
      pitchCategory = "Standard";
      activeSurcharge = 0;
    } else {
      pitchCategory = "Steep Slope";
      activeSurcharge = steepSurcharge;
    }

    // Material Costs (informational only - not added to customer price)
    const shinglePrice = getShinglePrice(selectedShingle);
    const underlaymentPrice = getUnderlaymentPrice(selectedUnderlayment);

    const baseMaterialCost = squares * basePricePerSq;
    const pitchCostTotal = squares * activeSurcharge;

    // Waste Calculation - based on quoted price (base + pitch surcharge)
    const wasteCost = (baseMaterialCost + pitchCostTotal) * (wasteFactor / 100);

    // Solar Calculations
    let solarTotal = 0;
    if (hasSolar) {
        solarTotal += (solarPanelCount * solarRrPrice);
        if (needsElecUpgrade) {
            solarTotal += elecUpgradeCost;
        }
    }

    // Subtotal: base + pitch surcharge + waste (materials are not customer charges)
    const subtotal = baseMaterialCost + pitchCostTotal + wasteCost;

    const totalCost = subtotal + solarTotal;
    const finalPricePerSq = squares > 0 ? totalCost / squares : 0;

    return {
      squares,
      pitchMultiplier,
      actualRoofArea,
      pitchCategory,
      activeSurcharge,
      shinglePrice,
      underlaymentPrice,
      baseMaterialCost,
      pitchCostTotal,
      wasteCost,
      solarTotal,
      totalCost,
      finalPricePerSq
    };
  }, [homeFootprintArea, basePricePerSq, pitch, steepSurcharge, wasteFactor, hasSolar, solarPanelCount, solarRrPrice, needsElecUpgrade, elecUpgradeCost, selectedShingle, selectedUnderlayment]);

  // --- Formatters ---
  const fmtCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  const fmtNum = (val) => new Intl.NumberFormat('en-US').format(val);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent flex items-center gap-3">
              <Calculator className="w-8 h-8 text-blue-400" />
              ProRoof Estimator
            </h1>
            <p className="text-slate-400 mt-1">Colorado Front Range Edition • 2025 Pricing Data</p>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors text-sm font-medium border border-slate-700"
          >
            <Printer className="w-4 h-4" />
            Print Quote
          </button>
        </header>

        {quoteFromLead && (
          <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4 flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-blue-300">Creating Quote for: <span className="text-white">{quoteFromLead.Customer_Name}</span></p>
              <p className="text-sm text-blue-200 mt-1">Lead ID: {quoteFromLead.Lead_ID} • Estimated Squares: {quoteFromLead.Roof_Area_Squares}</p>
            </div>
            <button
              onClick={() => {
                if (onQuoteSaved) onQuoteSaved();
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors text-sm whitespace-nowrap"
            >
              Save Quote
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LEFT COLUMN: Inputs */}
          <div className="lg:col-span-7 space-y-6">

            {/* 1. Project Dimensions */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Ruler className="w-5 h-5 text-blue-400" />
                </div>
                <h2 className="text-lg font-semibold">Dimensions & Pitch</h2>
              </div>

              <div className="space-y-6">
                {/* Area Input */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-slate-300">Total Roof Area (sq ft)</label>
                    <span className="text-sm font-bold text-blue-400">{fmtNum(calculations.actualRoofArea.toFixed(0))} sq ft</span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="10000"
                    step="50"
                    value={homeFootprintArea}
                    onChange={(e) => setHomeFootprintArea(Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all"
                  />
                  <div className="mt-2 flex items-center gap-2">
                     <input
                        type="number"
                        value={homeFootprintArea}
                        onChange={(e) => setHomeFootprintArea(Number(e.target.value))}
                        className="bg-slate-800 border border-slate-700 rounded px-3 py-1 text-sm w-24 text-center focus:outline-none focus:border-blue-500"
                     />
                     <span className="text-xs text-slate-500">→ {calculations.squares.toFixed(2)} Squares (×{calculations.pitchMultiplier.toFixed(3)})</span>
                  </div>
                </div>

                {/* Pitch Input */}
                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                  <div className="flex justify-between mb-4">
                    <label className="text-sm font-medium text-slate-300">Roof Pitch ({pitch}/12)</label>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      pitch < 7 ? 'bg-emerald-500/20 text-emerald-300' :
                      'bg-red-500/20 text-red-300'
                    }`}>
                      {calculations.pitchCategory}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="18"
                      step="1"
                      value={pitch}
                      onChange={(e) => setPitch(Number(e.target.value))}
                      className={`w-full h-2 rounded-lg appearance-none cursor-pointer transition-all ${
                         pitch < 7 ? 'bg-emerald-900 accent-emerald-500' :
                         'bg-red-900 accent-red-500'
                      }`}
                    />

                    {/* Visual Pitch Representation */}
                    <div className="w-16 h-16 bg-slate-800 rounded-lg border border-slate-700 flex items-end justify-center pb-2 relative overflow-hidden shrink-0">
                       <div
                          className="absolute bottom-0 w-24 h-1 bg-gradient-to-r from-blue-500 to-emerald-500 origin-bottom-left transition-transform duration-300 ease-out"
                          style={{
                            transform: `rotate(-${(pitch / 12) * 45}deg)`,
                            left: '10%'
                          }}
                       />
                       <span className="text-[10px] text-slate-500 absolute bottom-1 right-1">{pitch}/12</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Pricing Configuration */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                </div>
                <h2 className="text-lg font-semibold">Pricing Factors</h2>
              </div>

              <div className="space-y-8">
                {/* Base Price Slider */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-slate-300">Base Price per Square</label>
                    <span className="text-sm font-bold text-emerald-400">{fmtCurrency(basePricePerSq)}</span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="1200"
                    step="5"
                    value={basePricePerSq}
                    onChange={(e) => setBasePricePerSq(Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400 transition-all"
                  />
                  <div className="flex justify-between mt-2">
                    <span className="text-xs text-slate-500">$500</span>
                    <input
                        type="number"
                        value={basePricePerSq}
                        onChange={(e) => setBasePricePerSq(Number(e.target.value))}
                        className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs w-20 text-center text-emerald-400"
                     />
                    <span className="text-xs text-slate-500">$1200</span>
                  </div>
                </div>

                {/* Steepness Delta Slider */}
                <div>
                  <div className="flex justify-between mb-2">
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-slate-300">Steep Pitch Surcharge Difference</label>
                        <span className="text-xs text-slate-500">Added cost per square for &gt;7/12 pitch</span>
                    </div>
                    <span className="text-sm font-bold text-amber-400">+{fmtCurrency(steepSurcharge)}/sq</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="300"
                    step="5"
                    value={steepSurcharge}
                    onChange={(e) => setSteepSurcharge(Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400 transition-all"
                  />
                   <div className="mt-2 text-xs text-slate-400 bg-slate-800/50 p-2 rounded flex items-center gap-2">
                     <AlertCircle className="w-3 h-3 text-amber-500"/>
                     Current Active Surcharge: <span className="text-white font-mono">{fmtCurrency(calculations.activeSurcharge)}/sq</span> (based on {pitch}/12 pitch)
                   </div>
                </div>

                {/* Waste Slider */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-slate-300">Waste Factor</label>
                    <span className="text-sm font-bold text-slate-200">{wasteFactor}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="25"
                    step="1"
                    value={wasteFactor}
                    onChange={(e) => setWasteFactor(Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-slate-400 hover:accent-slate-300 transition-all"
                  />
                </div>

                {/* Materials Selection */}
                <div className="border-t border-slate-700 pt-8 space-y-6">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Material Selection</div>

                  {/* Shingle Selection */}
                  <div>
                    <label className="text-sm font-medium text-slate-300 mb-2 block">Roofing Shingles</label>
                    <select
                      value={selectedShingle}
                      onChange={(e) => setSelectedShingle(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 hover:border-slate-600 transition-colors"
                    >
                      {materialsData.categories.SHINGLES.items.map((shingle) => (
                        <option key={shingle.id} value={shingle.id}>
                          {shingle.name} - {fmtCurrency(shingle.pricePerSquare.avg)}/sq
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-slate-500 mt-2">{getShingleName(selectedShingle)}</p>
                  </div>

                  {/* Underlayment Selection */}
                  <div>
                    <label className="text-sm font-medium text-slate-300 mb-2 block">Underlayment</label>
                    <select
                      value={selectedUnderlayment}
                      onChange={(e) => setSelectedUnderlayment(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 hover:border-slate-600 transition-colors"
                    >
                      {materialsData.categories.UNDERLAYMENT.items.map((underlayment) => (
                        <option key={underlayment.id} value={underlayment.id}>
                          {underlayment.name} - {fmtCurrency(underlayment.pricePerSquare.avg)}/sq
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-slate-500 mt-2">{getUnderlaymentName(selectedUnderlayment)}</p>
                  </div>

                  {/* Material Cost Breakdown */}
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-300">Shingles</span>
                      <span className="font-mono text-blue-400">{fmtCurrency(calculations.shinglePrice)}/sq</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-300">Underlayment</span>
                      <span className="font-mono text-blue-400">{fmtCurrency(calculations.underlaymentPrice)}/sq</span>
                    </div>
                    <div className="border-t border-slate-700 pt-3 flex justify-between items-center text-sm font-semibold">
                      <span className="text-slate-200">Material Cost / Sq</span>
                      <span className="font-mono text-emerald-400">{fmtCurrency(calculations.shinglePrice + calculations.underlaymentPrice)}/sq</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Solar Detach & Reset */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
                 <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-500/10 rounded-lg">
                        <Sun className="w-5 h-5 text-yellow-400" />
                        </div>
                        <h2 className="text-lg font-semibold">Solar Detach & Reset</h2>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={hasSolar} onChange={(e) => setHasSolar(e.target.checked)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                    </label>
                </div>

                {hasSolar && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-sm font-medium text-slate-300 mb-2 block">Panel Count</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="range" min="1" max="60" step="1"
                                        value={solarPanelCount} onChange={(e) => setSolarPanelCount(Number(e.target.value))}
                                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-400"
                                    />
                                    <input
                                        type="number" value={solarPanelCount} onChange={(e) => setSolarPanelCount(Number(e.target.value))}
                                        className="bg-slate-800 border border-slate-700 rounded px-2 py-1 w-16 text-center"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-300 mb-2 block">R&R Price / Panel</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="range" min="50" max="300" step="10"
                                        value={solarRrPrice} onChange={(e) => setSolarRrPrice(Number(e.target.value))}
                                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-400"
                                    />
                                    <span className="text-yellow-400 font-mono w-16 text-right">${solarRrPrice}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={needsElecUpgrade}
                                    onChange={(e) => setNeedsElecUpgrade(e.target.checked)}
                                    className="mt-1 w-4 h-4 rounded border-slate-600 bg-slate-700 text-yellow-500 focus:ring-yellow-500 focus:ring-offset-slate-900"
                                />
                                <div className="flex-1">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium text-slate-200 flex items-center gap-2">
                                            <Zap className="w-4 h-4 text-yellow-400"/> Electrical / Inverter Work
                                        </span>
                                        {needsElecUpgrade && (
                                            <input
                                                type="number"
                                                value={elecUpgradeCost}
                                                onChange={(e) => setElecUpgradeCost(Number(e.target.value))}
                                                className="bg-slate-900 border border-slate-600 rounded px-2 py-0.5 w-24 text-right text-sm"
                                            />
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1">
                                        Check if inverter needs replacement or if electrical system needs code upgrades.
                                    </p>
                                </div>
                            </label>
                        </div>
                    </div>
                )}
            </div>
          </div>

          {/* RIGHT COLUMN: Output */}
          <div className="lg:col-span-5 space-y-6">

            {/* Total Card */}
            <div className="sticky top-6">
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-8 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Home className="w-32 h-32" />
                    </div>

                    <div className="relative z-10">
                        <span className="text-slate-400 font-medium uppercase tracking-wider text-xs">Estimated Total</span>
                        <div className="text-5xl font-bold text-white mt-2 mb-1 tracking-tight">
                            {fmtCurrency(calculations.totalCost)}
                        </div>
                        <div className="text-sm text-emerald-400 font-medium mb-8 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" />
                            {fmtCurrency(calculations.finalPricePerSq)} per sq avg.
                        </div>

                        <div className="space-y-4 border-t border-slate-700 pt-6">

                            {/* Line Item: Base */}
                            <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                    <span className="text-slate-300">Base Material & Labor</span>
                                </div>
                                <span className="font-mono text-slate-200">{fmtCurrency(calculations.baseMaterialCost)}</span>
                            </div>

                            {/* Line Item: Pitch */}
                            <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${calculations.activeSurcharge > 0 ? 'bg-amber-500' : 'bg-slate-600'}`}></span>
                                    <span className="text-slate-300">Pitch Difficulty ({calculations.pitchCategory})</span>
                                </div>
                                <span className={`font-mono ${calculations.activeSurcharge > 0 ? 'text-amber-400' : 'text-slate-500'}`}>
                                    {calculations.activeSurcharge > 0 ? '+' : ''}{fmtCurrency(calculations.pitchCostTotal)}
                                </span>
                            </div>

                            {/* Line Item: Solar */}
                            <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${calculations.solarTotal > 0 ? 'bg-yellow-500' : 'bg-slate-600'}`}></span>
                                    <span className="text-slate-300">Solar Detach & Reset</span>
                                </div>
                                <span className={`font-mono ${calculations.solarTotal > 0 ? 'text-yellow-400' : 'text-slate-500'}`}>
                                    {calculations.solarTotal > 0 ? '+' : ''}{fmtCurrency(calculations.solarTotal)}
                                </span>
                            </div>

                            {/* Line Item: Waste */}
                            <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                                    <span className="text-slate-300">Waste Overage ({wasteFactor}%)</span>
                                </div>
                                <span className="font-mono text-slate-200">{fmtCurrency(calculations.wasteCost)}</span>
                            </div>
                        </div>

                        <div className="mt-8 bg-slate-950/50 rounded-xl p-4 border border-slate-700/50">
                            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Project Specs</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-xs text-slate-500">Roof Area</div>
                                    <div className="text-lg font-mono text-slate-200">{fmtNum(calculations.actualRoofArea.toFixed(0))} sq ft</div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-500">Roof Squares (w/ Waste)</div>
                                    <div className="text-lg font-mono text-slate-200">{(calculations.squares * (1 + wasteFactor / 100)).toFixed(2)}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-500">Pitch / Mult</div>
                                    <div className="text-lg font-mono text-slate-200">{pitch}/12 (×{calculations.pitchMultiplier.toFixed(3)})</div>
                                </div>
                                <div>
                                    <div className="text-xs text-slate-500">Base / Sq</div>
                                    <div className="text-lg font-mono text-slate-200">{fmtCurrency(basePricePerSq)}</div>
                                </div>
                            </div>
                        </div>

                        <button className="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-blue-500/20">
                            Save Estimate <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Info Box */}
                <div className="mt-6 p-4 border border-blue-900/50 bg-blue-900/10 rounded-xl flex items-start gap-3">
                   <TrendingUp className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
                   <div className="text-xs text-blue-200 leading-relaxed">
                      <strong>Market Insight:</strong> Front Range pricing (Denver/Boulder) averages <strong>$450 - $900/sq</strong> depending on material. Solar R&R typically runs <strong>$150-$200/panel</strong> plus electrical fees.
                   </div>
                </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default RoofingCalculator;
