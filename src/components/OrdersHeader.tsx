
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface OrdersHeaderProps {
  onNewOrder: () => void;
}

const OrdersHeader: React.FC<OrdersHeaderProps> = ({ onNewOrder }) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-4">
        <Link to="/">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('actions.back')} to Dashboard
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('nav.orders')}</h1>
          <p className="text-gray-600">Manage all your orders here</p>
        </div>
      </div>
      <Button 
        className="text-white" 
        style={{ backgroundColor: '#6B2CF5' }}
        onClick={onNewOrder}
      >
        <Plus className="w-4 h-4 mr-2" />
        {t('order.createOrder')}
      </Button>
    </div>
  );
};

export default OrdersHeader;
