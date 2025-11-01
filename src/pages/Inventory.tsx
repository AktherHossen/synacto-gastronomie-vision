import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Package, RefreshCw } from 'lucide-react';
import IngredientForm from '@/components/IngredientForm';
import IngredientsList from '@/components/IngredientsList';

const Inventory = () => {
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleIngredientAdded = () => {
    setRefreshKey(prev => prev + 1);
    setShowForm(false);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory</h1>
          <p className="text-gray-600">Track your inventory and stock levels</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => setRefreshKey(prev => prev + 1)}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button 
            className="text-white" 
            style={{ backgroundColor: '#6B2CF5' }}
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? (
              <>
                <Package className="w-4 h-4 mr-2" />
                View Inventory
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Add Ingredient
              </>
            )}
          </Button>
        </div>
      </div>

      {showForm ? (
        <div className="space-y-6">
          <IngredientForm onSuccess={handleIngredientAdded} />
          <div className="text-center">
            <Button 
              variant="outline"
              onClick={() => setShowForm(false)}
            >
               Back
            </Button>
          </div>
        </div>
      ) : (
        <IngredientsList key={refreshKey} />
      )}
    </div>
  );
};

export default Inventory;
