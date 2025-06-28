
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, Trash2, Clock, CheckCircle, XCircle } from 'lucide-react';

export interface Order {
  id: string;
  orderNumber: string;
  customerName?: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  createdAt: Date;
  tableNumber?: string;
  notes?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
}

interface OrderCardProps {
  order: Order;
  onView: (order: Order) => void;
  onEdit: (order: Order) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: Order['status']) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ 
  order, 
  onView, 
  onEdit, 
  onDelete, 
  onStatusChange 
}) => {
  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'preparing': return 'bg-blue-100 text-blue-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending': return Clock;
      case 'preparing': return Clock;
      case 'ready': return CheckCircle;
      case 'completed': return CheckCircle;
      case 'cancelled': return XCircle;
      default: return Clock;
    }
  };

  const StatusIcon = getStatusIcon(order.status);

  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">#{order.orderNumber}</CardTitle>
            {order.customerName && (
              <p className="text-sm text-gray-600 mt-1">{order.customerName}</p>
            )}
            {order.tableNumber && (
              <p className="text-sm text-gray-600">Table {order.tableNumber}</p>
            )}
          </div>
          <div className="flex space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView(order)}
              className="h-8 w-8 p-0"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(order)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(order.id)}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <Badge className={`text-xs ${getStatusColor(order.status)}`}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Badge>
          <p className="text-xs text-gray-500">
            {order.createdAt.toLocaleDateString()} {order.createdAt.toLocaleTimeString()}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-sm text-gray-600">
            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
          </div>
          <div className="text-xl font-bold text-purple-600">
            €{order.totalAmount.toFixed(2)}
          </div>
          {order.notes && (
            <p className="text-sm text-gray-500 italic line-clamp-2">{order.notes}</p>
          )}
        </div>
        
        <div className="mt-4 flex flex-wrap gap-1">
          {order.status === 'pending' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onStatusChange(order.id, 'preparing')}
              className="text-xs"
            >
              Start Preparing
            </Button>
          )}
          {order.status === 'preparing' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onStatusChange(order.id, 'ready')}
              className="text-xs"
            >
              Mark Ready
            </Button>
          )}
          {order.status === 'ready' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onStatusChange(order.id, 'completed')}
              className="text-xs"
            >
              Complete
            </Button>
          )}
          {(order.status === 'pending' || order.status === 'preparing') && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onStatusChange(order.id, 'cancelled')}
              className="text-xs text-red-600 hover:text-red-700"
            >
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderCard;
