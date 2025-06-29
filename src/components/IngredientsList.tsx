import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Package, Search, Edit, Trash2, Plus, AlertTriangle } from 'lucide-react';

interface Ingredient {
  id: number;
  name: string;
  unit: string;
  stock_quantity: number;
  expiry_date: string;
  cost_per_unit: number;
  created_at: string;
  updated_at: string | null;
}

const IngredientsList = () => {
  const { toast } = useToast();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'stock_quantity' | 'expiry_date'>('name');

  const fetchIngredients = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ingredients')
        .select('*')
        .order(sortBy, { ascending: true });

      if (error) {
        throw error;
      }

      setIngredients(data || []);
    } catch (error: any) {
      console.error('Error fetching ingredients:', error);
      toast({
        title: "Error",
        description: "Failed to load ingredients. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIngredients();
  }, [sortBy]);

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('ingredients')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: `Ingredient "${name}" has been deleted.`,
      });

      fetchIngredients(); // Refresh the list
    } catch (error: any) {
      console.error('Error deleting ingredient:', error);
      toast({
        title: "Error",
        description: "Failed to delete ingredient. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getExpiryStatus = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) {
      return { status: 'expired', color: 'bg-red-100 text-red-800', text: 'Expired' };
    } else if (daysUntilExpiry <= 7) {
      return { status: 'expiring', color: 'bg-orange-100 text-orange-800', text: 'Expiring Soon' };
    } else if (daysUntilExpiry <= 30) {
      return { status: 'warning', color: 'bg-yellow-100 text-yellow-800', text: 'Expiring Soon' };
    } else {
      return { status: 'good', color: 'bg-green-100 text-green-800', text: 'Good' };
    }
  };

  const getStockStatus = (quantity: number) => {
    if (quantity <= 0) {
      return { status: 'out', color: 'bg-red-100 text-red-800', text: 'Out of Stock' };
    } else if (quantity <= 5) {
      return { status: 'low', color: 'bg-orange-100 text-orange-800', text: 'Low Stock' };
    } else {
      return { status: 'good', color: 'bg-green-100 text-green-800', text: 'In Stock' };
    }
  };

  const filteredIngredients = ingredients.filter(ingredient =>
    ingredient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ingredients Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Loading ingredients...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Ingredients Inventory ({ingredients.length})
          </CardTitle>
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1 border rounded text-sm"
            >
              <option value="name">Sort by Name</option>
              <option value="stock_quantity">Sort by Stock</option>
              <option value="expiry_date">Sort by Expiry</option>
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search ingredients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {ingredients.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 text-lg">No ingredients found</p>
            <p className="text-gray-400 mt-2">Add your first ingredient to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredIngredients.map((ingredient) => {
              const expiryStatus = getExpiryStatus(ingredient.expiry_date);
              const stockStatus = getStockStatus(ingredient.stock_quantity);
              
              return (
                <Card key={ingredient.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{ingredient.name}</h3>
                          <Badge variant="outline" className="text-xs">
                            {ingredient.unit}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Stock:</span>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{ingredient.stock_quantity}</span>
                              <Badge className={stockStatus.color}>
                                {stockStatus.text}
                              </Badge>
                            </div>
                          </div>
                          
                          <div>
                            <span className="text-gray-600">Cost:</span>
                            <div className="font-medium">€{ingredient.cost_per_unit.toFixed(2)}</div>
                          </div>
                          
                          <div>
                            <span className="text-gray-600">Expires:</span>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{formatDate(ingredient.expiry_date)}</span>
                              <Badge className={expiryStatus.color}>
                                {expiryStatus.text}
                              </Badge>
                            </div>
                          </div>
                          
                          <div>
                            <span className="text-gray-600">Total Value:</span>
                            <div className="font-medium">
                              €{(ingredient.stock_quantity * ingredient.cost_per_unit).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // TODO: Implement edit functionality
                            toast({
                              title: "Coming Soon",
                              description: "Edit functionality will be available soon.",
                            });
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(ingredient.id, ingredient.name)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IngredientsList; 