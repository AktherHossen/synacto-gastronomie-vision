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
// import { OrderFormData } from '@/types/order';

const orderItemSchema = z.object({
  menu_item_id: z.string().uuid(),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  notes: z.string().optional(),
});

const orderSchema = z.object({
  customerName: z.string().optional(),
  tableId: z.string().uuid().optional(),
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
    defaultValues: initialData || {
      items: [],
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
    // This needs to be updated to fetch prices based on menu_item_id
    return 0;
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <OrderFormHeader isEditing={!!initialData} />
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <CustomerInfoFields form={form} />
            <OrderItemsSection 
              form={form}
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
