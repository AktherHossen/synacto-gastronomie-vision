
import React from 'react';
import { Button } from '@/components/ui/button';

interface OrderFormActionsProps {
  onCancel: () => void;
  isEditing: boolean;
}

const OrderFormActions: React.FC<OrderFormActionsProps> = ({ onCancel, isEditing }) => {
  return (
    <div className="flex justify-end space-x-2">
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button type="submit" style={{ backgroundColor: '#6B2CF5' }} className="text-white">
        {isEditing ? 'Update Order' : 'Create Order'}
      </Button>
    </div>
  );
};

export default OrderFormActions;
