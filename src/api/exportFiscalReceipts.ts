import { exportFiscalReceipts } from '../exportFiscalReceipts';
import type { Request, Response } from 'express';

export default async function handler(req: Request, res: Response) {
  const { startDate, endDate, paymentMethod, format = 'json' } = req.query;
  try {
    const exported = await exportFiscalReceipts({
      format: format as 'csv' | 'json',
      startDate: startDate as string,
      endDate: endDate as string,
      paymentMethod: paymentMethod as string,
    });
    res.setHeader('Content-Disposition', `attachment; filename=fiscal-receipts.${format === 'csv' ? 'csv' : 'json'}`);
    res.setHeader('Content-Type', format === 'csv' ? 'text/csv' : 'application/json');
    res.status(200).send(exported);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
} 