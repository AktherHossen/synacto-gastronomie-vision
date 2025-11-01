import React, { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getTables, Table } from '@/services/tableService';

interface CustomerInfoFieldsProps {
  form: UseFormReturn<any>;
}

const CustomerInfoFields: React.FC<CustomerInfoFieldsProps> = ({ form }) => {
  const [availableTables, setAvailableTables] = useState<Table[]>([]);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const allTables = await getTables();
        setAvailableTables(allTables.filter(t => t.status === 'Available' || form.getValues('tableId') === t.id));
      } catch (error) {
        console.error("Failed to fetch tables:", error);
      }
    };
    fetchTables();
  }, [form]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={form.control}
        name="customerName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Customer Name</FormLabel>
            <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="tableId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Table</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl><SelectTrigger><SelectValue placeholder="Select a table" /></SelectTrigger></FormControl>
              <SelectContent>
                {availableTables.map(table => (
                  <SelectItem key={table.id} value={table.id}>
                    {table.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />
    </div>
  );
};

export default CustomerInfoFields;
