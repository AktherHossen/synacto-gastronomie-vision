
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Order } from '@/components/OrderCard';
import { useTranslation } from 'react-i18next';

interface OrdersStatsProps {
  orders: Order[];
}

const OrdersStats: React.FC<OrdersStatsProps> = ({ orders }) => {
  const { t } = useTranslation();

  const getStatusCount = (status: Order['status']) => 
    orders.filter(order => order.status === status).length;

  const statsData = [
    { status: 'pending', count: getStatusCount('pending'), color: 'text-yellow-600' },
    { status: 'preparing', count: getStatusCount('preparing'), color: 'text-blue-600' },
    { status: 'ready', count: getStatusCount('ready'), color: 'text-green-600' },
    { status: 'completed', count: getStatusCount('completed'), color: 'text-gray-600' },
    { status: 'cancelled', count: getStatusCount('cancelled'), color: 'text-red-600' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
      {statsData.map(({ status, count, color }) => (
        <Card key={status}>
          <CardContent className="p-4">
            <div className="text-center">
              <p className={`text-2xl font-bold ${color}`}>{count}</p>
              <p className="text-sm text-gray-600">{t(`status.${status}`)}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default OrdersStats;
