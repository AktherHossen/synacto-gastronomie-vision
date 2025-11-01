import { addFiscalReceipt, getAllFiscalReceipts } from './fiscalReceiptsService';

export interface FiscalReceipt {
  id: string;
  receiptNumber: string;
  transactionId: string;
  timestamp: Date;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    vatRate: number;
    totalNet: number;
    totalVat: number;
    totalGross: number;
  }>;
  subtotalNet: number;
  totalVat: number;
  totalGross: number;
  paymentMethod: 'cash' | 'card' | 'other';
  tseSignature: string;
  fiscalMemorySerial: string;
  cashierName?: string;
  cancelled?: boolean;
}

export interface TSEData {
  serialNumber: string;
  transactionNumber: number;
  startTime: Date;
  finishTime: Date;
  signature: string;
}

class GermanComplianceService {
  private receiptCounter = 1;
  private transactionCounter = 1;
  private readonly fiscalMemorySerial = 'TSE-SIM-2024-001';
  private readonly vatRates = {
    standard: 0.19, // 19% standard VAT
    reduced: 0.07,  // 7% reduced VAT for food
    zero: 0.00      // 0% VAT
  };

  generateReceiptNumber(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const counter = String(this.receiptCounter++).padStart(6, '0');
    return `${year}${month}${day}-${counter}`;
  }

  generateTSESignature(): TSEData {
    const now = new Date();
    return {
      serialNumber: this.fiscalMemorySerial,
      transactionNumber: this.transactionCounter++,
      startTime: now,
      finishTime: new Date(now.getTime() + 1000), // 1 second later
      signature: this.generateMockSignature()
    };
  }

  private generateMockSignature(): string {
    // In real implementation, this would be a cryptographic signature from the TSE
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  calculateVAT(price: number, category: 'food' | 'beverage' | 'other' = 'food'): {
    net: number;
    vat: number;
    gross: number;
    vatRate: number;
  } {
    const vatRate = category === 'food' ? this.vatRates.reduced : this.vatRates.standard;
    const gross = price;
    const net = gross / (1 + vatRate);
    const vat = gross - net;
    
    return {
      net: Math.round(net * 100) / 100,
      vat: Math.round(vat * 100) / 100,
      gross: Math.round(gross * 100) / 100,
      vatRate
    };
  }

  async createFiscalReceipt(orderData: any): Promise<FiscalReceipt> {
    const tseData = this.generateTSESignature();
    const receiptNumber = this.generateReceiptNumber();
    const fiscalItems = orderData.items.map((item: any) => {
      const vatCalc = this.calculateVAT(item.price, item.category || 'food');
      const totalNet = vatCalc.net * item.quantity;
      const totalVat = vatCalc.vat * item.quantity;
      const totalGross = vatCalc.gross * item.quantity;
      return {
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
        vatRate: vatCalc.vatRate,
        totalNet: Math.round(totalNet * 100) / 100,
        totalVat: Math.round(totalVat * 100) / 100,
        totalGross: Math.round(totalGross * 100) / 100
      };
    });
    const subtotalNet = fiscalItems.reduce((sum, item) => sum + item.totalNet, 0);
    const totalVat = fiscalItems.reduce((sum, item) => sum + item.totalVat, 0);
    const totalGross = fiscalItems.reduce((sum, item) => sum + item.totalGross, 0);
    const receipt: FiscalReceipt = {
      id: `receipt-${Date.now()}`,
      receiptNumber,
      transactionId: `txn-${tseData.transactionNumber}`,
      timestamp: new Date(),
      items: fiscalItems,
      subtotalNet: Math.round(subtotalNet * 100) / 100,
      totalVat: Math.round(totalVat * 100) / 100,
      totalGross: Math.round(totalGross * 100) / 100,
      paymentMethod: 'cash',
      tseSignature: tseData.signature,
      fiscalMemorySerial: this.fiscalMemorySerial,
      cashierName: orderData.cashierName || 'System'
    };
    await this.storeReceipt(receipt);
    return receipt;
  }

  private async storeReceipt(receipt: FiscalReceipt): Promise<void> {
    // Store in Supabase
    await addFiscalReceipt({
      receipt_number: receipt.receiptNumber,
      transaction_id: receipt.transactionId,
      timestamp: receipt.timestamp.toISOString(),
      items: receipt.items,
      subtotal_net: receipt.subtotalNet,
      total_vat: receipt.totalVat,
      total_gross: receipt.totalGross,
      payment_method: receipt.paymentMethod,
      tse_signature: receipt.tseSignature,
      fiscal_memory_serial: receipt.fiscalMemorySerial,
      cashier_name: receipt.cashierName ?? null,
      cancelled: receipt.cancelled ?? false
    });
  }

  async getStoredReceipts(): Promise<FiscalReceipt[]> {
    // Fetch from Supabase
    const { data } = await getAllFiscalReceipts();
    if (!data) return [];
    return data.map(row => ({
      id: row.id,
      receiptNumber: row.receipt_number,
      transactionId: row.transaction_id,
      timestamp: new Date(row.timestamp),
      items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items,
      subtotalNet: row.subtotal_net,
      totalVat: row.total_vat,
      totalGross: row.total_gross,
      paymentMethod: row.payment_method as 'cash' | 'card' | 'other',
      tseSignature: row.tse_signature,
      fiscalMemorySerial: row.fiscal_memory_serial,
      cashierName: row.cashier_name ?? undefined,
      cancelled: row.cancelled ?? false
    }));
  }

  async generateDailyReport(date: Date): Promise<{
    totalSales: number;
    totalVat: number;
    transactionCount: number;
    vatBreakdown: Record<string, { net: number; vat: number; gross: number }>;
  }> {
    const receipts = await this.getStoredReceipts();
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);
    const dayReceipts = receipts.filter(receipt =>
      receipt.timestamp >= dayStart &&
      receipt.timestamp <= dayEnd &&
      !receipt.cancelled
    );
    const totalSales = dayReceipts.reduce((sum, receipt) => sum + receipt.totalGross, 0);
    const totalVat = dayReceipts.reduce((sum, receipt) => sum + receipt.totalVat, 0);
    const vatBreakdown: Record<string, { net: number; vat: number; gross: number }> = {};
    dayReceipts.forEach(receipt => {
      receipt.items.forEach(item => {
        const key = `${(item.vatRate * 100).toFixed(0)}%`;
        if (!vatBreakdown[key]) {
          vatBreakdown[key] = { net: 0, vat: 0, gross: 0 };
        }
        vatBreakdown[key].net += item.totalNet;
        vatBreakdown[key].vat += item.totalVat;
        vatBreakdown[key].gross += item.totalGross;
      });
    });
    return {
      totalSales: Math.round(totalSales * 100) / 100,
      totalVat: Math.round(totalVat * 100) / 100,
      transactionCount: dayReceipts.length,
      vatBreakdown
    };
  }
}

export const germanCompliance = new GermanComplianceService();
