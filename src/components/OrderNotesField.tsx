
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Control } from 'react-hook-form';
import { OrderFormData } from '@/types/order';

interface OrderNotesFieldProps {
  control: Control<OrderFormData>;
}

const OrderNotesField: React.FC<OrderNotesFieldProps> = ({ control }) => {
  return (
    <FormField
      control={control}
      name="notes"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Order Notes</FormLabel>
          <FormControl>
            <Textarea placeholder="Any special notes for this order" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default OrderNotesField;
