
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, FileText, Shield, AlertTriangle } from 'lucide-react';
import { germanCompliance, FiscalReceipt } from '@/services/germanCompliance';

const GermanComplianceDashboard: React.FC = () => {
  const [receipts, setReceipts] = useState<FiscalReceipt[]>([]);
  const [dailyReport, setDailyReport] = useState<any>(null);

  useEffect(() => {
    const storedReceipts = germanCompliance.getStoredReceipts();
    setReceipts(storedReceipts);
    
    const today = new Date();
    const report = germanCompliance.generateDailyReport(today);
    setDailyReport(report);
  }, []);

  const exportDailyReport = () => {
    if (!dailyReport) return;
    
    const reportData = {
      date: new Date().toISOString().split('T')[0],
      ...dailyReport
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], 
      { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tagesbericht-${reportData.date}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">German Compliance Dashboard</h2>
        <Badge variant="outline" className="bg-green-50 text-green-700">
          <Shield className="w-4 h-4 mr-1" />
          TSE Aktiv
        </Badge>
      </div>

      {/* Compliance Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              TSE Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Shield className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-sm font-medium text-green-600">Aktiv</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Technische Sicherheitseinrichtung aktiv
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Kassenbeleg Archiv
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <FileText className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-lg font-bold">{receipts.length}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Belege gespeichert
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Tagesumsatz
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-purple-600 mr-2" />
              <span className="text-lg font-bold">
                {dailyReport ? `€${dailyReport.totalSales.toFixed(2)}` : '€0.00'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Heute ({dailyReport?.transactionCount || 0} Transaktionen)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Report */}
      {dailyReport && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Tagesbericht</CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={exportDailyReport}
              >
                <FileText className="w-4 h-4 mr-1" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Umsatzübersicht</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Bruttoumsatz:</span>
                    <span className="font-medium">€{dailyReport.totalSales.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gesamt MwSt:</span>
                    <span className="font-medium">€{dailyReport.totalVat.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transaktionen:</span>
                    <span className="font-medium">{dailyReport.transactionCount}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">MwSt-Aufschlüsselung</h4>
                <div className="space-y-2">
                  {Object.entries(dailyReport.vatBreakdown).map(([rate, amounts]: [string, any]) => (
                    <div key={rate} className="border rounded p-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{rate} MwSt</span>
                        <Badge variant="secondary">€{amounts.gross.toFixed(2)}</Badge>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Netto: €{amounts.net.toFixed(2)} | 
                        MwSt: €{amounts.vat.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Compliance Requirements */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Anforderungen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-green-50 rounded-lg">
              <Shield className="w-5 h-5 text-green-600 mr-3" />
              <div>
                <p className="font-medium text-green-800">TSE Integration</p>
                <p className="text-sm text-green-600">
                  Technische Sicherheitseinrichtung ist aktiv und signiert alle Transaktionen
                </p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-green-50 rounded-lg">
              <FileText className="w-5 h-5 text-green-600 mr-3" />
              <div>
                <p className="font-medium text-green-800">Belegausgabepflicht</p>
                <p className="text-sm text-green-600">
                  Alle Kassenbelege werden erstellt und gespeichert
                </p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-green-50 rounded-lg">
              <Calendar className="w-5 h-5 text-green-600 mr-3" />
              <div>
                <p className="font-medium text-green-800">Aufbewahrungspflicht</p>
                <p className="text-sm text-green-600">
                  Belege werden 10 Jahre digital archiviert
                </p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3" />
              <div>
                <p className="font-medium text-yellow-800">Hinweis</p>
                <p className="text-sm text-yellow-600">
                  Dies ist eine Demo-Implementation. Für den produktiven Einsatz benötigen Sie eine zertifizierte TSE.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GermanComplianceDashboard;
