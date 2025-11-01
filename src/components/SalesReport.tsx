import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { getSalesReportData, SalesReportData } from '@/services/ordersService';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import AISummaryBox from './AISummaryBox';

interface SalesReportProps {
  startDate: Date;
  endDate: Date;
}

const SalesReport: React.FC<SalesReportProps> = ({ startDate, endDate }) => {
    const [reportData, setReportData] = useState<SalesReportData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        const fetchData = async () => {
          if (!startDate || !endDate) return;
          setLoading(true);
          try {
            const data = await getSalesReportData(startDate, endDate);
            setReportData(data);
          } catch (err: any) {
            setError('Failed to fetch report data.');
            toast({ title: "Error", description: err.message, variant: 'destructive'});
          } finally {
            setLoading(false);
          }
        };
        fetchData();
      }, [startDate, endDate]);

    const { totalRevenue = 0, totalOrders = 0, averageOrderValue = 0, totalItemsSold = 0 } = reportData || {};

    if (loading) {
        return <p>Loading...</p> // Replace with better skeleton
    }

    if (error) {
        return <p className="text-red-500">{error}</p>
    }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card><CardHeader><CardTitle>Gesamterlös</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">€{totalRevenue.toFixed(2)}</div></CardContent></Card>
            <Card><CardHeader><CardTitle>Bestellungen</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{totalOrders}</div></CardContent></Card>
            <Card><CardHeader><CardTitle>Ø Bestellwert</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">€{averageOrderValue.toFixed(2)}</div></CardContent></Card>
            <Card><CardHeader><CardTitle>Verkaufte Artikel</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{totalItemsSold}</div></CardContent></Card>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
            <Card>
                <CardHeader><CardTitle>Umsatz im Zeitverlauf</CardTitle></CardHeader>
                <CardContent className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={reportData?.revenuePerDay || []}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" tickFormatter={(str) => format(new Date(str), 'MMM d')} />
                            <YAxis tickFormatter={(val) => `€${val}`} />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="revenue" name="Umsatz" stroke="#8884d8" />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
          
        <div className="space-y-6">
            {/* This entire section is now replaced by AISummaryBox */}
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Tagesumsätze</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Datum</TableHead><TableHead className="text-right">Umsatz</TableHead></TableRow></TableHeader>
            <TableBody>
              {reportData?.revenuePerDay.map((day, index) => (
                <TableRow key={index}>
                  <TableCell>{format(new Date(day.date), 'PPP', { locale: de })}</TableCell>
                  <TableCell className="text-right">€{day.revenue.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {reportData && (
          <AISummaryBox reportData={reportData} reportType="sales" />
      )}
    </div>
  );
};

export default SalesReport; 