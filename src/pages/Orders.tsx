
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import OrderCard, { Order } from '@/components/OrderCard';
import OrderForm from '@/components/OrderForm';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const Orders = () => {
  const { toast } = useToast();
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
      title: "Order Created",
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
      title: "Order Updated",
      description: `Order #${updatedOrder.orderNumber} has been updated successfully.`,
    });
  };

  const handleDeleteOrder = (id: string) => {
    const orderToDelete = orders.find(order => order.id === id);
    setOrders(orders.filter(order => order.id !== id));
    toast({
      title: "Order Deleted",
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
      title: "Order Status Updated",
      description: `Order #${order?.orderNumber} is now ${newStatus}.`,
    });
  };

  const handleViewOrder = (order: Order) => {
    // For now, just show order details in a toast
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

  const getStatusCount = (status: Order['status']) => 
    orders.filter(order => order.status === status).length;

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
              Back to Orders
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
              <p className="text-gray-600">Manage all your orders here</p>
            </div>
          </div>
          <Button 
            className="text-white" 
            style={{ backgroundColor: '#6B2CF5' }}
            onClick={() => setShowForm(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Order
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{getStatusCount('pending')}</p>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{getStatusCount('preparing')}</p>
                <p className="text-sm text-gray-600">Preparing</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{getStatusCount('ready')}</p>
                <p className="text-sm text-gray-600">Ready</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-600">{getStatusCount('completed')}</p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{getStatusCount('cancelled')}</p>
                <p className="text-sm text-gray-600">Cancelled</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search orders by number, customer name, or table..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="preparing">Preparing</SelectItem>
                    <SelectItem value="ready">Ready</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders Grid */}
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-500 text-lg">
                {searchTerm || statusFilter !== 'all' ? 'No orders match your search criteria' : 'No orders yet'}
              </p>
              <p className="text-gray-400 mt-2">
                {searchTerm || statusFilter !== 'all' ? 'Try adjusting your search or filter' : 'Create your first order to get started'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onView={handleViewOrder}
                onEdit={handleEditOrder}
                onDelete={handleDeleteOrder}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
