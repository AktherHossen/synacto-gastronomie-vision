
import React from 'react';
import { Button } from '@/components/ui/button';
import { Control, FieldArrayWithId, UseFieldArrayAppend, UseFieldArrayRemove } from 'react-hook-form';
import { Plus } from 'lucide-react';
import OrderItemCard from './OrderItemCard';
import { OrderFormData } from '@/types/order';

interface OrderItemsSectionProps {
  control: Control<OrderFormData>;
  fields: FieldArrayWithId<OrderFormData, "items", "id">[];
  append: UseFieldArrayAppend<OrderFormData, "items">;
  remove: UseFieldArrayRemove;
}

const OrderItemsSection: React.FC<OrderItemsSectionProps> = ({ control, fields, append, remove }) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Order Items</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ name: '', quantity: 1, price: 0, notes: '' })}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </div>

      {fields.map((field, index) => (
        <OrderItemCard
          key={field.id}
          control={control}
          index={index}
          onRemove={() => remove(index)}
          canRemove={fields.length > 1}
        />
      ))}
    </div>
  );
};

export default OrderItemsSection;
