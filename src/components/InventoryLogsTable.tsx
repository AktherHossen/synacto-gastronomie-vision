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

  return (
    <div className="overflow-x-auto mt-6">
      <h2 className="text-lg font-semibold mb-2">Inventory Change Log</h2>
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