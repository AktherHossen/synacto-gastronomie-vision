
import React from 'react';

interface OrderTotalSectionProps {
  total: number;
}

const OrderTotalSection: React.FC<OrderTotalSectionProps> = ({ total }) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex justify-between items-center text-lg font-semibold">
        <span>Total:</span>
        <span className="text-purple-600">€{total.toFixed(2)}</span>
      </div>
    </div>
  );
};

export default OrderTotalSection;
