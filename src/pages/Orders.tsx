
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const Orders = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
              <p className="text-gray-600">Manage all your orders here</p>
            </div>
          </div>
          <Button className="text-white" style={{ backgroundColor: '#6B2CF5' }}>
            <Plus className="w-4 h-4 mr-2" />
            New Order
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Order Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Orders page is under construction</p>
              <p className="text-gray-400 mt-2">This will contain order management functionality</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Orders;
