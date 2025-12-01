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
  Plus,
  Trash2,
  Edit2,
  X
} from 'lucide-react';
import { loadCSVFile, calculateMetrics } from './csvUtils';
import { getQuotes, saveQuotes, getLeads, saveLeads, getProjects, saveProjects } from './storageUtils';
import FormModal from './FormModal';

const Dashboard = ({ onCreateQuoteFromLead }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [leads, setLeads] = useState([]);
  const [projects, setProjects] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Admin modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState(null); // 'lead', 'project', 'quote'
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      // Try to load from localStorage first, then fall back to CSV files
      let leadsData = getLeads();
      let projectsData = getProjects();
      let quotesData = getQuotes();

      // If localStorage is empty, load from CSV files
      if (leadsData.length === 0 && projectsData.length === 0 && quotesData.length === 0) {
        const [csvLeads, csvProjects, csvQuotes] = await Promise.all([
          loadCSVFile('LEADS.csv'),
          loadCSVFile('PROJECTS.csv'),
          loadCSVFile('QUOTES.csv'),
        ]);
        leadsData = csvLeads;
        projectsData = csvProjects;
        quotesData = csvQuotes;
      }

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

  // Generate unique ID
  const generateId = (prefix, existingList) => {
    const maxNum = existingList.reduce((max, item) => {
      const num = parseInt(item[Object.keys(item)[0]]?.replace(prefix + '_', '') || 0);
      return num > max ? num : max;
    }, 0);
    return `${prefix}_${String(maxNum + 1).padStart(3, '0')}`;
  };

  // Open add modal
  const openAddModal = (type) => {
    setModalType(type);
    setEditingId(null);
    setFormData({});
    setShowAddModal(true);
  };

  // Open edit modal
  const openEditModal = (type, item) => {
    setModalType(type);
    setEditingId(item[Object.keys(item)[0]]);
    setFormData({ ...item });
    setShowAddModal(true);
  };

  // Create project from lead
  const createProjectFromLead = (lead) => {
    setModalType('project');
    setEditingId(null);
    setFormData({
      Lead_ID: lead.Lead_ID,
      Customer_Name: lead.Customer_Name,
      Project_Address: `${lead.Address}, ${lead.City}, ${lead.State} ${lead.Zip}`,
      Status: 'SCHEDULED',
    });
    setShowAddModal(true);
  };

  // Create quote from lead
  const createQuoteFromLead = (lead) => {
    // Use callback to switch to calculator and pre-fill with lead data
    if (onCreateQuoteFromLead) {
      onCreateQuoteFromLead({
        Lead_ID: lead.Lead_ID,
        Customer_Name: lead.Customer_Name,
        Roof_Area_Squares: lead.Squares_Est,
      });
    } else {
      // Fallback for dashboard modal if callback not available
      setModalType('quote');
      setEditingId(null);
      setFormData({
        Lead_ID: lead.Lead_ID,
        Customer_Name: lead.Customer_Name,
        Roof_Area_Squares: lead.Squares_Est,
        Status: 'PENDING',
      });
      setShowAddModal(true);
    }
  };

  // Save record
  const handleSave = () => {
    if (modalType === 'lead') {
      if (!formData.Customer_Name || !formData.Email) {
        alert('Please fill in required fields');
        return;
      }
      let updatedLeads;
      if (editingId) {
        updatedLeads = leads.map(l => l.Lead_ID === editingId ? { ...formData, Lead_ID: editingId } : l);
      } else {
        const newLead = {
          ...formData,
          Lead_ID: generateId('LEAD', leads),
          Date_Entered: new Date().toISOString().split('T')[0]
        };
        updatedLeads = [...leads, newLead];
      }
      setLeads(updatedLeads);
      saveLeads(updatedLeads);
    } else if (modalType === 'project') {
      if (!formData.Customer_Name || !formData.Sale_Amount) {
        alert('Please fill in required fields');
        return;
      }
      let updatedProjects;
      if (editingId) {
        updatedProjects = projects.map(p => p.Project_ID === editingId ? { ...formData, Project_ID: editingId } : p);
      } else {
        const newProject = {
          ...formData,
          Project_ID: generateId('PROJ', projects)
        };
        updatedProjects = [...projects, newProject];
      }
      setProjects(updatedProjects);
      saveProjects(updatedProjects);
    } else if (modalType === 'quote') {
      if (!formData.Customer_Name || !formData.Total_Quote) {
        alert('Please fill in required fields');
        return;
      }
      let updatedQuotes;
      if (editingId) {
        updatedQuotes = quotes.map(q => q.Quote_ID === editingId ? { ...formData, Quote_ID: editingId } : q);
      } else {
        const newQuote = {
          ...formData,
          Quote_ID: generateId('QUOTE', quotes),
          Date_Generated: new Date().toISOString().split('T')[0]
        };
        updatedQuotes = [...quotes, newQuote];
      }
      setQuotes(updatedQuotes);
      saveQuotes(updatedQuotes);
    }
    setMetrics(calculateMetrics(quotes, projects));
    setShowAddModal(false);
  };

  // Delete record
  const handleDelete = (type, id) => {
    if (!confirm('Are you sure you want to delete this record?')) return;

    if (type === 'lead') {
      const updatedLeads = leads.filter(l => l.Lead_ID !== id);
      setLeads(updatedLeads);
      saveLeads(updatedLeads);
    } else if (type === 'project') {
      const updatedProjects = projects.filter(p => p.Project_ID !== id);
      setProjects(updatedProjects);
      saveProjects(updatedProjects);
    } else if (type === 'quote') {
      const updatedQuotes = quotes.filter(q => q.Quote_ID !== id);
      setQuotes(updatedQuotes);
      saveQuotes(updatedQuotes);
    }
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

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => openAddModal('lead')}
                className="flex items-center gap-3 p-4 bg-blue-600/20 border border-blue-500/50 hover:bg-blue-600/30 rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5 text-blue-400" />
                <div className="text-left">
                  <p className="font-semibold text-blue-400">Add Lead</p>
                  <p className="text-xs text-slate-400">Create new prospect</p>
                </div>
              </button>
              <button
                onClick={() => openAddModal('project')}
                className="flex items-center gap-3 p-4 bg-emerald-600/20 border border-emerald-500/50 hover:bg-emerald-600/30 rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5 text-emerald-400" />
                <div className="text-left">
                  <p className="font-semibold text-emerald-400">Add Project</p>
                  <p className="text-xs text-slate-400">Start new project</p>
                </div>
              </button>
              <button
                onClick={() => openAddModal('quote')}
                className="flex items-center gap-3 p-4 bg-amber-600/20 border border-amber-500/50 hover:bg-amber-600/30 rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5 text-amber-400" />
                <div className="text-left">
                  <p className="font-semibold text-amber-400">Add Quote</p>
                  <p className="text-xs text-slate-400">Create new estimate</p>
                </div>
              </button>
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
              <button
                onClick={() => openAddModal('lead')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Lead
              </button>
            </div>

            {/* Leads Table */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-700 bg-slate-800/50">
                    <tr>
                      <th className="px-6 py-3 text-left font-semibold text-slate-300">Customer</th>
                      <th className="px-6 py-3 text-left font-semibold text-slate-300">Contact</th>
                      <th className="px-6 py-3 text-left font-semibold text-slate-300">Status</th>
                      <th className="px-6 py-3 text-left font-semibold text-slate-300">Squares</th>
                      <th className="px-6 py-3 text-left font-semibold text-slate-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {filteredLeads.map(lead => (
                      <tr key={lead.Lead_ID} className="hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-medium text-slate-100">{lead.Customer_Name}</p>
                          <p className="text-xs text-slate-500">{lead.City}, {lead.State}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs space-y-1">
                            <div className="text-slate-300">{lead.Phone}</div>
                            <div className="text-slate-400">{lead.Email}</div>
                          </div>
                        </td>
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
                        <td className="px-6 py-4">
                          <div className="flex gap-2 flex-wrap">
                            <button
                              onClick={() => createProjectFromLead(lead)}
                              className="text-xs px-2 py-1 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 rounded transition-colors"
                              title="Create project from this lead"
                            >
                              + Project
                            </button>
                            <button
                              onClick={() => createQuoteFromLead(lead)}
                              className="text-xs px-2 py-1 bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 rounded transition-colors"
                              title="Create quote from this lead"
                            >
                              + Quote
                            </button>
                            <button
                              onClick={() => openEditModal('lead', lead)}
                              className="text-blue-400 hover:text-blue-300"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete('lead', lead.Lead_ID)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
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
              <button
                onClick={() => openAddModal('project')}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Project
              </button>
            </div>

            {/* Projects Table */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-700 bg-slate-800/50">
                    <tr>
                      <th className="px-6 py-3 text-left font-semibold text-slate-300">Customer</th>
                      <th className="px-6 py-3 text-left font-semibold text-slate-300">Status</th>
                      <th className="px-6 py-3 text-left font-semibold text-slate-300">Sale Amount</th>
                      <th className="px-6 py-3 text-left font-semibold text-slate-300">Deposit</th>
                      <th className="px-6 py-3 text-left font-semibold text-slate-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {filteredProjects.map(proj => (
                      <tr key={proj.Project_ID} className="hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-medium text-slate-100">{proj.Customer_Name}</p>
                          <p className="text-xs text-slate-500">{proj.Project_ID}</p>
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
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditModal('project', proj)}
                              className="text-blue-400 hover:text-blue-300"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete('project', proj.Project_ID)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
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
              <button
                onClick={() => openAddModal('quote')}
                className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 rounded-lg font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Quote
              </button>
            </div>

            {/* Quotes Table */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-700 bg-slate-800/50">
                    <tr>
                      <th className="px-6 py-3 text-left font-semibold text-slate-300">Customer</th>
                      <th className="px-6 py-3 text-left font-semibold text-slate-300">Squares</th>
                      <th className="px-6 py-3 text-left font-semibold text-slate-300">Total</th>
                      <th className="px-6 py-3 text-left font-semibold text-slate-300">Margin</th>
                      <th className="px-6 py-3 text-left font-semibold text-slate-300">Status</th>
                      <th className="px-6 py-3 text-left font-semibold text-slate-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {filteredQuotes.map(quote => (
                      <tr key={quote.Quote_ID} className="hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-100">{quote.Customer_Name}</td>
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
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditModal('quote', quote)}
                              className="text-blue-400 hover:text-blue-300"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete('quote', quote.Quote_ID)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
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

      {/* Modal */}
      {showAddModal && (
        <FormModal
          modalType={modalType}
          editingId={editingId}
          formData={formData}
          onFormDataChange={setFormData}
          onSave={handleSave}
          onCancel={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
