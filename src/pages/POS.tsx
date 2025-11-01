import React from 'react';
import { useTranslation } from 'react-i18next';
import POSOrderSystem, { POSMenuItem } from '@/components/POSOrderSystem';
import LanguageSelector from '@/components/LanguageSelector';
import { useToast } from '@/hooks/use-toast';

const POS = () => {
  const { t } = useTranslation();
  const { toast } = useToast();

  // Sample menu items - in a real app, this would come from your API
  const menuItems: POSMenuItem[] = [
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

  const handleCreateOrder = (orderData: any) => {
    console.log('Creating order:', orderData);
    
    // Here you would typically send the order to your backend
    toast({
      title: t('messages.orderCreated'),
      description: `${orderData.items.length} items - €${orderData.items.reduce((total: number, item: any) => total + (item.quantity * item.price), 0).toFixed(2)}`,
    });
  };

  return (
    <div className="p-6">
      <POSOrderSystem 
        menuItems={menuItems}
        onCreateOrder={handleCreateOrder}
      />
    </div>
  );
};

export default POS;
