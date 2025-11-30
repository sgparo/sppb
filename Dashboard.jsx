import React, { useState, useEffect } from 'react';
import {
  BarChart,
  TrendingUp,
  Users,
  FileText,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Eye,
  Filter
} from 'lucide-react';
import { loadCSVFile, calculateMetrics } from './csvUtils';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [leads, setLeads] = useState([]);
  const [projects, setProjects] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [leadsData, projectsData, quotesData] = await Promise.all([
        loadCSVFile('LEADS.csv'),
        loadCSVFile('PROJECTS.csv'),
        loadCSVFile('QUOTES.csv'),
      ]);

      setLeads(leadsData);
      setProjects(projectsData);
      setQuotes(quotesData);
      setMetrics(calculateMetrics(quotesData, projectsData));
      setLoading(false);
    };

    loadData();
  }, []);

  const fmtCurrency = (val) => {
    const num = parseFloat(val);
    return isNaN(num) ? '$0' : new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(num);
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.Customer_Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.Email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || lead.Status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredProjects = projects.filter(proj => {
    const matchesSearch = proj.Customer_Name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || proj.Status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = quote.Customer_Name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || quote.Status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <header className="pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3 mb-2">
            <BarChart className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl font-bold">Business Dashboard</h1>
          </div>
          <p className="text-slate-400">Leads, Projects, Quotes & Analytics</p>
        </header>

        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b border-slate-800 overflow-x-auto">
          {['overview', 'leads', 'projects', 'quotes'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-medium transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? 'border-b-2 border-blue-400 text-blue-400'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && metrics && (
          <div className="space-y-8">
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-sm font-medium">Total Revenue</span>
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-emerald-400">{fmtCurrency(metrics.totalRevenue)}</div>
                <p className="text-xs text-slate-500 mt-2">{metrics.acceptedQuotes} accepted quotes</p>
              </div>

              <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-sm font-medium">Avg Profit Margin</span>
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-blue-400">{metrics.avgProfitMargin}%</div>
                <p className="text-xs text-slate-500 mt-2">Across all quotes</p>
              </div>

              <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-sm font-medium">Conversion Rate</span>
                  <CheckCircle2 className="w-5 h-5 text-amber-400" />
                </div>
                <div className="text-2xl font-bold text-amber-400">{metrics.conversionRate}%</div>
                <p className="text-xs text-slate-500 mt-2">{metrics.totalQuotes} total quotes</p>
              </div>

              <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-sm font-medium">Active Projects</span>
                  <Calendar className="w-5 h-5 text-violet-400" />
                </div>
                <div className="text-2xl font-bold text-violet-400">{metrics.openProjects}</div>
                <p className="text-xs text-slate-500 mt-2">{metrics.completedProjects} completed</p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Leads */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  Recent Leads
                </h3>
                <div className="space-y-3">
                  {leads.slice(0, 5).map(lead => (
                    <div key={lead.Lead_ID} className="border-l-2 border-blue-400 pl-4 py-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-slate-100">{lead.Customer_Name}</p>
                          <p className="text-xs text-slate-500">{lead.City}, {lead.State}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          lead.Status === 'NEW' ? 'bg-green-500/20 text-green-400' :
                          lead.Status === 'CONTACTED' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-slate-700 text-slate-300'
                        }`}>
                          {lead.Status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Quotes */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-400" />
                  Recent Quotes
                </h3>
                <div className="space-y-3">
                  {quotes.slice(0, 5).map(quote => (
                    <div key={quote.Quote_ID} className="border-l-2 border-amber-400 pl-4 py-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-slate-100">{quote.Customer_Name}</p>
                          <p className="text-xs text-slate-500">{quote.Roof_Area_Squares} squares</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-emerald-400">{fmtCurrency(quote.Total_Quote)}</p>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            quote.Status === 'ACCEPTED' ? 'bg-green-500/20 text-green-400' :
                            quote.Status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {quote.Status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LEADS TAB */}
        {activeTab === 'leads' && (
          <div className="space-y-4">
            {/* Search & Filter */}
            <div className="flex gap-4 flex-wrap">
              <input
                type="text"
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 min-w-64 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">All Status</option>
                <option value="NEW">NEW</option>
                <option value="CONTACTED">CONTACTED</option>
                <option value="QUOTED">QUOTED</option>
              </select>
            </div>

            {/* Leads Table */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-700 bg-slate-800/50">
                    <tr>
                      <th className="px-6 py-3 text-left font-semibold text-slate-300">Customer</th>
                      <th className="px-6 py-3 text-left font-semibold text-slate-300">Location</th>
                      <th className="px-6 py-3 text-left font-semibold text-slate-300">Contact</th>
                      <th className="px-6 py-3 text-left font-semibold text-slate-300">Source</th>
                      <th className="px-6 py-3 text-left font-semibold text-slate-300">Status</th>
                      <th className="px-6 py-3 text-left font-semibold text-slate-300">Squares</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {filteredLeads.map(lead => (
                      <tr key={lead.Lead_ID} className="hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-medium text-slate-100">{lead.Customer_Name}</p>
                          <p className="text-xs text-slate-500">{lead.Lead_ID}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-slate-300">
                            <MapPin className="w-4 h-4 text-slate-500" />
                            {lead.City}, {lead.State} {lead.Zip}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs space-y-1">
                            <div className="flex items-center gap-2 text-slate-300">
                              <Phone className="w-3 h-3" />
                              {lead.Phone}
                            </div>
                            <div className="flex items-center gap-2 text-slate-400">
                              <Mail className="w-3 h-3" />
                              {lead.Email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-300">{lead.Lead_Source}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            lead.Status === 'NEW' ? 'bg-green-500/20 text-green-400' :
                            lead.Status === 'CONTACTED' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-slate-700 text-slate-300'
                          }`}>
                            {lead.Status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-300 font-mono">{lead.Squares_Est}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredLeads.length === 0 && (
                <div className="p-8 text-center text-slate-400">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No leads found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PROJECTS TAB */}
        {activeTab === 'projects' && (
          <div className="space-y-4">
            {/* Search & Filter */}
            <div className="flex gap-4 flex-wrap">
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 min-w-64 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">All Status</option>
                <option value="SCHEDULED">SCHEDULED</option>
                <option value="IN_PROGRESS">IN PROGRESS</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </div>

            {/* Projects Table */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-700 bg-slate-800/50">
                    <tr>
                      <th className="px-6 py-3 text-left font-semibold text-slate-300">Project ID</th>
                      <th className="px-6 py-3 text-left font-semibold text-slate-300">Customer</th>
                      <th className="px-6 py-3 text-left font-semibold text-slate-300">Status</th>
                      <th className="px-6 py-3 text-left font-semibold text-slate-300">Sale Amount</th>
                      <th className="px-6 py-3 text-left font-semibold text-slate-300">Deposit</th>
                      <th className="px-6 py-3 text-left font-semibold text-slate-300">Start Date</th>
                      <th className="px-6 py-3 text-left font-semibold text-slate-300">PM</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {filteredProjects.map(proj => (
                      <tr key={proj.Project_ID} className="hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4 font-mono text-slate-300">{proj.Project_ID}</td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-slate-100">{proj.Customer_Name}</p>
                          <p className="text-xs text-slate-500">{proj.Project_Address}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            proj.Status === 'SCHEDULED' ? 'bg-blue-500/20 text-blue-400' :
                            proj.Status === 'IN_PROGRESS' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>
                            {proj.Status}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-emerald-400">{fmtCurrency(proj.Sale_Amount)}</td>
                        <td className="px-6 py-4 text-slate-300">{fmtCurrency(proj.Deposit_Amount)}</td>
                        <td className="px-6 py-4 text-slate-300 text-xs">{proj.Scheduled_Start}</td>
                        <td className="px-6 py-4 text-slate-300">{proj.Project_Manager || 'Unassigned'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredProjects.length === 0 && (
                <div className="p-8 text-center text-slate-400">
                  <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No projects found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* QUOTES TAB */}
        {activeTab === 'quotes' && (
          <div className="space-y-4">
            {/* Search & Filter */}
            <div className="flex gap-4 flex-wrap">
              <input
                type="text"
                placeholder="Search quotes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 min-w-64 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">PENDING</option>
                <option value="ACCEPTED">ACCEPTED</option>
                <option value="DECLINED">DECLINED</option>
              </select>
            </div>

            {/* Quotes Table */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-700 bg-slate-800/50">
                    <tr>
                      <th className="px-6 py-3 text-left font-semibold text-slate-300">Quote ID</th>
                      <th className="px-6 py-3 text-left font-semibold text-slate-300">Customer</th>
                      <th className="px-6 py-3 text-left font-semibold text-slate-300">Material</th>
                      <th className="px-6 py-3 text-left font-semibold text-slate-300">Squares</th>
                      <th className="px-6 py-3 text-left font-semibold text-slate-300">Total</th>
                      <th className="px-6 py-3 text-left font-semibold text-slate-300">Margin</th>
                      <th className="px-6 py-3 text-left font-semibold text-slate-300">Status</th>
                      <th className="px-6 py-3 text-left font-semibold text-slate-300">Valid Until</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {filteredQuotes.map(quote => (
                      <tr key={quote.Quote_ID} className="hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4 font-mono text-slate-300">{quote.Quote_ID}</td>
                        <td className="px-6 py-4 font-medium text-slate-100">{quote.Customer_Name}</td>
                        <td className="px-6 py-4 text-slate-300">{quote.Material_Grade}</td>
                        <td className="px-6 py-4 font-mono text-slate-300">{quote.Roof_Area_Squares}</td>
                        <td className="px-6 py-4 font-semibold text-emerald-400">{fmtCurrency(quote.Total_Quote)}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            parseFloat(quote.Profit_Margin_Percent) >= 30 ? 'bg-green-500/20 text-green-400' :
                            parseFloat(quote.Profit_Margin_Percent) >= 20 ? 'bg-amber-500/20 text-amber-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {quote.Profit_Margin_Percent}%
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            quote.Status === 'ACCEPTED' ? 'bg-green-500/20 text-green-400' :
                            quote.Status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {quote.Status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-300 text-xs">{quote.Valid_Until}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredQuotes.length === 0 && (
                <div className="p-8 text-center text-slate-400">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No quotes found</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;
