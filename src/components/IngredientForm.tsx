import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Package, Save, X } from 'lucide-react';
import InventoryLogsTable from '@/components/InventoryLogsTable';

interface IngredientFormData {
  name: string;
  unit: string;
  stock_quantity: number;
  expiry_date: string;
  cost_per_unit: number;
}

interface IngredientFormProps {
  onSuccess?: () => void;
}

const units = [
  'kg', 'g', 'l', 'ml', 'pieces', 'boxes', 'bottles', 'cans', 'bags', 'packets'
];

const IngredientForm = ({ onSuccess }: IngredientFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<IngredientFormData>({
    name: '',
    unit: '',
    stock_quantity: 0,
    expiry_date: '',
    cost_per_unit: 0
  });

  const handleInputChange = (field: keyof IngredientFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      unit: '',
      stock_quantity: 0,
      expiry_date: '',
      cost_per_unit: 0
    });
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Ingredient name is required",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.unit) {
      toast({
        title: "Validation Error",
        description: "Please select a unit",
        variant: "destructive",
      });
      return false;
    }

    if (formData.stock_quantity <= 0) {
      toast({
        title: "Validation Error",
        description: "Stock quantity must be greater than 0",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.expiry_date) {
      toast({
        title: "Validation Error",
        description: "Expiry date is required",
        variant: "destructive",
      });
      return false;
    }

    if (formData.cost_per_unit < 0) {
      toast({
        title: "Validation Error",
        description: "Cost per unit cannot be negative",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      console.log('Attempting to insert ingredient:', formData);
      
      // First, let's test if we can connect to Supabase
      const { data: testData, error: testError } = await supabase
        .from('ingredients')
        .select('*')
        .limit(1);
      
      if (testError) {
        console.error('Database connection test failed:', testError);
        throw new Error(`Database connection failed: ${testError.message}`);
      }

      console.log('Database connection successful, proceeding with insert...');

      const { data, error } = await supabase
        .from('ingredients')
        .insert([{
          name: formData.name.trim(),
          unit: formData.unit,
          stock_quantity: formData.stock_quantity,
          expiry_date: formData.expiry_date,
          cost_per_unit: formData.cost_per_unit,
          created_at: new Date().toISOString()
        }])
        .select();

      if (error) {
        console.error('Supabase insert error:', error);
        throw error;
      }

      console.log('Ingredient added successfully:', data);

      toast({
        title: "Success!",
        description: `Ingredient "${formData.name}" has been added successfully.`,
      });

      resetForm();
      
      // Call the success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error adding ingredient:', error);
      
      // More detailed error handling
      let errorMessage = "Failed to add ingredient. Please try again.";
      
      if (error.message) {
        if (error.message.includes('relation "ingredients" does not exist')) {
          errorMessage = "The ingredients table doesn't exist. Please create it in your Supabase database.";
        } else if (error.message.includes('permission denied')) {
          errorMessage = "Permission denied. Please check your Supabase RLS policies.";
        } else if (error.message.includes('duplicate key')) {
          errorMessage = "An ingredient with this name already exists.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          Add New Ingredient
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Ingredient Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Ingredient Name *</Label>
            <Input
              id="name"
              type="text"
              placeholder="e.g., Tomatoes, Flour, Olive Oil"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
              className="w-full"
            />
          </div>

          {/* Unit Selection */}
          <div className="space-y-2">
            <Label htmlFor="unit">Unit *</Label>
            <Select
              value={formData.unit}
              onValueChange={(value) => handleInputChange('unit', value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a unit" />
              </SelectTrigger>
              <SelectContent>
                {units.map((unit) => (
                  <SelectItem key={unit} value={unit}>
                    {unit.charAt(0).toUpperCase() + unit.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Stock Quantity and Cost Per Unit */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock_quantity">Stock Quantity *</Label>
              <Input
                id="stock_quantity"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formData.stock_quantity}
                onChange={(e) => handleInputChange('stock_quantity', parseFloat(e.target.value) || 0)}
                required
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost_per_unit">Cost Per Unit (€)</Label>
              <Input
                id="cost_per_unit"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formData.cost_per_unit}
                onChange={(e) => handleInputChange('cost_per_unit', parseFloat(e.target.value) || 0)}
                className="w-full"
              />
            </div>
          </div>

          {/* Expiry Date */}
          <div className="space-y-2">
            <Label htmlFor="expiry_date">Expiry Date *</Label>
            <Input
              id="expiry_date"
              type="date"
              value={formData.expiry_date}
              onChange={(e) => handleInputChange('expiry_date', e.target.value)}
              required
              className="w-full"
            />
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 text-white"
              style={{ backgroundColor: '#6B2CF5' }}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Adding...
                </div>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Add Ingredient
                </>
              )}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={resetForm}
              disabled={isLoading}
              className="px-6"
            >
              <X className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </form>
        <InventoryLogsTable ingredientId={ingredient.id} />
      </CardContent>
    </Card>
  );
};

export default IngredientForm; 