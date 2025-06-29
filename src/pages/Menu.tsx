import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Filter } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import MenuItemForm from '@/components/MenuItemForm';
import MenuItemCard, { MenuItem } from '@/components/MenuItemCard';
import { useToast } from '@/hooks/use-toast';

const Menu = () => {
  const { toast } = useToast();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    {
      id: '1',
      name: 'Margherita Pizza',
      description: 'Classic pizza with tomato sauce, mozzarella, and fresh basil',
      price: 12.50,
      category: 'main-courses',
      available: true,
    },
    {
      id: '2',
      name: 'Caesar Salad',
      description: 'Fresh romaine lettuce with Caesar dressing, croutons, and parmesan',
      price: 8.90,
      category: 'salads',
      available: true,
    },
    {
      id: '3',
      name: 'Tiramisu',
      description: 'Traditional Italian dessert with coffee and mascarpone',
      price: 6.50,
      category: 'desserts',
      available: false,
    },
    {
      id: '4',
      name: 'Coca Cola',
      description: 'Refreshing soft drink',
      price: 2.50,
      category: 'beverages',
      available: true,
    },
  ]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const handleAddItem = (data: any) => {
    const newItem: MenuItem = {
      id: Date.now().toString(),
      ...data,
    };
    setMenuItems([...menuItems, newItem]);
    setIsFormOpen(false);
    toast({
      title: 'Menu Item Added',
      description: `${data.name} has been added to the menu.`,
    });
  };

  const handleEditItem = (data: any) => {
    if (editingItem) {
      setMenuItems(menuItems.map(item => 
        item.id === editingItem.id ? { ...editingItem, ...data } : item
      ));
      setEditingItem(null);
      setIsFormOpen(false);
      toast({
        title: 'Menu Item Updated',
        description: `${data.name} has been updated.`,
      });
    }
  };

  const handleDeleteItem = (id: string) => {
    const item = menuItems.find(item => item.id === id);
    setMenuItems(menuItems.filter(item => item.id !== id));
    toast({
      title: 'Menu Item Deleted',
      description: `${item?.name} has been removed from the menu.`,
      variant: 'destructive',
    });
  };

  const openEditForm = (item: MenuItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingItem(null);
  };

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    'appetizers', 'main-courses', 'desserts', 'beverages', 'salads'
  ];

  const getStats = () => {
    const total = menuItems.length;
    const available = menuItems.filter(item => item.available).length;
    const avgPrice = menuItems.reduce((sum, item) => sum + item.price, 0) / total;
    return { total, available, avgPrice: avgPrice || 0 };
  };

  const stats = getStats();

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
          <p className="text-gray-600">Manage your restaurant menu items</p>
        </div>
        <Button 
          className="text-white" 
          style={{ backgroundColor: '#6B2CF5' }}
          onClick={() => setIsFormOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Menu Item
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Available Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.available}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Average Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{stats.avgPrice.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="w-full md:w-48">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Menu Items Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              onEdit={openEditForm}
              onDelete={handleDeleteItem}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500 text-lg">No menu items found</p>
            <p className="text-gray-400 mt-2">
              {searchTerm || categoryFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Add your first menu item to get started'
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={closeForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
            </DialogTitle>
          </DialogHeader>
          <MenuItemForm
            onSubmit={editingItem ? handleEditItem : handleAddItem}
            onCancel={closeForm}
            initialData={editingItem || undefined}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Menu;
