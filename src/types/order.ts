
export interface OrderFormData {
  customerName?: string;
  tableNumber?: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    notes?: string;
  }>;
  notes?: string;
}
