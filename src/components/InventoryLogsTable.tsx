import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface InventoryLog {
  id: number;
  created_at: string;
  change_type: string;
  quantity: number;
  note: string | null;
}

interface InventoryLogsTableProps {
  ingredientId: number;
}

const typeColor: Record<string, string> = {
  add: "text-green-600",
  deduct: "text-red-600",
  spoil: "text-orange-500",
};

const InventoryLogsTable: React.FC<InventoryLogsTableProps> = ({ ingredientId }) => {
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [changeType, setChangeType] = useState<string>('');

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("inventory_logs")
        .select("id, created_at, change_type, quantity, note")
        .eq("ingredient_id", ingredientId)
        .order("created_at", { ascending: false });
      if (!error && data) setLogs(data);
      setLoading(false);
    };
    fetchLogs();
  }, [ingredientId]);

  const exportLogs = async (format: 'csv' | 'json') => {
    const { exportInventoryLogs } = await import('../exportInventoryLogs');
    const exported = await exportInventoryLogs({
      format,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      changeType: changeType || undefined,
    });
    const blob = new Blob([exported], { type: format === 'csv' ? 'text/csv' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-logs${format === 'csv' ? '.csv' : '.json'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="overflow-x-auto mt-6">
      <h2 className="text-lg font-semibold mb-2">Inventory Change Log</h2>
      <div className="flex gap-2 mb-2">
        <input
          type="date"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
          className="border rounded px-2 py-1"
          placeholder="Start Date"
        />
        <input
          type="date"
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
          className="border rounded px-2 py-1"
          placeholder="End Date"
        />
        <select
          value={changeType}
          onChange={e => setChangeType(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="">All Types</option>
          <option value="add">Add</option>
          <option value="deduct">Deduct</option>
          <option value="spoil">Spoil</option>
        </select>
        <button
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => exportLogs('csv')}
        >
          Export CSV
        </button>
        <button
          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
          onClick={() => exportLogs('json')}
        >
          Export JSON
        </button>
      </div>
      <table className="min-w-full bg-white border rounded shadow">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="py-2 px-3 border-b">Date</th>
            <th className="py-2 px-3 border-b">Type</th>
            <th className="py-2 px-3 border-b">Quantity</th>
            <th className="py-2 px-3 border-b">Note</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={4} className="py-4 text-center text-gray-500">
                Loading...
              </td>
            </tr>
          ) : logs.length === 0 ? (
            <tr>
              <td colSpan={4} className="py-4 text-center text-gray-400">
                No logs found for this ingredient.
              </td>
            </tr>
          ) : (
            logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="py-2 px-3 border-b">
                  {new Date(log.created_at).toLocaleString()}
                </td>
                <td className={`py-2 px-3 border-b font-semibold ${typeColor[log.change_type] || "text-gray-700"}`}>
                  {log.change_type.charAt(0).toUpperCase() + log.change_type.slice(1)}
                </td>
                <td className="py-2 px-3 border-b">{log.quantity}</td>
                <td className="py-2 px-3 border-b">{log.note || <span className="text-gray-300">—</span>}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryLogsTable; 