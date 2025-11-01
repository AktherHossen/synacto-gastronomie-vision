import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { Plus, RefreshCw } from 'lucide-react';
import OrdersList from '@/components/OrdersList';
import OrderForm from '@/components/OrderForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { deductIngredientsForOrder } from '@/lib/deductIngredientsForOrder';
import { 
  createOrder, 
  getOrders, 
  updateOrderStatus, 
  deleteOrder,
  type Order as ServiceOrder,
  type OrderInput
} from '@/services/ordersService';
import { getMenuItem } from '@/services/menuService';

type OrderFormData = Omit<OrderInput, 'total_amount' | 'status' | 'id' | 'order_number' | 'items'> & {
  items: {
    menu_item_id: number;
    quantity: number;
    notes?: string;
  }[];
};

const Orders = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<ServiceOrder | null>(null);

  const loadOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const ordersData = await getOrders();
      setOrders(ordersData);
    } catch (error) {
      console.error('Failed to load orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to load orders. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const calculateOrderTotal = async (items: OrderFormData['items']) => {
    let total = 0;
    for (const item of items) {
      try {
        const menuItem = await getMenuItem(item.menu_item_id);
        if (menuItem) {
          total += menuItem.price * item.quantity;
        }
      } catch (error) {
        console.error(`Could not fetch price for item ${item.menu_item_id}`, error);
      }
    }
    return total;
  };

  const handleCreateOrder = async (data: OrderFormData) => {
    try {
      const total_amount = await calculateOrderTotal(data.items);

      const orderInput: OrderInput = {
        ...data,
        order_number: `ORD-${Date.now()}`,
        items: data.items.map(item => ({ ...item, menu_item_id: String(item.menu_item_id) })),
        total_amount,
        status: 'pending',
      };

      const newOrder = await createOrder(orderInput);

      for (const item of data.items) {
        await deductIngredientsForOrder(String(item.menu_item_id), item.quantity);
      }

      toast({
        title: t('orders.createSuccessTitle'),
        description: t('orders.createSuccessDescription', { orderId: newOrder.id }),
      });
      
      setShowForm(false);
      loadOrders();
    } catch (error) {
      console.error('Failed to create order:', error);
      toast({
        title: t('orders.createErrorTitle'),
        description: t('orders.createErrorDescription'),
        variant: 'destructive',
      });
    }
  };
  
  const handleUpdateOrder = async (data: OrderFormData) => {
    if (!editingOrder) return;
    // Proper update logic will be more complex
    console.log("Update functionality to be implemented", data);
    setShowForm(false);
  };

  const handleStatusChange = async (id: string, newStatus: ServiceOrder['status']) => {
    try {
      await updateOrderStatus(id, newStatus);
      toast({
        title: t('orders.statusUpdateSuccessTitle'),
        description: t('orders.statusUpdateSuccessDescription'),
      });
      loadOrders();
    } catch (error) {
      console.error('Failed to update order status:', error);
      toast({
        title: t('orders.statusUpdateErrorTitle'),
        description: t('orders.statusUpdateErrorDescription'),
        variant: 'destructive',
      });
    }
  };

  const handleDeleteOrder = async (id: string) => {
    try {
      await deleteOrder(id);
      toast({
        title: t('orders.deleteSuccessTitle'),
        description: t('orders.deleteSuccessDescription'),
      });
      loadOrders();
    } catch (error) {
      console.error('Failed to delete order:', error);
      toast({
        title: t('orders.deleteErrorTitle'),
        description: t('orders.deleteErrorDescription'),
        variant: 'destructive',
      });
    }
  };

  const openNewOrderForm = () => {
    setEditingOrder(null);
    setShowForm(true);
  };

  const openEditOrderForm = (order: ServiceOrder) => {
    setEditingOrder(order);
    setShowForm(true);
  };

  const getInitialData = (): Partial<OrderFormData> => {
    if (!editingOrder) {
      return { items: [] };
    }
    return {
      customer_name: editingOrder.customer_name || undefined,
      table_id: editingOrder.table_id || undefined,
      notes: editingOrder.notes || undefined,
      // The form expects number, but service gives string. This needs reconciliation.
      // For now, we'll have to assume it's not editable in this pass.
      items: (editingOrder.items as any[])?.map(item => ({
        ...item,
        menu_item_id: Number(item.menu_item_id)
      })) || [],
    };
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t('orders.title')}</h1>
        <div className="flex gap-2">
          <Button onClick={loadOrders} variant="outline" disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {t('common.refresh')}
          </Button>
          <Button onClick={openNewOrderForm}>
            <Plus className="mr-2 h-4 w-4" />
            {t('orders.newOrder')}
          </Button>
        </div>
      </div>

      <OrdersList
        orders={orders}
        isLoading={isLoading}
        onStatusChange={handleStatusChange}
        onDelete={handleDeleteOrder}
        onEdit={openEditOrderForm}
      />

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {editingOrder ? t('orders.editOrder') : t('orders.newOrder')}
            </DialogTitle>
          </DialogHeader>
          <OrderForm
            onSubmit={editingOrder ? handleUpdateOrder : handleCreateOrder}
            onCancel={() => setShowForm(false)}
            initialData={getInitialData()}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Orders;
