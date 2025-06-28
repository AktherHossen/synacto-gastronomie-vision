
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import OrderCard, { Order } from '@/components/OrderCard';

interface OrdersListProps {
  filteredOrders: Order[];
  searchTerm: string;
  statusFilter: string;
  onView: (order: Order) => void;
  onEdit: (order: Order) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, newStatus: Order['status']) => void;
}

const OrdersList: React.FC<OrdersListProps> = ({
  filteredOrders,
  searchTerm,
  statusFilter,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  if (filteredOrders.length === 0) {
    return (
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
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredOrders.map((order) => (
        <OrderCard
          key={order.id}
          order={order}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  );
};

export default OrdersList;
