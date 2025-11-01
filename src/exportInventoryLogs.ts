import { supabase } from './integrations/supabase/client';

interface ExportInventoryLogsOptions {
  format?: 'csv' | 'json';
  startDate?: string; // ISO string
  endDate?: string;   // ISO string
  changeType?: string;
  fields?: string[];
}

async function fetchInventoryLogs({ startDate, endDate, changeType }: ExportInventoryLogsOptions = {}) {
  let query = supabase.from('inventory_logs').select('*');
  if (startDate) query = query.gte('created_at', startDate);
  if (endDate) query = query.lte('created_at', endDate);
  if (changeType) query = query.eq('change_type', changeType);
  query = query.order('created_at', { ascending: true });
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

function toCSV(logs: any[], fields?: string[]) {
  if (!logs.length) return '';
  const header = fields || Object.keys(logs[0]);
  const rows = logs.map(log => header.map(key => '"' + String(log[key] ?? '').replace(/"/g, '""') + '"').join(','));
  return [header.join(','), ...rows].join('\n');
}

export async function exportInventoryLogs(options: ExportInventoryLogsOptions = {}) {
  const logs = await fetchInventoryLogs(options);
  const { format = 'json', fields } = options;
  if (format === 'csv') {
    return toCSV(logs, fields);
  }
  // Ensure ISO 8601 for created_at
  const logsISO = logs.map(log => ({ ...log, created_at: new Date(log.created_at).toISOString() }));
  return JSON.stringify(fields ? logsISO.map(log => Object.fromEntries(fields.map(f => [f, log[f]]))) : logsISO, null, 2);
}

// Example usage (uncomment to run as a script):
// (async () => {
//   const csv = await exportInventoryLogs('csv');
//   console.log(csv);
// })(); 