// Local storage utilities for persisting dashboard data

const STORAGE_KEYS = {
  LEADS: 'roofing_leads',
  PROJECTS: 'roofing_projects',
  QUOTES: 'roofing_quotes',
};

export const loadFromStorage = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error loading from storage (${key}):`, error);
    return [];
  }
};

export const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error saving to storage (${key}):`, error);
    return false;
  }
};

export const getLeads = () => loadFromStorage(STORAGE_KEYS.LEADS);
export const saveLeads = (leads) => saveToStorage(STORAGE_KEYS.LEADS, leads);

export const getProjects = () => loadFromStorage(STORAGE_KEYS.PROJECTS);
export const saveProjects = (projects) => saveToStorage(STORAGE_KEYS.PROJECTS, projects);

export const getQuotes = () => loadFromStorage(STORAGE_KEYS.QUOTES);
export const saveQuotes = (quotes) => saveToStorage(STORAGE_KEYS.QUOTES, quotes);

export const addQuote = (quote) => {
  const quotes = getQuotes();
  quotes.push(quote);
  return saveQuotes(quotes);
};

export const updateQuote = (quoteId, updates) => {
  const quotes = getQuotes();
  const index = quotes.findIndex(q => q.Quote_ID === quoteId);
  if (index !== -1) {
    quotes[index] = { ...quotes[index], ...updates };
    return saveQuotes(quotes);
  }
  return false;
};

export const deleteQuote = (quoteId) => {
  const quotes = getQuotes();
  const filtered = quotes.filter(q => q.Quote_ID !== quoteId);
  return saveQuotes(filtered);
};
