import React, { useState, useEffect } from 'react';
import { UseFormReturn, UseFieldArrayReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusCircle, XCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getMenuItems, MenuItem } from '@/services/menuService';

interface OrderItemsSectionProps {
  form: UseFormReturn<any>;
  fields: UseFieldArrayReturn<any>['fields'];
  append: UseFieldArrayReturn<any>['append'];
  remove: UseFieldArrayReturn<any>['remove'];
}

const OrderItemsSection: React.FC<OrderItemsSectionProps> = ({ form, fields, append, remove }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const items = await getMenuItems();
        setMenuItems(items);
      } catch (error) {
        console.error("Failed to fetch menu items:", error);
      }
    };
    fetchMenuItems();
  }, []);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Order Items</h3>
      {fields.map((field, index) => (
        <div key={field.id} className="grid grid-cols-12 gap-4 items-start">
          <FormField
            control={form.control}
            name={`items.${index}.menu_item_id`}
            render={({ field }) => (
              <FormItem className="col-span-5">
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select an item" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {menuItems.map(item => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`items.${index}.quantity`}
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`items.${index}.notes`}
            render={({ field }) => (
              <FormItem className="col-span-4">
                <FormControl><Input placeholder="Notes" {...field} /></FormControl>
              </FormItem>
            )}
          />
          <div className="col-span-1 flex items-center">
            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
              <XCircle className="h-5 w-5 text-red-500" />
            </Button>
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" onClick={() => append({ menu_item_id: '', quantity: 1, notes: '' })}>
        <PlusCircle className="mr-2 h-4 w-4" />
        Add Item
      </Button>
    </div>
  );
};

export default OrderItemsSection;
