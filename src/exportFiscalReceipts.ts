import { supabase } from './integrations/supabase/client';

interface ExportFiscalReceiptsOptions {
  format?: 'csv' | 'json';
  startDate?: string; // ISO string
  endDate?: string;   // ISO string
  paymentMethod?: string;
  fields?: string[];
}

async function fetchFiscalReceipts({ startDate, endDate, paymentMethod }: ExportFiscalReceiptsOptions = {}) {
  let query = supabase.from('fiscal_receipts').select('*');
  if (startDate) query = query.gte('timestamp', startDate);
  if (endDate) query = query.lte('timestamp', endDate);
  if (paymentMethod) query = query.eq('payment_method', paymentMethod);
  query = query.order('timestamp', { ascending: true });
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

function toCSV(receipts: any[], fields?: string[]) {
  if (!receipts.length) return '';
  const header = fields || Object.keys(receipts[0]);
  const rows = receipts.map(r => header.map(key => '"' + String(r[key] ?? '').replace(/"/g, '""') + '"').join(','));
  return [header.join(','), ...rows].join('\n');
}

export async function exportFiscalReceipts(options: ExportFiscalReceiptsOptions = {}) {
  const receipts = await fetchFiscalReceipts(options);
  const { format = 'json', fields } = options;
  if (format === 'csv') {
    return toCSV(receipts, fields);
  }
  // Ensure ISO 8601 for timestamp
  const receiptsISO = receipts.map(r => ({ ...r, timestamp: new Date(r.timestamp).toISOString() }));
  return JSON.stringify(fields ? receiptsISO.map(r => Object.fromEntries(fields.map(f => [f, r[f]]))) : receiptsISO, null, 2);
}

// Example usage (uncomment to run as a script):
// (async () => {
//   const csv = await exportFiscalReceipts('csv');
//   console.log(csv);
// })(); 