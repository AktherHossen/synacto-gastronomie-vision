
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import OrderCard, { Order } from '@/components/OrderCard';
import OrderForm from '@/components/OrderForm';
import OrdersHeader from '@/components/OrdersHeader';
import OrdersStats from '@/components/OrdersStats';
import OrdersFilters from '@/components/OrdersFilters';
import OrdersList from '@/components/OrdersList';

const Orders = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([
    {
      id: '1',
      orderNumber: '001',
      customerName: 'John Doe',
      tableNumber: '5',
      items: [
        { id: '1', name: 'Margherita Pizza', quantity: 2, price: 12.50 },
        { id: '2', name: 'Caesar Salad', quantity: 1, price: 8.50 }
      ],
      totalAmount: 33.50,
      status: 'preparing',
      createdAt: new Date('2024-01-15T12:30:00'),
      notes: 'Extra cheese on pizza'
    },
    {
      id: '2',
      orderNumber: '002',
      customerName: 'Jane Smith',
      tableNumber: '3',
      items: [
        { id: '3', name: 'Chicken Burger', quantity: 1, price: 15.00 },
        { id: '4', name: 'French Fries', quantity: 1, price: 5.00 }
      ],
      totalAmount: 20.00,
      status: 'ready',
      createdAt: new Date('2024-01-15T13:15:00')
    },
    {
      id: '3',
      orderNumber: '003',
      items: [
        { id: '5', name: 'Coffee', quantity: 2, price: 3.50 },
        { id: '6', name: 'Croissant', quantity: 2, price: 4.00 }
      ],
      totalAmount: 15.00,
      status: 'pending',
      createdAt: new Date('2024-01-15T13:45:00')
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const handleCreateOrder = (data: any) => {
    const newOrder: Order = {
      id: Date.now().toString(),
      orderNumber: String(orders.length + 1).padStart(3, '0'),
      customerName: data.customerName,
      tableNumber: data.tableNumber,
      items: data.items,
      totalAmount: data.items.reduce((total: number, item: any) => total + (item.quantity * item.price), 0),
      status: 'pending',
      createdAt: new Date(),
      notes: data.notes
    };

    setOrders([newOrder, ...orders]);
    setShowForm(false);
    toast({
      title: t('messages.orderCreated'),
      description: `Order #${newOrder.orderNumber} has been created successfully.`,
    });
  };

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
    setShowForm(true);
  };

  const handleUpdateOrder = (data: any) => {
    if (!editingOrder) return;

    const updatedOrder: Order = {
      ...editingOrder,
      customerName: data.customerName,
      tableNumber: data.tableNumber,
      items: data.items,
      totalAmount: data.items.reduce((total: number, item: any) => total + (item.quantity * item.price), 0),
      notes: data.notes
    };

    setOrders(orders.map(order => order.id === editingOrder.id ? updatedOrder : order));
    setShowForm(false);
    setEditingOrder(null);
    toast({
      title: t('messages.orderUpdated'),
      description: `Order #${updatedOrder.orderNumber} has been updated successfully.`,
    });
  };

  const handleDeleteOrder = (id: string) => {
    const orderToDelete = orders.find(order => order.id === id);
    setOrders(orders.filter(order => order.id !== id));
    toast({
      title: t('messages.orderDeleted'),
      description: `Order #${orderToDelete?.orderNumber} has been deleted.`,
      variant: "destructive",
    });
  };

  const handleStatusChange = (id: string, newStatus: Order['status']) => {
    const updatedOrders = orders.map(order => 
      order.id === id ? { ...order, status: newStatus } : order
    );
    setOrders(updatedOrders);
    
    const order = orders.find(o => o.id === id);
    toast({
      title: t('messages.statusUpdated'),
      description: `Order #${order?.orderNumber} is now ${newStatus}.`,
    });
  };

  const handleViewOrder = (order: Order) => {
    toast({
      title: `Order #${order.orderNumber}`,
      description: `${order.items.length} items - €${order.totalAmount.toFixed(2)}`,
    });
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.tableNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (showForm) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-4 mb-6">
            <Button variant="outline" size="sm" onClick={() => {
              setShowForm(false);
              setEditingOrder(null);
            }}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('actions.back')} to Orders
            </Button>
          </div>
          
          <OrderForm
            onSubmit={editingOrder ? handleUpdateOrder : handleCreateOrder}
            onCancel={() => {
              setShowForm(false);
              setEditingOrder(null);
            }}
            initialData={editingOrder ? {
              customerName: editingOrder.customerName,
              tableNumber: editingOrder.tableNumber,
              items: editingOrder.items,
              notes: editingOrder.notes
            } : undefined}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <OrdersHeader onNewOrder={() => setShowForm(true)} />
        <OrdersStats orders={orders} />
        <OrdersFilters
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          onSearchChange={setSearchTerm}
          onStatusFilterChange={setStatusFilter}
        />
        <OrdersList
          filteredOrders={filteredOrders}
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          onView={handleViewOrder}
          onEdit={handleEditOrder}
          onDelete={handleDeleteOrder}
          onStatusChange={handleStatusChange}
        />
      </div>
    </div>
  );
};

export default Orders;
