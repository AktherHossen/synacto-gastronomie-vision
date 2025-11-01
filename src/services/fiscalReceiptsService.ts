import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types-with-orders';

type FiscalReceiptRow = Database['public']['Tables']['fiscal_receipts']['Row'];
type FiscalReceiptInsert = Database['public']['Tables']['fiscal_receipts']['Insert'];

export async function addFiscalReceipt(receipt: FiscalReceiptInsert) {
  const { data, error } = await supabase
    .from('fiscal_receipts')
    .insert([receipt])
    .select()
    .single();
  return { data, error };
}

export async function getFiscalReceiptsByDate(date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  const { data, error } = await supabase
    .from('fiscal_receipts')
    .select('*')
    .gte('timestamp', start.toISOString())
    .lte('timestamp', end.toISOString())
    .order('timestamp', { ascending: true });
  return { data, error };
}

export async function getAllFiscalReceipts() {
  const { data, error } = await supabase
    .from('fiscal_receipts')
    .select('*')
    .order('timestamp', { ascending: false });
  return { data, error };
} 