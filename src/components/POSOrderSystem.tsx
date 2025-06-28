
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface POSMenuItem {
  id: string;
  name: string;
  price: number;
  category: 'appetizers' | 'main-courses' | 'drinks' | 'desserts';
}

export interface CartItem extends POSMenuItem {
  quantity: number;
  notes?: string;
}

interface POSOrderSystemProps {
  menuItems: POSMenuItem[];
  onCreateOrder: (orderData: any) => void;
}

const POSOrderSystem: React.FC<POSOrderSystemProps> = ({ menuItems, onCreateOrder }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState<'on-site' | 'delivery' | 'pickup'>('on-site');
  const [tableNumber, setTableNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

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

  const addToCart = (menuItem: POSMenuItem) => {
    const existingItem = cart.find(item => item.id === menuItem.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === menuItem.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...menuItem, quantity: 1 }]);
    }
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(cart.filter(item => item.id !== id));
    } else {
      setCart(cart.map(item => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const getTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const tableNumbers = Array.from({ length: 10 }, (_, i) => i + 1);

  const handleCreateOrder = () => {
    if (cart.length === 0) {
      toast({
        title: "Error",
        description: "Please add items to your order",
        variant: "destructive",
      });
      return;
    }

    const orderData = {
      customerName,
      tableNumber: orderType === 'on-site' ? tableNumber : undefined,
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        notes: item.notes || '',
      })),
      notes: orderNotes,
      orderType,
    };

    onCreateOrder(orderData);
    
    // Reset form
    setCart([]);
    setCustomerName('');
    setTableNumber('');
    setOrderNotes('');
    
    toast({
      title: t('messages.orderCreated'),
      description: `${t('order.total')}: €${getTotal().toFixed(2)}`,
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-screen">
      {/* Product Catalog */}
      <div className="lg:col-span-2 bg-white rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">{t('catalog.title')}</h2>
        
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => (
            <Button
              key={category.key}
              variant={selectedCategory === category.key ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.key)}
              className={selectedCategory === category.key ? "bg-green-500 hover:bg-green-600" : ""}
            >
              {t(`catalog.${category.key}`)} {category.count}
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
                    {t(`catalog.${item.category}`)}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg">€{item.price.toFixed(2)}</span>
                  <Button 
                    size="sm" 
                    onClick={() => addToCart(item)}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    {t('catalog.add')}
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
          <h2 className="text-xl font-bold">{t('order.title')}</h2>
        </div>

        {/* Order Type */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">{t('order.type')}</label>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant={orderType === 'on-site' ? "default" : "outline"}
              onClick={() => setOrderType('on-site')}
              className={orderType === 'on-site' ? "bg-green-500 hover:bg-green-600" : ""}
              size="sm"
            >
              {t('order.onSite')}
            </Button>
            <Button
              variant={orderType === 'delivery' ? "default" : "outline"}
              onClick={() => setOrderType('delivery')}
              className={orderType === 'delivery' ? "bg-green-500 hover:bg-green-600" : ""}
              size="sm"
            >
              {t('order.delivery')}
            </Button>
            <Button
              variant={orderType === 'pickup' ? "default" : "outline"}
              onClick={() => setOrderType('pickup')}
              className={orderType === 'pickup' ? "bg-green-500 hover:bg-green-600" : ""}
              size="sm"
            >
              {t('order.pickup')}
            </Button>
          </div>
        </div>

        {/* Table Selection (only for on-site orders) */}
        {orderType === 'on-site' && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">{t('order.tableNumber')}</label>
            <div className="grid grid-cols-5 gap-2">
              {tableNumbers.map((num) => (
                <Button
                  key={num}
                  variant={tableNumber === num.toString() ? "default" : "outline"}
                  onClick={() => setTableNumber(num.toString())}
                  className={tableNumber === num.toString() ? "bg-green-500 hover:bg-green-600" : ""}
                  size="sm"
                >
                  {num}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Customer Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">{t('order.customerName')}</label>
          <Input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder={t('order.customerName')}
          />
        </div>

        {/* Cart Items */}
        <div className="flex-1 max-h-64 overflow-y-auto mb-4">
          {cart.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>{t('order.noItemsInCart')}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {cart.map((item) => (
                <Card key={item.id} className="p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{item.name}</h4>
                      <p className="text-sm text-gray-600">€{item.price.toFixed(2)}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-600 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 p-0"
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 p-0"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    <span className="font-bold">€{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Order Notes */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">{t('order.orderNotes')}</label>
          <Textarea
            value={orderNotes}
            onChange={(e) => setOrderNotes(e.target.value)}
            placeholder={t('order.orderNotes')}
            rows={2}
          />
        </div>

        {/* Total and Create Order */}
        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xl font-bold">{t('order.total')}:</span>
            <span className="text-2xl font-bold text-green-600">€{getTotal().toFixed(2)}</span>
          </div>
          <Button 
            onClick={handleCreateOrder}
            className="w-full bg-green-500 hover:bg-green-600 text-white"
            disabled={cart.length === 0}
          >
            {t('order.createOrder')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default POSOrderSystem;
