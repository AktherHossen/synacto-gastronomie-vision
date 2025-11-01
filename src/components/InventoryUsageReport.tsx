import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { getInventoryUsageReport, IngredientUsage } from '@/services/inventoryService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import AISummaryBox from './AISummaryBox';

interface InventoryUsageReportProps {
  startDate: Date;
  endDate: Date;
}

const InventoryUsageReport: React.FC<InventoryUsageReportProps> = ({ startDate, endDate }) => {
  const [reportData, setReportData] = useState<{usage: IngredientUsage[]}>({ usage: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getInventoryUsageReport(startDate, endDate);
        setReportData(data);
      } catch (err: any) {
        setError("Fehler beim Laden des Inventarverbrauchsberichts.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [startDate, endDate]);

  if (loading) {
    return (
      <Card>
        <CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Inventarverbrauchsbericht</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Zutat</TableHead>
                <TableHead className="text-right">Verbrauchte Menge</TableHead>
                <TableHead>Top-Menüartikel</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportData && reportData.usage.map((item) => (
                <TableRow key={item.ingredient_id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-right">{`${item.quantity_used.toFixed(2)} ${item.unit}`}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {item.menu_items.slice(0, 3).map(mi => (
                        <Badge key={mi.id} variant="secondary">{mi.name} ({mi.count})</Badge>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {reportData && (
        <AISummaryBox reportData={reportData.usage} reportType="inventory" />
      )}
    </div>
  );
};

export default InventoryUsageReport; 