import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { getStaffPerformanceReport, StaffPerformance } from '@/services/staffService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import AISummaryBox from './AISummaryBox';

interface StaffPerformanceReportProps {
  startDate: Date;
  endDate: Date;
}

const StaffPerformanceReport: React.FC<StaffPerformanceReportProps> = ({ startDate, endDate }) => {
  const [reportData, setReportData] = useState<StaffPerformance[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getStaffPerformanceReport(startDate, endDate);
        setReportData(data);
      } catch (err: any) {
        setError("Fehler beim Laden des Mitarbeiterleistungsberichts.");
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
          <CardTitle>Mitarbeiterleistungsbericht</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mitarbeiter</TableHead>
                <TableHead className="text-right">Bearbeitete Bestellungen</TableHead>
                <TableHead className="text-right">Gesamtumsatz</TableHead>
                <TableHead className="text-right">Ø Bestellwert</TableHead>
                <TableHead>Letzte Aktivität</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportData && reportData.map((staff) => (
                <TableRow key={staff.staff_id}>
                  <TableCell className="font-medium">{staff.staff_name}</TableCell>
                  <TableCell className="text-right">{staff.total_orders}</TableCell>
                  <TableCell className="text-right">€{staff.total_revenue.toFixed(2)}</TableCell>
                  <TableCell className="text-right">€{staff.average_order_value.toFixed(2)}</TableCell>
                  <TableCell>{formatDistanceToNow(new Date(staff.last_activity), { addSuffix: true, locale: de })}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {reportData && (
        <AISummaryBox reportData={reportData} reportType="staff" />
      )}
    </div>
  );
};

export default StaffPerformanceReport; 