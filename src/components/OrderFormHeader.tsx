
import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';

interface OrderFormHeaderProps {
  isEditing: boolean;
}

const OrderFormHeader: React.FC<OrderFormHeaderProps> = ({ isEditing }) => {
  return (
    <CardHeader>
      <CardTitle>{isEditing ? 'Edit Order' : 'Create New Order'}</CardTitle>
    </CardHeader>
  );
};

export default OrderFormHeader;
