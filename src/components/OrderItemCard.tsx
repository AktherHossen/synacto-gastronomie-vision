
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Control } from 'react-hook-form';
import { X } from 'lucide-react';
import { OrderFormData } from '@/types/order';

interface OrderItemCardProps {
  control: Control<OrderFormData>;
  index: number;
  onRemove: () => void;
  canRemove: boolean;
}

const OrderItemCard: React.FC<OrderItemCardProps> = ({ control, index, onRemove, canRemove }) => {
  return (
    <Card className="p-4">
      <div className="flex justify-between items-start mb-4">
        <h4 className="font-medium">Item {index + 1}</h4>
        {canRemove && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRemove}
            className="text-red-600 hover:text-red-700"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-4">
          <FormField
            control={control}
            name={`items.${index}.name`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Item Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter item name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="col-span-2">
          <FormField
            control={control}
            name={`items.${index}.quantity`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="col-span-2">
          <FormField
            control={control}
            name={`items.${index}.price`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price (€)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="col-span-4">
          <FormField
            control={control}
            name={`items.${index}.notes`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Input placeholder="Special instructions" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </Card>
  );
};

export default OrderItemCard;
