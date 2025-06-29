import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, ShoppingCart, Receipt } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import OrderCard, { Order } from '@/components/OrderCard';
import OrderForm from '@/components/OrderForm';
import GermanFiscalReceipt from '@/components/GermanFiscalReceipt';
import { germanCompliance, FiscalReceipt } from '@/services/germanCompliance';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Sample menu items for the POS-like interface
const menuItems = [
  { id: '1', name: 'Bruschetta', price: 8.50, category: 'appetizers' },
  { id: '2', name: 'Caprese Salad', price: 12.90, category: 'appetizers' },
  { id: '3', name: 'Antipasti Platter', price: 16.50, category: 'appetizers' },
  { id: '4', name: 'Beef Fillet', price: 28.50, category: 'main-courses' },
  { id: '5', name: 'Grilled Salmon', price: 22.90, category: 'main-courses' },
  { id: '6', name: 'Pasta Carbonara', price: 14.50, category: 'main-courses' },
  { id: '7', name: 'Pizza Margherita', price: 11.90, category: 'main-courses' },
  { id: '8', name: 'Wiener Schnitzel', price: 18.90, category: 'main-courses' },
  { id: '9', name: 'Kölsch 0.2l', price: 2.80, category: 'drinks' },
  { id: '10', name: 'White Wine 0.2l', price: 6.50, category: 'drinks' },
  { id: '11', name: 'Mineral Water 0.5l', price: 3.20, category: 'drinks' },
  { id: '12', name: 'Espresso', price: 2.90, category: 'drinks' },
  { id: '13', name: 'Tiramisu', price: 7.50, category: 'desserts' },
  { id: '14', name: 'Panna Cotta', price: 6.90, category: 'desserts' },
  { id: '15', name: 'Gelato (3 scoops)', price: 5.50, category: 'desserts' },
];

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
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentOrder, setCurrentOrder] = useState<any[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [currentReceipt, setCurrentReceipt] = useState<FiscalReceipt | null>(null);

  const categories = [
    { key: 'all', count: menuItems.length },
    { key: 'appetizers', count: menuItems.filter(item => item.category === 'appetizers').length },
    { key: 'main-courses', count: menuItems.filter(item => item.category === 'main-courses').length },
    { key: 'drinks', count: menuItems.filter(item => item.category === 'drinks').length },
    { key: 'desserts', count: menuItems.filter(item => item.category === 'desserts').length },
  ];

  const filteredMenuItems = selectedCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  const addToOrder = (menuItem: any) => {
    const existingItem = currentOrder.find(item => item.id === menuItem.id);
    if (existingItem) {
      setCurrentOrder(currentOrder.map(item => 
        item.id === menuItem.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCurrentOrder([...currentOrder, { ...menuItem, quantity: 1 }]);
    }
  };

  const updateOrderQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCurrentOrder(currentOrder.filter(item => item.id !== id));
    } else {
      setCurrentOrder(currentOrder.map(item => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const getOrderTotal = () => {
    return currentOrder.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCreateOrder = () => {
    if (currentOrder.length === 0) {
      toast({
        title: "Error",
        description: "Please add items to your order",
        variant: "destructive",
      });
      return;
    }

    // Create fiscal receipt for German compliance
    const orderData = {
      customerName,
      tableNumber,
      items: currentOrder.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        category: item.category || 'food'
      })),
      cashierName: 'Kassierer'
    };

    const fiscalReceipt = germanCompliance.createFiscalReceipt(orderData);

    const newOrder: Order = {
      id: Date.now().toString(),
      orderNumber: String(orders.length + 1).padStart(3, '0'),
      customerName,
      tableNumber,
      items: currentOrder.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      totalAmount: getOrderTotal(),
      status: 'pending',
      createdAt: new Date(),
    };

    setOrders([newOrder, ...orders]);
    setCurrentOrder([]);
    setCustomerName('');
    setTableNumber('');
    
    // Show fiscal receipt
    setCurrentReceipt(fiscalReceipt);
    setShowReceipt(true);
    
    toast({
      title: 'Bestellung erstellt',
      description: `Bestellung #${newOrder.orderNumber} wurde erfolgreich erstellt. Kassenbeleg generiert.`,
    });
  };

  const handleUpdateOrder = (data: any) => {
    if (!editingOrder) return;
    
    const updatedOrder: Order = {
      ...editingOrder,
      customerName: data.customerName || '',
      tableNumber: data.tableNumber || '',
      items: data.items,
      totalAmount: data.items.reduce((total: number, item: any) => total + (item.quantity * item.price), 0),
      notes: data.notes,
    };

    setOrders(orders.map(order => 
      order.id === editingOrder.id ? updatedOrder : order
    ));
    
    toast({
      title: t('messages.orderUpdated'),
      description: `Order #${updatedOrder.orderNumber} has been updated successfully.`,
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

  const handleDeleteOrder = (id: string) => {
    const orderToDelete = orders.find(order => order.id === id);
    setOrders(orders.filter(order => order.id !== id));
    toast({
      title: t('messages.orderDeleted'),
      description: `Order #${orderToDelete?.orderNumber} has been deleted.`,
      variant: "destructive",
    });
  };

  if (showForm) {
    return (
      <div className="p-6">
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
    );
  }

  return (
    <div className="h-full bg-gray-50">
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-screen">
          {/* Product Catalog */}
          <div className="lg:col-span-2 bg-white rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Produktkatalog</h2>
            
            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              {categories.map((category) => (
                <Button
                  key={category.key}
                  variant={selectedCategory === category.key ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.key)}
                  className={selectedCategory === category.key ? "text-white" : ""}
                  style={selectedCategory === category.key ? { backgroundColor: '#6B2CF5' } : {}}
                >
                  {category.key === 'all' ? 'Alle' : 
                   category.key === 'appetizers' ? 'Vorspeisen' :
                   category.key === 'main-courses' ? 'Hauptgerichte' :
                   category.key === 'drinks' ? 'Getränke' : 'Desserts'} {category.count}
                </Button>
              ))}
            </div>

            {/* Menu Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {filteredMenuItems.map((item) => (
                <Card key={item.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-sm">{item.name}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {item.category === 'appetizers' ? 'Vorspeisen' :
                         item.category === 'main-courses' ? 'Hauptgerichte' :
                         item.category === 'drinks' ? 'Getränke' : 'Desserts'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg">€{item.price.toFixed(2)}</span>
                      <Button 
                        size="sm" 
                        onClick={() => addToOrder(item)}
                        className="text-white"
                        style={{ backgroundColor: '#6B2CF5' }}
                      >
                        Hinzufügen
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Order Panel */}
          <div className="bg-white rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingCart className="w-6 h-6" />
              <h2 className="text-xl font-bold">Bestellung</h2>
            </div>

            {/* Customer Info */}
            <div className="mb-4 space-y-2">
              <input
                type="text"
                placeholder="Kundenname"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                placeholder="Tischnummer"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>

            {/* Current Order Items */}
            <div className="flex-1 max-h-64 overflow-y-auto mb-4">
              {currentOrder.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Keine Artikel im Warenkorb</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {currentOrder.map((item) => (
                    <Card key={item.id} className="p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{item.name}</h4>
                          <p className="text-sm text-gray-600">€{item.price.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateOrderQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 p-0"
                          >
                            -
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateOrderQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 p-0"
                          >
                            +
                          </Button>
                        </div>
                        <span className="font-bold">€{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Total and Create Order */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xl font-bold">Gesamt:</span>
                <span className="text-2xl font-bold" style={{ color: '#6B2CF5' }}>€{getOrderTotal().toFixed(2)}</span>
              </div>
              <Button 
                onClick={handleCreateOrder}
                className="w-full text-white mb-4"
                style={{ backgroundColor: '#6B2CF5' }}
                disabled={currentOrder.length === 0}
              >
                <Receipt className="w-4 h-4 mr-2" />
                Bestellung erstellen & Beleg drucken
              </Button>
            </div>

            {/* Recent Orders */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Aktuelle Bestellungen</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {orders.slice(0, 3).map((order) => (
                  <div key={order.id} className="p-2 border rounded text-sm">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">#{order.orderNumber}</span>
                      <Badge className={
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'ready' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }>
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-gray-600">€{order.totalAmount.toFixed(2)}</p>
                    <div className="flex gap-1 mt-1">
                      {order.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(order.id, 'preparing')}
                          className="text-xs h-6"
                        >
                          Start
                        </Button>
                      )}
                      {order.status === 'preparing' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(order.id, 'ready')}
                          className="text-xs h-6"
                        >
                          Fertig
                        </Button>
                      )}
                      {order.status === 'ready' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(order.id, 'completed')}
                          className="text-xs h-6"
                        >
                          Abgeholt
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* German Fiscal Receipt Dialog */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Kassenbeleg - Deutsche Compliance</DialogTitle>
          </DialogHeader>
          {currentReceipt && (
            <GermanFiscalReceipt
              receipt={currentReceipt}
              onPrint={() => {
                window.print();
                setShowReceipt(false);
              }}
              onDownload={() => {
                const blob = new Blob([JSON.stringify(currentReceipt, null, 2)], 
                  { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `kassenbeleg-${currentReceipt.receiptNumber}.json`;
                a.click();
                URL.revokeObjectURL(url);
                setShowReceipt(false);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Orders;
