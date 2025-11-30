// CSV parsing and data utilities

export const parseCSV = (text) => {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const rows = lines.slice(1).filter(line => line.trim());

  return rows.map(line => {
    const values = line.split(',').map(v => v.trim());
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = values[index] || '';
    });
    return obj;
  });
};

export const loadCSVFile = async (filename) => {
  try {
    const response = await fetch(`/data/${filename}`);
    const text = await response.text();
    return parseCSV(text);
  } catch (error) {
    console.error(`Error loading ${filename}:`, error);
    return [];
  }
};

export const calculateMetrics = (quotes, projects) => {
  const totalQuotes = quotes.length;
  const acceptedQuotes = quotes.filter(q => q.Status === 'ACCEPTED').length;
  const totalRevenue = quotes.reduce((sum, q) => sum + (parseFloat(q.Total_Quote) || 0), 0);
  const totalMaterial = quotes.reduce((sum, q) => sum + (parseFloat(q.Material_Cost) || 0), 0);
  const avgProfitMargin = quotes.length > 0
    ? (quotes.reduce((sum, q) => sum + (parseFloat(q.Profit_Margin_Percent) || 0), 0) / quotes.length)
    : 0;

  const conversionRate = totalQuotes > 0 ? ((acceptedQuotes / totalQuotes) * 100).toFixed(1) : 0;

  return {
    totalQuotes,
    acceptedQuotes,
    conversionRate,
    totalRevenue,
    totalMaterial,
    avgProfitMargin: avgProfitMargin.toFixed(1),
    openProjects: projects.filter(p => p.Status !== 'COMPLETED').length,
    completedProjects: projects.filter(p => p.Status === 'COMPLETED').length,
  };
};
