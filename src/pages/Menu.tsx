import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Filter, RefreshCw, Loader2, Package } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import MenuItemModal from '@/components/MenuItemModal';
import MenuItemCard from '@/components/MenuItemCard';
import { useToast } from '@/hooks/use-toast';
import { 
  getMenuItems, 
  addMenuItem, 
  updateMenuItem, 
  deleteMenuItem,
  type MenuItem,
  type MenuItemFormData 
} from '@/services/menuService';

const Menu = () => {
  console.log('🎯 Menu component rendering...');
  
  const { toast } = useToast();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<MenuItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Load menu items from Supabase
  const loadMenuItems = useCallback(async (showLoading = true) => {
    console.log('🔄 loadMenuItems called with showLoading:', showLoading);
    try {
      if (showLoading) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }
      setError(null);
      
      console.log('🔄 Loading menu items from Supabase...');
      const items = await getMenuItems();
      console.log('✅ Menu items loaded:', items.length, 'items');
      console.log('📋 Items:', items);
      
      setMenuItems(items);
    } catch (error) {
      console.error('❌ Failed to load menu items:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load menu items';
      setError(errorMessage);
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [toast]);

  // Load menu items on component mount
  useEffect(() => {
    console.log('🎯 Menu component mounted, calling loadMenuItems...');
    loadMenuItems();
  }, [loadMenuItems]);

  const handleAddItem = async (data: MenuItemFormData) => {
    try {
      console.log('🔄 Adding menu item:', data);
      await addMenuItem(data);
      
      toast({
        title: 'Success!',
        description: `${data.name} has been added to the menu.`,
      });
      
      // Refresh the list
      await loadMenuItems(false);
    } catch (error) {
      console.error('❌ Failed to add menu item:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to add menu item';
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleEditItem = async (data: MenuItemFormData) => {
    if (!editingItem) return;
    
    try {
      console.log('🔄 Updating menu item:', editingItem.id, data);
      await updateMenuItem(editingItem.id, data);
      
      toast({
        title: 'Success!',
        description: `${data.name} has been updated.`,
      });
      
      // Refresh the list and close modal
      await loadMenuItems(false);
      setEditingItem(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error('❌ Failed to update menu item:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update menu item';
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteItem = async () => {
    if (!deleteItem) return;
    
    try {
      console.log('🔄 Deleting menu item:', deleteItem.id);
      await deleteMenuItem(deleteItem.id);
      
      toast({
        title: 'Success!',
        description: `${deleteItem.name} has been removed from the menu.`,
      });
      
      // Refresh the list and close dialog
      await loadMenuItems(false);
      setDeleteItem(null);
    } catch (error) {
      console.error('❌ Failed to delete menu item:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete menu item';
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    const item = menuItems.find(item => item.id === id);
    if (item) {
      setDeleteItem(item);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleRefresh = () => {
    loadMenuItems(false);
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
    const avgPrice = menuItems.length > 0 
      ? menuItems.reduce((sum, item) => sum + item.price, 0) / total 
      : 0;
    return { total, available, avgPrice };
  };

  const stats = getStats();

  console.log('🎯 Menu component state:', {
    isLoading,
    isRefreshing,
    error,
    menuItemsCount: menuItems.length,
    filteredItemsCount: filteredItems.length
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Menu</h1>
          <p className="text-gray-600">Manage your restaurant menu items</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            className="text-white" 
            style={{ backgroundColor: '#6B2CF5' }}
            onClick={openAddModal}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-700">
                <span className="text-sm font-medium">Error:</span>
                <span className="text-sm">{error}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => loadMenuItems()}
                className="text-red-700 border-red-300 hover:bg-red-100"
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
      {isLoading ? (
        <div className="text-center py-12">
          <Loader2 className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading menu items...</p>
        </div>
      ) : error ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-red-500 text-lg">Failed to load menu items</p>
            <p className="text-gray-400 mt-2">{error}</p>
            <Button 
              onClick={() => loadMenuItems()} 
              className="mt-4"
              variant="outline"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              onEdit={openEditModal}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <div className="mb-4">
              <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">No menu items yet</p>
              <p className="text-gray-400 mt-2">
                {searchTerm || categoryFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Get started by adding your first menu item'
                }
              </p>
            </div>
            {!searchTerm && categoryFilter === 'all' && (
              <Button 
                onClick={openAddModal} 
                className="mt-4"
                style={{ backgroundColor: '#6B2CF5' }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Item
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Modal */}
      <MenuItemModal
        open={isModalOpen}
        onOpenChange={closeModal}
        onSubmit={editingItem ? handleEditItem : handleAddItem}
        initialData={editingItem || undefined}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Menu Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteItem?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteItem}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Floating Action Button for Mobile */}
      <div className="fixed bottom-6 right-6 md:hidden">
        <Button
          size="lg"
          className="rounded-full w-14 h-14 shadow-lg text-white"
          style={{ backgroundColor: '#6B2CF5' }}
          onClick={openAddModal}
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
};

export default Menu;
