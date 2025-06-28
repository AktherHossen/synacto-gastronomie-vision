
import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import OrderFormHeader from './OrderFormHeader';
import CustomerInfoFields from './CustomerInfoFields';
import OrderItemsSection from './OrderItemsSection';
import OrderNotesField from './OrderNotesField';
import OrderTotalSection from './OrderTotalSection';
import OrderFormActions from './OrderFormActions';

const orderItemSchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  price: z.number().min(0, 'Price must be positive'),
  notes: z.string().optional(),
});

const orderSchema = z.object({
  customerName: z.string().optional(),
  tableNumber: z.string().optional(),
  items: z.array(orderItemSchema).min(1, 'At least one item is required'),
  notes: z.string().optional(),
});

type OrderFormData = z.infer<typeof orderSchema>;

interface OrderFormProps {
  onSubmit: (data: OrderFormData) => void;
  onCancel: () => void;
  initialData?: Partial<OrderFormData>;
}

const OrderForm: React.FC<OrderFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      customerName: initialData?.customerName || '',
      tableNumber: initialData?.tableNumber || '',
      items: initialData?.items || [{ name: '', quantity: 1, price: 0, notes: '' }],
      notes: initialData?.notes || '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const handleSubmit = (data: OrderFormData) => {
    onSubmit(data);
    form.reset();
  };

  const calculateTotal = () => {
    const items = form.watch('items');
    return items.reduce((total, item) => total + (item.quantity * item.price), 0);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <OrderFormHeader isEditing={!!initialData} />
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <CustomerInfoFields control={form.control} />
            <OrderItemsSection 
              control={form.control}
              fields={fields}
              append={append}
              remove={remove}
            />
            <OrderNotesField control={form.control} />
            <OrderTotalSection total={calculateTotal()} />
            <OrderFormActions onCancel={onCancel} isEditing={!!initialData} />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default OrderForm;
