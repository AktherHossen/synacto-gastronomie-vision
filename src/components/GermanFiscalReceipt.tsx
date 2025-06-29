
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Printer, Download } from 'lucide-react';
import { FiscalReceipt } from '@/services/germanCompliance';

interface GermanFiscalReceiptProps {
  receipt: FiscalReceipt;
  onPrint?: () => void;
  onDownload?: () => void;
}

const GermanFiscalReceipt: React.FC<GermanFiscalReceiptProps> = ({ 
  receipt, 
  onPrint, 
  onDownload 
}) => {
  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center border-b">
        <CardTitle className="text-lg">Kassenbeleg</CardTitle>
        <div className="text-sm text-gray-600">
          <p>Synacto GmbH</p>
          <p>Musterstraße 123</p>
          <p>10115 Berlin</p>
          <p>USt-IdNr: DE123456789</p>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 font-mono text-sm">
        <div className="space-y-2 mb-4">
          <div className="flex justify-between">
            <span>Beleg-Nr:</span>
            <span>{receipt.receiptNumber}</span>
          </div>
          <div className="flex justify-between">
            <span>Datum/Zeit:</span>
            <span>{formatDateTime(receipt.timestamp)}</span>
          </div>
          <div className="flex justify-between">
            <span>Kassierer:</span>
            <span>{receipt.cashierName || 'System'}</span>
          </div>
        </div>

        <div className="border-t border-b py-2 mb-4">
          <div className="font-bold mb-2">ARTIKEL</div>
          {receipt.items.map((item, index) => (
            <div key={index} className="mb-3">
              <div className="flex justify-between">
                <span className="truncate">{item.name}</span>
                <span>{formatCurrency(item.totalGross)}</span>
              </div>
              <div className="text-xs text-gray-600 flex justify-between">
                <span>{item.quantity}x {formatCurrency(item.unitPrice)}</span>
                <span>MwSt {(item.vatRate * 100).toFixed(0)}%</span>
              </div>
              <div className="text-xs text-gray-600 flex justify-between">
                <span>Netto: {formatCurrency(item.totalNet)}</span>
                <span>MwSt: {formatCurrency(item.totalVat)}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-1 mb-4">
          <div className="flex justify-between font-bold">
            <span>SUMME BRUTTO:</span>
            <span>{formatCurrency(receipt.totalGross)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>davon Netto:</span>
            <span>{formatCurrency(receipt.subtotalNet)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>davon MwSt:</span>
            <span>{formatCurrency(receipt.totalVat)}</span>
          </div>
        </div>

        <div className="border-t pt-2 text-xs text-gray-600">
          <div className="mb-2">
            <div className="font-bold">TSE-DATEN:</div>
            <div>Seriennummer: {receipt.fiscalMemorySerial}</div>
            <div>Transaktion: {receipt.transactionId}</div>
            <div>Signatur: {receipt.tseSignature.substring(0, 16)}...</div>
          </div>
          
          <div className="text-center mt-4 pt-2 border-t">
            <p>Vielen Dank für Ihren Besuch!</p>
            <p className="mt-2">Kassenbeleg - Bitte aufbewahren</p>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          {onPrint && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onPrint}
              className="flex-1"
            >
              <Printer className="w-4 h-4 mr-1" />
              Drucken
            </Button>
          )}
          {onDownload && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onDownload}
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-1" />
              Download
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GermanFiscalReceipt;
