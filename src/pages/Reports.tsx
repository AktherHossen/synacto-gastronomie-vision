import React, { useState } from 'react';
import { addDays, format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from '@/components/ui/use-toast';
import SalesReport from '@/components/SalesReport';
import InventoryUsageReport from '@/components/InventoryUsageReport';
import StaffPerformanceReport from '@/components/StaffPerformanceReport';

const ReportsPage = () => {
  const [date, setDate] = useState({ from: addDays(new Date(), -30), to: new Date() });

  const handleExport = () => { 
      toast({ title: "Export", description: "This feature is not yet fully implemented."});
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Berichte</h1>
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground">
            {format(date.from, "d. MMMM yyyy", { locale: de })} - {format(date.to, "d. MMMM yyyy", { locale: de })}
          </p>
          <Button variant="outline" onClick={handleExport}><Download className="w-4 h-4 mr-2" /> Exportieren</Button>
        </div>
      </div>

      <Tabs defaultValue="sales" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sales">Umsatz</TabsTrigger>
          <TabsTrigger value="inventory">Inventar</TabsTrigger>
          <TabsTrigger value="staff">Mitarbeiter</TabsTrigger>
        </TabsList>
        <TabsContent value="sales">
          <SalesReport startDate={date.from} endDate={date.to} />
        </TabsContent>
        <TabsContent value="inventory">
          <InventoryUsageReport startDate={date.from} endDate={date.to} />
        </TabsContent>
        <TabsContent value="staff">
          <StaffPerformanceReport startDate={date.from} endDate={date.to} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsPage;
